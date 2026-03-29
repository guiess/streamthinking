/**
 * Gateway waypoint integration tests.
 *
 * Tests waypoint message handling through the full WebSocket gateway:
 * waypoint-add, waypoint-remove, waypoint-reorder messages are stored
 * in session state, broadcast to other clients, and included in state-sync.
 *
 * @module
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import WebSocket from 'ws';
import { createGateway } from '../server.js';

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

function waitForMessage(ws: WebSocket, timeoutMs = 2000): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for message')), timeoutMs);
    ws.once('message', (data) => {
      clearTimeout(timer);
      resolve(JSON.parse(data.toString()));
    });
  });
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
        if (typeof a === 'object' && a !== null) port = a.port;
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

describe('Gateway Waypoint Messages', () => {
  /** Helper: create a session and join both clients to it. */
  async function setupTwoClients() {
    const client1 = await connectClient();
    const client2 = await connectClient();

    // Client 1 creates session
    send(client1, { type: 'create-session', auth: { apiKey: TEST_API_KEY } });
    const created = await waitForMessage(client1);
    expect(created.type).toBe('session-created');
    const sessionId = created.sessionId as string;

    // Client 2 joins
    send(client2, { type: 'join', sessionId, auth: { apiKey: TEST_API_KEY } });
    const synced = await waitForMessage(client2);
    expect(synced.type).toBe('state-sync');

    return { client1, client2, sessionId };
  }

  it('broadcasts waypoint-add to other clients', async () => {
    const { client1, client2 } = await setupTwoClients();

    send(client1, {
      type: 'waypoint-add',
      waypoint: { x: 100, y: 200, zoom: 1.5, label: 'Overview' },
    });

    const msg = await waitForMessage(client2);
    expect(msg.type).toBe('waypoint-add');
    expect(msg.waypoint).toEqual({ x: 100, y: 200, zoom: 1.5, label: 'Overview' });
  });

  it('stores waypoints in session and includes them in state-sync', async () => {
    const { client1, sessionId } = await setupTwoClients();

    // Add two waypoints
    send(client1, {
      type: 'waypoint-add',
      waypoint: { x: 0, y: 0, zoom: 1, label: 'Start' },
    });
    send(client1, {
      type: 'waypoint-add',
      waypoint: { x: 500, y: 500, zoom: 2, label: 'Detail' },
    });

    // Wait a bit for processing
    await new Promise((r) => setTimeout(r, 100));

    // New client joins — should receive waypoints in state-sync
    const client3 = await connectClient();
    send(client3, { type: 'join', sessionId, auth: { apiKey: TEST_API_KEY } });

    const sync = await waitForMessage(client3);
    expect(sync.type).toBe('state-sync');
    expect(sync.waypoints).toEqual([
      { x: 0, y: 0, zoom: 1, label: 'Start' },
      { x: 500, y: 500, zoom: 2, label: 'Detail' },
    ]);
  });

  it('broadcasts waypoint-remove to other clients', async () => {
    const { client1, client2 } = await setupTwoClients();

    // Add a waypoint
    send(client1, {
      type: 'waypoint-add',
      waypoint: { x: 100, y: 200, zoom: 1 },
    });
    await waitForMessage(client2); // consume add broadcast

    // Remove it
    send(client1, { type: 'waypoint-remove', index: 0 });
    const msg = await waitForMessage(client2);
    expect(msg.type).toBe('waypoint-remove');
    expect(msg.index).toBe(0);
  });

  it('broadcasts waypoint-reorder to other clients', async () => {
    const { client1, client2 } = await setupTwoClients();

    // Add two waypoints
    send(client1, {
      type: 'waypoint-add',
      waypoint: { x: 0, y: 0, zoom: 1, label: 'A' },
    });
    await waitForMessage(client2);
    send(client1, {
      type: 'waypoint-add',
      waypoint: { x: 100, y: 100, zoom: 2, label: 'B' },
    });
    await waitForMessage(client2);

    // Reorder
    send(client1, { type: 'waypoint-reorder', fromIndex: 0, toIndex: 1 });
    const msg = await waitForMessage(client2);
    expect(msg.type).toBe('waypoint-reorder');
    expect(msg.fromIndex).toBe(0);
    expect(msg.toIndex).toBe(1);
  });

  it('rejects waypoint-add when not in session', async () => {
    const client = await connectClient();
    send(client, {
      type: 'waypoint-add',
      waypoint: { x: 0, y: 0, zoom: 1 },
    });
    const msg = await waitForMessage(client);
    expect(msg.type).toBe('error');
    expect(msg.code).toBe('NOT_IN_SESSION');
  });

  it('rejects waypoint-add with invalid waypoint data', async () => {
    const client = await connectClient();
    send(client, { type: 'create-session', auth: { apiKey: TEST_API_KEY } });
    await waitForMessage(client); // session-created

    send(client, { type: 'waypoint-add', waypoint: { x: 'bad' } });
    const msg = await waitForMessage(client);
    expect(msg.type).toBe('error');
    expect(msg.code).toBe('INVALID_WAYPOINT');
  });

  it('ignores waypoint-remove for out-of-bounds index', async () => {
    const { client1, sessionId } = await setupTwoClients();

    // Remove with empty waypoints list — should not crash
    send(client1, { type: 'waypoint-remove', index: 5 });

    // Verify session is still valid — join a new client
    await new Promise((r) => setTimeout(r, 50));
    const client3 = await connectClient();
    send(client3, { type: 'join', sessionId, auth: { apiKey: TEST_API_KEY } });
    const sync = await waitForMessage(client3);
    expect(sync.type).toBe('state-sync');
    expect(sync.waypoints).toEqual([]);
  });
});
