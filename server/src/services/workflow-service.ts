/**
 * WorkflowService — YAML loading, validation, CRUD operations on workflow definitions
 * Phase 1: Core Engine
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';
import type { WorkflowDefinition, WorkflowACL, WorkflowAuditEvent } from '../types/workflow.js';
import { ValidationError } from '../types/workflow.js';
import { getWorkflowsDir } from '../utils/paths.js';
import { createLogger } from '../lib/logger.js';

const log = createLogger('workflow-service');
const WORKFLOW_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9-_]*$/;

export class WorkflowService {
  private workflowsDir: string;
  private cache: Map<string, WorkflowDefinition> = new Map();

  constructor(workflowsDir?: string) {
    this.workflowsDir = workflowsDir || getWorkflowsDir();
    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.workflowsDir, { recursive: true });
  }

  private normalizeWorkflowId(id: string): string {
    const trimmed = (id ?? '').trim();
    if (!trimmed) {
      throw new ValidationError('Workflow ID is required');
    }

    if (trimmed.includes('/') || trimmed.includes('\\') || trimmed.includes('..')) {
      throw new ValidationError('Workflow ID contains illegal path characters');
    }

    if (!WORKFLOW_ID_PATTERN.test(trimmed)) {
      throw new ValidationError(
        'Workflow ID must start with an alphanumeric character and may only contain letters, numbers, hyphen, or underscore'
      );
    }

    return trimmed;
  }

  /**
   * Load and parse a workflow YAML file
   */
  async loadWorkflow(id: string): Promise<WorkflowDefinition | null> {
    const normalizedId = this.normalizeWorkflowId(id);

    // Check cache first
    if (this.cache.has(normalizedId)) {
      return this.cache.get(normalizedId)!;
    }

    const filePath = path.join(this.workflowsDir, `${normalizedId}.yml`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const workflow = yaml.parse(content) as WorkflowDefinition;

      // Validate schema
      this.validateWorkflow(workflow);

      // Cache it
      this.cache.set(normalizedId, workflow);

      log.info({ workflowId: normalizedId, version: workflow.version }, 'Workflow loaded');
      return workflow;
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        log.debug({ workflowId: normalizedId }, 'Workflow not found');
        return null;
      }
      log.error({ workflowId: normalizedId, err }, 'Failed to load workflow');
      throw new ValidationError(`Invalid workflow YAML: ${err.message}`);
    }
  }

  /**
   * List all available workflows
   */
  async listWorkflows(): Promise<WorkflowDefinition[]> {
    const files = await fs.readdir(this.workflowsDir).catch(() => []);
    const workflows: WorkflowDefinition[] = [];

    for (const file of files) {
      if (!file.endsWith('.yml') && !file.endsWith('.yaml')) continue;

      const id = file.replace(/\.(yml|yaml)$/, '');
      const workflow = await this.loadWorkflow(id);
      if (workflow) {
        workflows.push(workflow);
      }
    }

    log.info({ count: workflows.length }, 'Listed workflows');
    return workflows;
  }

  /**
   * Save a workflow definition
   */
  async saveWorkflow(workflow: WorkflowDefinition): Promise<void> {
    this.validateWorkflow(workflow);

    const normalizedId = this.normalizeWorkflowId(workflow.id);
    const filePath = path.join(this.workflowsDir, `${normalizedId}.yml`);
    const content = yaml.stringify(workflow);

    await fs.writeFile(filePath, content, 'utf-8');

    // Update cache
    this.cache.set(normalizedId, workflow);

    log.info({ workflowId: normalizedId, version: workflow.version }, 'Workflow saved');
  }

  /**
   * Delete a workflow definition
   */
  async deleteWorkflow(id: string): Promise<void> {
    const normalizedId = this.normalizeWorkflowId(id);
    const filePath = path.join(this.workflowsDir, `${normalizedId}.yml`);
    await fs.unlink(filePath);
    this.cache.delete(normalizedId);

    log.info({ workflowId: normalizedId }, 'Workflow deleted');
  }

  /**
   * Validate workflow definition against schema
   */
  private validateWorkflow(workflow: WorkflowDefinition): void {
    // Required fields
    if (!workflow.id || !workflow.name || workflow.version === undefined) {
      throw new ValidationError('Workflow must have id, name, and version');
    }

    // Enforce safe ID characters (prevents path traversal)
    const normalizedId = this.normalizeWorkflowId(workflow.id);
    if (workflow.id !== normalizedId) {
      throw new ValidationError('Workflow ID contains invalid characters');
    }

    // At least one agent
    if (!workflow.agents || workflow.agents.length === 0) {
      throw new ValidationError('Workflow must define at least one agent');
    }

    // At least one step
    if (!workflow.steps || workflow.steps.length === 0) {
      throw new ValidationError('Workflow must define at least one step');
    }

    // Validate step references
    const agentIds = new Set(workflow.agents.map((a) => a.id));
    const stepIds = new Set(workflow.steps.map((s) => s.id));

    for (const step of workflow.steps) {
      // Agent steps must reference a valid agent
      if ((step.type === 'agent' || step.type === 'loop') && !agentIds.has(step.agent!)) {
        throw new ValidationError(`Step ${step.id} references unknown agent ${step.agent}`);
      }

      // retry_step must reference a valid step
      if (step.on_fail?.retry_step && !stepIds.has(step.on_fail.retry_step)) {
        throw new ValidationError(
          `Step ${step.id} retry_step references unknown step ${step.on_fail.retry_step}`
        );
      }

      // Loop verify_step must reference a valid step
      if (step.loop?.verify_step && !stepIds.has(step.loop.verify_step)) {
        throw new ValidationError(
          `Step ${step.id} verify_step references unknown step ${step.loop.verify_step}`
        );
      }
    }
  }

  /**
   * Load workflow ACL (access control list)
   */
  async loadACL(workflowId: string): Promise<WorkflowACL | null> {
    const aclPath = path.join(this.workflowsDir, '.acl.json');

    try {
      const content = await fs.readFile(aclPath, 'utf-8');
      const acls = JSON.parse(content) as Record<string, WorkflowACL>;
      return acls[workflowId] || null;
    } catch (err: any) {
      if (err.code === 'ENOENT') return null;
      throw err;
    }
  }

  /**
   * Save workflow ACL
   */
  async saveACL(acl: WorkflowACL): Promise<void> {
    const aclPath = path.join(this.workflowsDir, '.acl.json');

    let acls: Record<string, WorkflowACL> = {};

    try {
      const content = await fs.readFile(aclPath, 'utf-8');
      acls = JSON.parse(content);
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err;
    }

    acls[acl.workflowId] = acl;

    await fs.writeFile(aclPath, JSON.stringify(acls, null, 2), 'utf-8');

    log.info({ workflowId: acl.workflowId }, 'Workflow ACL saved');
  }

  /**
   * Audit workflow changes
   */
  async auditChange(event: WorkflowAuditEvent): Promise<void> {
    const auditPath = path.join(this.workflowsDir, '.audit.jsonl');
    const line = JSON.stringify(event) + '\n';
    await fs.appendFile(auditPath, line, 'utf-8');

    log.info({ event }, 'Workflow audit event logged');
  }

  /**
   * Clear the cache (useful for tests)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton
let workflowServiceInstance: WorkflowService | null = null;

export function getWorkflowService(): WorkflowService {
  if (!workflowServiceInstance) {
    workflowServiceInstance = new WorkflowService();
  }
  return workflowServiceInstance;
}
