/**
 * Excalidraw element builders for the MCP server.
 *
 * Creates Excalidraw-format elements that are sent via scene-update
 * messages to the gateway, which broadcasts them to the Excalidraw
 * editor running in the browser.
 *
 * @module
 */

import { nanoid } from 'nanoid';

/** Shared base properties for all Excalidraw elements. */
function baseProps(params: {
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor?: string;
  backgroundColor?: string;
}): Record<string, unknown> {
  return {
    id: nanoid(),
    x: params.x,
    y: params.y,
    width: params.width,
    height: params.height,
    angle: 0,
    strokeColor: params.strokeColor ?? '#1e1e1e',
    backgroundColor: params.backgroundColor ?? 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    roughness: 1,
    opacity: 100,
    isDeleted: false,
    boundElements: null,
    locked: false,
  };
}

export function createExcalidrawRectangle(params: {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  backgroundColor?: string;
  strokeColor?: string;
}): Record<string, unknown> {
  return {
    ...baseProps(params),
    type: 'rectangle',
    roundness: { type: 3 },
  };
}

export function createExcalidrawText(params: {
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  fontFamily?: number;
  width?: number;
  height?: number;
  containerId?: string;
}): Record<string, unknown> {
  return {
    ...baseProps({
      x: params.x,
      y: params.y,
      width: params.width ?? 100,
      height: params.height ?? 25,
    }),
    type: 'text',
    text: params.text,
    fontSize: params.fontSize ?? 20,
    fontFamily: params.fontFamily ?? 1,
    textAlign: 'center',
    verticalAlign: 'middle',
    containerId: params.containerId ?? null,
    originalText: params.text,
    autoResize: true,
  };
}

export function createExcalidrawArrow(params: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  label?: string;
}): Record<string, unknown> {
  return {
    ...baseProps({
      x: params.startX,
      y: params.startY,
      width: params.endX - params.startX,
      height: params.endY - params.startY,
    }),
    type: 'arrow',
    points: [
      [0, 0],
      [params.endX - params.startX, params.endY - params.startY],
    ],
    startBinding: null,
    endBinding: null,
    lastCommittedPoint: null,
    startArrowhead: null,
    endArrowhead: 'arrow',
  };
}

export function createExcalidrawEllipse(params: {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  backgroundColor?: string;
}): Record<string, unknown> {
  return {
    ...baseProps(params),
    type: 'ellipse',
  };
}

export function createExcalidrawDiamond(params: {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  backgroundColor?: string;
}): Record<string, unknown> {
  return {
    ...baseProps(params),
    type: 'diamond',
  };
}
