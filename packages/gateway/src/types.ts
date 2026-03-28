/**
 * Gateway type definitions.
 *
 * Defines the message protocol between WebSocket clients and the gateway server,
 * plus the server-side Session data structure.
 *
 * @module
 */

import type { WebSocket } from 'ws';
import type {
  VisualExpression,
  ProtocolOperation,
  AuthorInfo,
} from '@infinicanvas/protocol';

// ── Session ────────────────────────────────────────────────

/** Server-side session state for a collaborative canvas. */
export interface Session {
  /** Unique session identifier. */
  id: string;
  /** All expressions on the canvas, keyed by ID. */
  expressions: Record<string, VisualExpression>;
  /** Ordered list of expression IDs (z-order). */
  expressionOrder: string[];
  /** Connected WebSocket clients. */
  clients: Set<WebSocket>;
  /** Registered AI agents in this session. */
  agents: Map<string, AuthorInfo>;
  /** Unix timestamp (ms) when the session was created. */
  createdAt: number;
  /** Unix timestamp (ms) of the last activity in this session. */
  lastActivity: number;
}

// ── Client → Server Messages ──────────────────────────────

export interface CreateSessionMessage {
  type: 'create-session';
  auth: { apiKey: string };
}

export interface JoinMessage {
  type: 'join';
  sessionId: string;
  auth: { apiKey: string };
}

export interface OperationMessage {
  type: 'operation';
  operation: ProtocolOperation;
}

export interface LeaveMessage {
  type: 'leave';
}

/** Human user requesting an AI agent action on selected expressions. */
export interface AgentRequestMessage {
  type: 'agent-request';
  /** Unique request identifier for tracking. */
  requestId: string;
  /** Action requested: explain, extend, or diagram. */
  action: string;
  /** Context about selected expressions and suggested placement. */
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
  /** Human-readable prompt describing what the AI should do. */
  prompt: string;
}

export type ClientMessage =
  | CreateSessionMessage
  | JoinMessage
  | OperationMessage
  | LeaveMessage
  | AgentRequestMessage
  | IdentifyMessage;

/** Client identifies itself as an agent (sent after joining a session). */
export interface IdentifyMessage {
  type: 'identify';
  agent: AuthorInfo;
}

// ── Server → Client Messages ──────────────────────────────

export interface SessionCreatedMessage {
  type: 'session-created';
  sessionId: string;
}

export interface StateSyncMessage {
  type: 'state-sync';
  sessionId: string;
  expressions: VisualExpression[];
  expressionOrder: string[];
}

export interface OperationBroadcast {
  type: 'operation';
  operation: ProtocolOperation;
}

export interface AgentJoinedMessage {
  type: 'agent-joined';
  agent: AuthorInfo;
}

export interface AgentLeftMessage {
  type: 'agent-left';
  agentId: string;
}

export interface ErrorMessage {
  type: 'error';
  code: string;
  message: string;
}

export type ServerMessage =
  | SessionCreatedMessage
  | StateSyncMessage
  | OperationBroadcast
  | AgentJoinedMessage
  | AgentLeftMessage
  | ErrorMessage;
