/**
 * Unit tests for gateway agent-request message handling.
 *
 * Validates that agent-request messages are:
 * - Broadcast to other clients (not the sender)
 * - Rejected when client is not in a session
 * - Rejected when required fields are missing
 *
 * @module
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import WebSocket from 'ws';
import { createGateway } from '../server.js';
import type { ServerMessage } from '../types.js';

// ── Test Helpers ───────────────────────────────────────────

const TEST_API_KEY = 'test-key';
let port: number;
let gateway: ReturnType<typeof createGateway>;
let openClients: WebSocket[];

function connectClient(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    ws.on('open', () => {
      openClients.push(ws);
      resolve(ws);
    });
    ws.on('error', reject);
  });
}

function send(ws: WebSocket, message: unknown): void {
  ws.send(JSON.stringify(message));
}

function waitForMessage(ws: WebSocket, timeoutMs = 2000): Promise<ServerMessage> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for message')), timeoutMs);
    ws.once('message', (data) => {
      clearTimeout(timer);
      resolve(JSON.parse(data.toString()) as ServerMessage);
    });
  });
}

function createAgentRequest(overrides: Record<string, unknown> = {}) {
  return {
    type: 'agent-request',
    requestId: 'req-test-001',
    action: 'explain',
    context: {
      expressions: [{
        id: 'expr-1',
        kind: 'flowchart',
        label: 'Auth Flow',
        position: { x: 400, y: 100 },
        size: { width: 300, height: 200 },
        data: { kind: 'flowchart', title: 'Auth Flow' },
      }],
      suggestedPosition: { x: 400, y: 320 },
    },
    prompt: 'The user selected a flowchart titled "Auth Flow" and requested: Explain this.',
    ...overrides,
  };
}

// ── Setup / Teardown ───────────────────────────────────────

beforeAll(() => {
  process.env['INFINICANVAS_API_KEY'] = TEST_API_KEY;
});

afterAll(() => {
  delete process.env['INFINICANVAS_API_KEY'];
});

beforeEach(async () => {
  openClients = [];
  gateway = createGateway({ port: 0 });
  gateway.start();

  const addr = gateway.wss.address();
  if (typeof addr === 'object' && addr !== null) {
    port = addr.port;
  } else {
    await new Promise<void>((resolve) => {
      gateway.wss.on('listening', () => {
        const a = gateway.wss.address();
        if (typeof a === 'object' && a !== null) {
          port = a.port;
        }
        resolve();
      });
    });
  }
});

afterEach(async () => {
  for (const client of openClients) {
    if (client.readyState === WebSocket.OPEN || client.readyState === WebSocket.CONNECTING) {
      client.terminate();
    }
  }
  openClients = [];
  await gateway.stop();
});

// ── Tests ──────────────────────────────────────────────────

describe('Gateway agent-request handling', () => {
  it('broadcasts agent-request to other clients, not the sender', async () => {
    const client1 = await connectClient();
    const client2 = await connectClient();

    // Client 1 creates a session
    send(client1, { type: 'create-session', auth: { apiKey: TEST_API_KEY } });
    const created = await waitForMessage(client1);
    expect(created.type).toBe('session-created');
    if (created.type !== 'session-created') throw new Error('Expected session-created');
    const sessionId = created.sessionId;

    // Client 2 joins the session
    send(client2, { type: 'join', sessionId, auth: { apiKey: TEST_API_KEY } });
    const synced = await waitForMessage(client2);
    expect(synced.type).toBe('state-sync');

    // Collect messages for both clients
    const client1Messages: unknown[] = [];
    const client2Messages: unknown[] = [];
    client1.on('message', (data) => {
      client1Messages.push(JSON.parse(data.toString()));
    });
    client2.on('message', (data) => {
      client2Messages.push(JSON.parse(data.toString()));
    });

    // Client 1 sends agent-request
    send(client1, createAgentRequest());

    // Wait for broadcast
    await new Promise((r) => setTimeout(r, 200));

    // Client 2 should receive the agent-request
    expect(client2Messages.length).toBeGreaterThanOrEqual(1);
    const received = client2Messages[0] as Record<string, unknown>;
    expect(received.type).toBe('agent-request');
    expect(received.requestId).toBe('req-test-001');
    expect(received.action).toBe('explain');
    expect(received.prompt).toContain('Auth Flow');

    // Client 1 (sender) should NOT receive it back
    expect(client1Messages.length).toBe(0);
  });

  it('returns error when client is not in a session', async () => {
    const client1 = await connectClient();

    // Send agent-request without joining a session
    send(client1, createAgentRequest());
    const response = await waitForMessage(client1);

    expect(response.type).toBe('error');
    if (response.type === 'error') {
      expect(response.code).toBe('NOT_IN_SESSION');
    }
  });

  it('returns error when required fields are missing', async () => {
    const client1 = await connectClient();

    // Create session first
    send(client1, { type: 'create-session', auth: { apiKey: TEST_API_KEY } });
    await waitForMessage(client1);

    // Send agent-request without prompt
    send(client1, {
      type: 'agent-request',
      requestId: 'req-1',
      action: 'explain',
      context: { expressions: [], suggestedPosition: { x: 0, y: 0 } },
      // missing prompt
    });
    const response = await waitForMessage(client1);

    expect(response.type).toBe('error');
    if (response.type === 'error') {
      expect(response.code).toBe('INVALID_AGENT_REQUEST');
    }
  });

  it('relays full context including expressions and suggestedPosition', async () => {
    const client1 = await connectClient();
    const client2 = await connectClient();

    // Setup session
    send(client1, { type: 'create-session', auth: { apiKey: TEST_API_KEY } });
    const created = await waitForMessage(client1);
    if (created.type !== 'session-created') throw new Error('Expected session-created');

    send(client2, { type: 'join', sessionId: created.sessionId, auth: { apiKey: TEST_API_KEY } });
    await waitForMessage(client2);

    // Listen for messages on client2
    const receivedPromise = waitForMessage(client2);

    const request = createAgentRequest({
      action: 'diagram',
      context: {
        expressions: [
          { id: 'e1', kind: 'text', label: 'Notes', position: { x: 10, y: 20 }, size: { width: 100, height: 50 }, data: {} },
          { id: 'e2', kind: 'sticky-note', position: { x: 10, y: 80 }, size: { width: 100, height: 50 }, data: {} },
        ],
        suggestedPosition: { x: 10, y: 150 },
      },
    });
    send(client1, request);

    const received = await receivedPromise as unknown as Record<string, unknown>;
    expect(received.type).toBe('agent-request');
    expect(received.action).toBe('diagram');

    const context = received.context as Record<string, unknown>;
    const exprs = context.expressions as Array<Record<string, unknown>>;
    expect(exprs.length).toBe(2);
    expect(exprs[0]!.id).toBe('e1');
    expect(exprs[1]!.id).toBe('e2');
    expect(context.suggestedPosition).toEqual({ x: 10, y: 150 });
  });
});
