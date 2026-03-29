/**
 * Waypoint MCP tools — add and list camera bookmarks.
 *
 * Waypoints are camera positions saved for presentation-mode navigation.
 * The MCP server stores them in the gateway session (via waypoint messages)
 * so the browser and all agents share the same waypoint list.
 *
 * @module
 */

import type { IGatewayClient, CameraWaypoint } from '../gatewayClient.js';

/**
 * Add a camera waypoint to the session.
 *
 * Sends a `waypoint-add` message through the gateway, which stores it
 * in the session and broadcasts to all other clients.
 */
export function executeAddWaypoint(
  client: IGatewayClient,
  params: { x: number; y: number; zoom: number; label?: string },
): string {
  if (!client.isConnected()) {
    return 'Not connected to gateway — cannot add waypoint.';
  }

  const waypoint: CameraWaypoint = {
    x: params.x,
    y: params.y,
    zoom: params.zoom,
    label: params.label,
  };

  client.sendWaypointAdd(waypoint);

  const label = waypoint.label ? ` "${waypoint.label}"` : '';
  return `Waypoint${label} added at (${waypoint.x}, ${waypoint.y}) zoom ${waypoint.zoom}.`;
}

/**
 * List all camera waypoints in the current session.
 *
 * Returns the gateway client's cached waypoint list formatted as text.
 */
export function executeListWaypoints(client: IGatewayClient): string {
  const waypoints = client.getWaypoints();

  if (waypoints.length === 0) {
    return 'No waypoints saved. Use canvas_add_waypoint to create one.';
  }

  const lines = waypoints.map((wp, i) => {
    const label = wp.label ? ` "${wp.label}"` : '';
    return `${i + 1}.${label} — position (${wp.x}, ${wp.y}), zoom ${wp.zoom}`;
  });

  return `${waypoints.length} waypoint(s):\n\n${lines.join('\n')}`;
}

/**
 * Remove a waypoint by its 1-based index.
 *
 * Sends a `waypoint-remove` message through the gateway.
 */
export function executeRemoveWaypoint(
  client: IGatewayClient,
  params: { index: number },
): string {
  if (!client.isConnected()) {
    return 'Not connected to gateway — cannot remove waypoint.';
  }

  const waypoints = client.getWaypoints();
  const zeroIndex = params.index - 1; // Convert 1-based to 0-based

  if (zeroIndex < 0 || zeroIndex >= waypoints.length) {
    return `Invalid waypoint index ${params.index}. There are ${waypoints.length} waypoint(s).`;
  }

  const removed = waypoints[zeroIndex];
  client.sendWaypointRemove(zeroIndex);

  const label = removed?.label ? ` "${removed.label}"` : '';
  return `Waypoint ${params.index}${label} removed.`;
}
