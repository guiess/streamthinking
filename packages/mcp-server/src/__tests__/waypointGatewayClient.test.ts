/**
 * Unit tests for GatewayClient waypoint handling.
 *
 * Tests: waypoint cache from state-sync, remote waypoint-add/remove/reorder
 * messages, and sendWaypointAdd/Remove/Reorder methods.
 *
 * @module
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GatewayClient } from '../gatewayClient.js';

// ── Mock WebSocket ──────────────────────────────────────────

type MessageCallback = (raw: { toString(): string }) => void;
type OpenCallback = () => void;

class MockWS {
  static readonly OPEN = 1;
  static readonly CLOSED = 3;

  readyState = MockWS.OPEN;
  private handlers: Record<string, ((...args: unknown[]) => void)[]> = {};
  sentMessages: string[] = [];

  on(event: string, cb: (...args: unknown[]) => void): void {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event]!.push(cb);
  }

  removeListener(_event: string, _cb: unknown): void {
    // No-op for tests
  }

  send(data: string): void {
    this.sentMessages.push(data);
  }

  close(): void {
    this.readyState = MockWS.CLOSED;
  }

  simulateOpen(): void {
    this.readyState = MockWS.OPEN;
    const openHandlers = this.handlers['open'] ?? [];
    for (const cb of openHandlers) (cb as OpenCallback)();
  }

  simulateMessage(data: unknown): void {
    const messageHandlers = this.handlers['message'] ?? [];
    const raw = { toString: () => JSON.stringify(data) };
    for (const cb of messageHandlers) (cb as MessageCallback)(raw);
  }
}

let mockWs: MockWS;

vi.mock('ws', () => {
  return {
    default: class {
      constructor() {
        return mockWs;
      }
      static OPEN = 1;
      static CLOSED = 3;
    },
  };
});

beforeEach(() => {
  mockWs = new MockWS();
});

// ── Helpers ─────────────────────────────────────────────────

async function connectClient(): Promise<GatewayClient> {
  const client = new GatewayClient({ url: 'ws://localhost:8080' });
  const p = client.connect();
  mockWs.simulateOpen();
  mockWs.simulateMessage({ type: 'session-created', sessionId: 'sess-1' });
  await p;
  return client;
}

async function connectClientWithSync(waypoints: Array<{ x: number; y: number; zoom: number; label?: string }> = []): Promise<GatewayClient> {
  const client = new GatewayClient({
    url: 'ws://localhost:8080',
    sessionId: 'existing-session',
  });
  const p = client.connect();
  mockWs.simulateOpen();
  mockWs.simulateMessage({
    type: 'state-sync',
    sessionId: 'existing-session',
    expressions: [],
    expressionOrder: [],
    waypoints,
  });
  await p;
  return client;
}

// ── Tests ──────────────────────────────────────────────────

describe('GatewayClient waypoint handling', () => {
  it('initializes waypoints as empty array', async () => {
    const client = await connectClient();
    expect(client.getWaypoints()).toEqual([]);
    client.disconnect();
  });

  it('loads waypoints from state-sync', async () => {
    const client = await connectClientWithSync([
      { x: 0, y: 0, zoom: 1, label: 'Home' },
      { x: 500, y: 500, zoom: 2 },
    ]);

    const wps = client.getWaypoints();
    expect(wps).toHaveLength(2);
    expect(wps[0]).toEqual({ x: 0, y: 0, zoom: 1, label: 'Home' });
    expect(wps[1]).toEqual({ x: 500, y: 500, zoom: 2 });

    client.disconnect();
  });

  it('handles missing waypoints in state-sync gracefully', async () => {
    const client = new GatewayClient({
      url: 'ws://localhost:8080',
      sessionId: 'no-wp-session',
    });
    const p = client.connect();
    mockWs.simulateOpen();
    mockWs.simulateMessage({
      type: 'state-sync',
      sessionId: 'no-wp-session',
      expressions: [],
      expressionOrder: [],
      // no waypoints field
    });
    await p;

    expect(client.getWaypoints()).toEqual([]);
    client.disconnect();
  });

  it('updates cache on remote waypoint-add', async () => {
    const client = await connectClient();

    mockWs.simulateMessage({
      type: 'waypoint-add',
      waypoint: { x: 100, y: 200, zoom: 1.5, label: 'New' },
    });

    expect(client.getWaypoints()).toEqual([
      { x: 100, y: 200, zoom: 1.5, label: 'New' },
    ]);

    client.disconnect();
  });

  it('updates cache on remote waypoint-remove', async () => {
    const client = await connectClientWithSync([
      { x: 0, y: 0, zoom: 1, label: 'A' },
      { x: 100, y: 100, zoom: 2, label: 'B' },
    ]);

    mockWs.simulateMessage({ type: 'waypoint-remove', index: 0 });

    const wps = client.getWaypoints();
    expect(wps).toHaveLength(1);
    expect(wps[0]!.label).toBe('B');

    client.disconnect();
  });

  it('updates cache on remote waypoint-reorder', async () => {
    const client = await connectClientWithSync([
      { x: 0, y: 0, zoom: 1, label: 'A' },
      { x: 100, y: 100, zoom: 2, label: 'B' },
      { x: 200, y: 200, zoom: 3, label: 'C' },
    ]);

    mockWs.simulateMessage({ type: 'waypoint-reorder', fromIndex: 0, toIndex: 2 });

    const wps = client.getWaypoints();
    expect(wps.map((w) => w.label)).toEqual(['B', 'C', 'A']);

    client.disconnect();
  });

  it('ignores waypoint-remove with out-of-bounds index', async () => {
    const client = await connectClientWithSync([
      { x: 0, y: 0, zoom: 1, label: 'Only' },
    ]);

    mockWs.simulateMessage({ type: 'waypoint-remove', index: 5 });
    expect(client.getWaypoints()).toHaveLength(1);

    client.disconnect();
  });

  it('sendWaypointAdd sends message and updates local cache', async () => {
    const client = await connectClient();

    client.sendWaypointAdd({ x: 50, y: 60, zoom: 1.2, label: 'Test' });

    // Check local cache
    expect(client.getWaypoints()).toEqual([
      { x: 50, y: 60, zoom: 1.2, label: 'Test' },
    ]);

    // Check sent message
    const sent = mockWs.sentMessages.map((s) => JSON.parse(s));
    const waypointMsg = sent.find((m) => m.type === 'waypoint-add');
    expect(waypointMsg).toBeDefined();
    expect(waypointMsg.waypoint).toEqual({ x: 50, y: 60, zoom: 1.2, label: 'Test' });

    client.disconnect();
  });

  it('sendWaypointRemove sends message and updates local cache', async () => {
    const client = await connectClientWithSync([
      { x: 0, y: 0, zoom: 1, label: 'A' },
      { x: 100, y: 100, zoom: 2, label: 'B' },
    ]);

    client.sendWaypointRemove(0);

    expect(client.getWaypoints()).toHaveLength(1);
    expect(client.getWaypoints()[0]!.label).toBe('B');

    const sent = mockWs.sentMessages.map((s) => JSON.parse(s));
    const removeMsg = sent.find((m) => m.type === 'waypoint-remove');
    expect(removeMsg).toBeDefined();
    expect(removeMsg.index).toBe(0);

    client.disconnect();
  });

  it('sendWaypointReorder sends message and updates local cache', async () => {
    const client = await connectClientWithSync([
      { x: 0, y: 0, zoom: 1, label: 'A' },
      { x: 100, y: 100, zoom: 2, label: 'B' },
    ]);

    client.sendWaypointReorder(0, 1);

    const wps = client.getWaypoints();
    expect(wps.map((w) => w.label)).toEqual(['B', 'A']);

    const sent = mockWs.sentMessages.map((s) => JSON.parse(s));
    const reorderMsg = sent.find((m) => m.type === 'waypoint-reorder');
    expect(reorderMsg).toBeDefined();
    expect(reorderMsg.fromIndex).toBe(0);
    expect(reorderMsg.toIndex).toBe(1);

    client.disconnect();
  });

  it('getWaypoints returns a copy (not a reference)', async () => {
    const client = await connectClientWithSync([
      { x: 0, y: 0, zoom: 1, label: 'A' },
    ]);

    const wps1 = client.getWaypoints();
    const wps2 = client.getWaypoints();
    expect(wps1).not.toBe(wps2); // different array instances

    client.disconnect();
  });

  it('clears waypoints on disconnect', async () => {
    const client = await connectClientWithSync([
      { x: 0, y: 0, zoom: 1, label: 'A' },
    ]);

    client.disconnect();
    expect(client.getWaypoints()).toEqual([]);
  });
});
