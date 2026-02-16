#!/usr/bin/env bash
set -euo pipefail

# Arguments from scripts/openclaw-pickup.mjs
TASK_ID="${1:-}"
ATTEMPT_ID="${2:-}"
PROMPT_FILE="${3:-}"
CALLBACK_URL="${4:-}"

if [[ -z "${TASK_ID}" || -z "${ATTEMPT_ID}" || -z "${PROMPT_FILE}" || -z "${CALLBACK_URL}" ]]; then
  echo "Usage: $0 <task_id> <attempt_id> <prompt_file> <callback_url>" >&2
  exit 1
fi

echo "[openclaw-adapter] task=${TASK_ID} attempt=${ATTEMPT_ID}"
echo "[openclaw-adapter] prompt file: ${PROMPT_FILE}"
echo "[openclaw-adapter] callback: ${CALLBACK_URL}"

# Replace this block with your real OpenClaw sessions_spawn invocation.
# Example shape (pseudo):
# openclaw sessions spawn \
#   --agent veritas \
#   --task-id "${TASK_ID}" \
#   --attempt-id "${ATTEMPT_ID}" \
#   --prompt-file "${PROMPT_FILE}"
#
# The spawned agent should call:
#   curl -X POST "${CALLBACK_URL}" \
#     -H 'Content-Type: application/json' \
#     -d '{"success":true,"summary":"..."}'

echo "[openclaw-adapter] dry-run only: no sessions spawned"
