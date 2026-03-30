/**
 * useAgentActionHandler — bridges AgentActions UI events to the gateway.
 *
 * Listens for `infinicanvas:agent-action` CustomEvents on `window`,
 * constructs a human-readable prompt with expression context, and sends
 * an `agent-request` message through the gateway WebSocket connection.
 *
 * Manages a `pendingRequest` flag that clears when a new agent-authored
 * expression appears in the canvas store.
 *
 * @module
 */

import { useState, useEffect, useRef } from 'react';
import { useCanvasStore } from '@infinicanvas/engine';
import type { VisualExpression } from '@infinicanvas/protocol';
import type { AgentActionType } from '../components/toolbar/AgentActions.js';

// ── Types ──────────────────────────────────────────────────

/** Payload emitted by AgentActions via CustomEvent detail. */
export interface AgentActionEventDetail {
  action: AgentActionType;
  expressions: VisualExpression[];
}

/** Shape of the agent-request message sent to gateway. */
export interface AgentRequestPayload {
  type: 'agent-request';
  requestId: string;
  action: string;
  context: {
    expressions: Array<{
      id: string;
      kind: string;
      label?: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
      data: unknown;
    }>;
    suggestedPosition: { x: number; y: number };
  };
  prompt: string;
}

/** Return value of useAgentActionHandler. */
export interface AgentActionHandlerState {
  /** Whether an agent request is pending (waiting for AI response). */
  isLoading: boolean;
}

// ── Pure helpers (exported for testing) ────────────────────

/** Generate a simple unique ID without external dependencies. */
export function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Extract a human-readable label from an expression.
 *
 * Checks common data shapes (title, content, text, label, centralTopic,
 * question) and returns the first non-empty string found.
 */
export function extractLabel(expr: VisualExpression): string | undefined {
  const d = expr.data as unknown as Record<string, unknown>;
  for (const key of ['title', 'content', 'text', 'label', 'centralTopic', 'question']) {
    if (typeof d[key] === 'string' && d[key]) {
      return d[key] as string;
    }
  }
  return undefined;
}

/**
 * Calculate the suggested position for the AI response.
 *
 * Places it below the bounding box of all selected expressions,
 * offset by 20px vertical padding. [CLEAN-CODE]
 */
export function calculateSuggestedPosition(
  expressions: VisualExpression[],
): { x: number; y: number } {
  if (expressions.length === 0) {
    return { x: 100, y: 100 };
  }

  let minX = Infinity;
  let maxY = -Infinity;

  for (const expr of expressions) {
    if (expr.position.x < minX) {
      minX = expr.position.x;
    }
    const bottom = expr.position.y + expr.size.height;
    if (bottom > maxY) {
      maxY = bottom;
    }
  }

  return { x: minX, y: maxY + 20 };
}

/**
 * Build a human-readable prompt for the AI model.
 *
 * Describes the selected expressions, their context, and what the human
 * is requesting. The AI model uses this to decide which MCP canvas tools
 * to call. [CLEAN-CODE][SRP]
 */
export function buildPrompt(
  action: AgentActionType,
  expressions: VisualExpression[],
  suggestedPosition: { x: number; y: number },
): string {
  const exprDescriptions = expressions.map((expr) => {
    const label = extractLabel(expr);
    const labelStr = label ? ` titled "${label}"` : '';
    return `a ${expr.kind}${labelStr} at position (${expr.position.x}, ${expr.position.y})`;
  });

  const selectionText =
    exprDescriptions.length === 1
      ? exprDescriptions[0]
      : exprDescriptions.join(', ');

  switch (action) {
    case 'explain':
      return (
        `The user selected ${selectionText} and requested: Explain this. ` +
        `Add a text annotation or sticky note near position (${suggestedPosition.x}, ${suggestedPosition.y}) ` +
        `explaining what it represents and how it works.`
      );

    case 'extend':
      return (
        `The user selected ${selectionText} and requested: Extend this. ` +
        `Add more elements, nodes, or detail to expand on the selected content. ` +
        `Place new elements near position (${suggestedPosition.x}, ${suggestedPosition.y}).`
      );

    case 'diagram':
      return (
        `The user selected ${selectionText} and requested: Diagram this. ` +
        `Create a visual diagram (flowchart, mind map, or sequence diagram) based on the text content. ` +
        `Place the diagram near position (${suggestedPosition.x}, ${suggestedPosition.y}).`
      );
  }
}

/**
 * Build the full agent-request payload from action event detail.
 *
 * Pure function — no side effects. [CLEAN-CODE][SRP]
 */
export function buildAgentRequest(
  detail: AgentActionEventDetail,
): AgentRequestPayload {
  const { action, expressions } = detail;
  const suggestedPosition = calculateSuggestedPosition(expressions);

  return {
    type: 'agent-request',
    requestId: generateRequestId(),
    action,
    context: {
      expressions: expressions.map((expr) => ({
        id: expr.id,
        kind: expr.kind,
        label: extractLabel(expr),
        position: expr.position,
        size: expr.size,
        data: expr.data,
      })),
      suggestedPosition,
    },
    prompt: buildPrompt(action, expressions, suggestedPosition),
  };
}

// ── Hook ───────────────────────────────────────────────────

/**
 * React hook that handles agent action events from the UI.
 *
 * - Listens for `infinicanvas:agent-action` events on window
 * - Constructs and sends `agent-request` messages via gateway
 * - Tracks pending request state for loading indicator
 * - Clears pending state when agent-authored expressions appear
 *
 * @param sendMessage - Function to send messages through gateway WebSocket
 * @param connected - Whether the gateway is currently connected
 */
export function useAgentActionHandler(
  sendMessage: (message: Record<string, unknown>) => void,
  connected: boolean,
): AgentActionHandlerState {
  const [isLoading, setIsLoading] = useState(false);
  const pendingRequestIdRef = useRef<string | null>(null);

  // ── Listen for agent-action events ──────────────────────

  useEffect(() => {
    function handleAgentAction(event: Event): void {
      const customEvent = event as CustomEvent<AgentActionEventDetail>;
      const detail = customEvent.detail;

      if (!detail?.action || !detail?.expressions?.length) {
        return; // No valid action or no expressions selected
      }

      if (!connected) {
        return; // Can't send without a connection
      }

      const payload = buildAgentRequest(detail);
      pendingRequestIdRef.current = payload.requestId;
      setIsLoading(true);

      sendMessage(payload as unknown as Record<string, unknown>);
    }

    window.addEventListener('infinicanvas:agent-action', handleAgentAction);
    return () => {
      window.removeEventListener('infinicanvas:agent-action', handleAgentAction);
    };
  }, [sendMessage, connected]);

  // ── Watch for agent-authored expressions (response arrived) ─

  useEffect(() => {
    const unsubscribe = useCanvasStore.subscribe((state, prevState) => {
      if (!pendingRequestIdRef.current) return;

      // Check if new expressions were added by an agent
      const prevIds = new Set(Object.keys(prevState.expressions));
      for (const id of Object.keys(state.expressions)) {
        if (!prevIds.has(id)) {
          const expr = state.expressions[id];
          if (expr?.meta?.author?.type === 'agent') {
            // Agent responded — clear loading state
            pendingRequestIdRef.current = null;
            setIsLoading(false);
            return;
          }
        }
      }
    });

    return unsubscribe;
  }, []);

  // ── Safety timeout: clear loading after 30s ─────────────

  useEffect(() => {
    if (!isLoading) return;

    const timer = setTimeout(() => {
      pendingRequestIdRef.current = null;
      setIsLoading(false);
    }, 30_000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  return { isLoading };
}
