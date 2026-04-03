/**
 * Primitive expression tools for the MCP server.
 *
 * These tools create basic visual elements on the canvas:
 * rectangles, ellipses, lines, arrows, text, and sticky notes.
 *
 * @module
 */

import type {
  VisualExpression,
  ExpressionStyle,
  RectangleData,
  EllipseData,
  LineData,
  ArrowData,
  TextData,
  StickyNoteData,
} from '@infinicanvas/protocol';
import { DEFAULT_TEXT, randomStickyColor } from '../defaults.js';
import { buildExpression } from '../expressionFactory.js';
import type { IGatewayClient } from '../gatewayClient.js';
import {
  createExcalidrawRectangle,
  createExcalidrawEllipse,
  createExcalidrawArrow,
  createExcalidrawText,
} from './excalidrawBuilder.js';

// ── Tool parameter types ───────────────────────────────────

export interface DrawRectangleParams {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  strokeColor?: string;
  backgroundColor?: string;
  fillStyle?: ExpressionStyle['fillStyle'];
}

export interface DrawEllipseParams {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface DrawLineParams {
  points: [number, number][];
}

export interface DrawArrowParams {
  points: [number, number][];
  label?: string;
  endArrowhead?: boolean;
  startArrowhead?: boolean;
}

export interface DrawTextParams {
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface AddStickyNoteParams {
  x: number;
  y: number;
  text: string;
  color?: string;
  width?: number;
  height?: number;
}

// ── Tool implementations ───────────────────────────────────

/** Create a rectangle expression on the canvas. */
export function buildRectangle(params: DrawRectangleParams): VisualExpression {
  const data: RectangleData = {
    kind: 'rectangle',
    label: params.label,
  };

  const styleOverrides: Partial<ExpressionStyle> = {};
  if (params.strokeColor) styleOverrides.strokeColor = params.strokeColor;
  if (params.backgroundColor) styleOverrides.backgroundColor = params.backgroundColor;
  if (params.fillStyle) styleOverrides.fillStyle = params.fillStyle;

  return buildExpression(
    'rectangle',
    { x: params.x, y: params.y },
    { width: params.width, height: params.height },
    data,
    styleOverrides,
  );
}

/** Create an ellipse expression on the canvas. */
export function buildEllipse(params: DrawEllipseParams): VisualExpression {
  const data: EllipseData = {
    kind: 'ellipse',
    label: params.label,
  };

  return buildExpression(
    'ellipse',
    { x: params.x, y: params.y },
    { width: params.width, height: params.height },
    data,
  );
}

/** Create a line expression on the canvas. */
export function buildLine(params: DrawLineParams): VisualExpression {
  if (params.points.length < 2) {
    throw new Error('Line requires at least 2 points');
  }

  const data: LineData = {
    kind: 'line',
    points: params.points,
  };

  // Compute bounding box from points
  const xs = params.points.map((p) => p[0]);
  const ys = params.points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return buildExpression(
    'line',
    { x: minX, y: minY },
    { width: Math.max(maxX - minX, 1), height: Math.max(maxY - minY, 1) },
    data,
  );
}

/** Create an arrow expression on the canvas. */
export function buildArrow(params: DrawArrowParams): VisualExpression {
  if (params.points.length < 2) {
    throw new Error('Arrow requires at least 2 points');
  }

  const data: ArrowData = {
    kind: 'arrow',
    points: params.points,
    endArrowhead: params.endArrowhead !== false ? 'triangle' : 'none',
    startArrowhead: params.startArrowhead ? 'triangle' : 'none',
    label: params.label,
  };

  // Compute bounding box from points
  const xs = params.points.map((p) => p[0]);
  const ys = params.points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return buildExpression(
    'arrow',
    { x: minX, y: minY },
    { width: Math.max(maxX - minX, 1), height: Math.max(maxY - minY, 1) },
    data,
  );
}

/** Create a text expression on the canvas. */
export function buildText(params: DrawTextParams): VisualExpression {
  const data: TextData = {
    kind: 'text',
    text: params.text,
    fontSize: params.fontSize ?? DEFAULT_TEXT.fontSize,
    fontFamily: params.fontFamily ?? DEFAULT_TEXT.fontFamily,
    textAlign: params.textAlign ?? DEFAULT_TEXT.textAlign,
  };

  // Estimate text size based on content
  const fontSize = params.fontSize ?? DEFAULT_TEXT.fontSize;
  const estimatedWidth = Math.max(params.text.length * fontSize * 0.6, 100);
  const estimatedHeight = fontSize * 1.5;

  return buildExpression(
    'text',
    { x: params.x, y: params.y },
    { width: estimatedWidth, height: estimatedHeight },
    data,
    { fontSize, fontFamily: params.fontFamily ?? DEFAULT_TEXT.fontFamily },
  );
}

/** Create a sticky note expression on the canvas. */
export function buildStickyNote(params: AddStickyNoteParams): VisualExpression {
  const color = params.color ?? randomStickyColor();

  const data: StickyNoteData = {
    kind: 'sticky-note',
    text: params.text,
    color,
  };

  return buildExpression(
    'sticky-note',
    { x: params.x, y: params.y },
    { width: params.width ?? 200, height: params.height ?? 200 },
    data,
    { backgroundColor: color, fillStyle: 'solid' },
  );
}

// ── Tool executors (send to gateway) ───────────────────────

/** Execute a primitive tool: build expression and send to gateway. */
export async function executeDrawRectangle(
  client: IGatewayClient,
  params: DrawRectangleParams,
): Promise<string> {
  const expr = buildRectangle(params);
  await client.sendCreate(expr);

  // Also send as Excalidraw element for the new editor
  const existingElements = client.getExcalidrawElements();
  const excalRect = createExcalidrawRectangle({
    x: params.x, y: params.y, width: params.width, height: params.height,
    label: params.label, backgroundColor: params.backgroundColor,
  });
  const elements = [...existingElements, excalRect];
  if (params.label) {
    const textEl = createExcalidrawText({
      x: params.x + params.width / 2 - 50,
      y: params.y + params.height / 2 - 12,
      text: params.label,
      containerId: excalRect.id as string,
    });
    (excalRect as Record<string, unknown>).boundElements = [{ id: textEl.id, type: 'text' }];
    elements.push(textEl);
  }
  await client.sendSceneUpdate(elements);

  const label = params.label ? ` '${params.label}'` : '';
  return `Created rectangle${label} (${params.width}×${params.height}) at (${params.x}, ${params.y}) [id: ${expr.id}]`;
}

export async function executeDrawEllipse(
  client: IGatewayClient,
  params: DrawEllipseParams,
): Promise<string> {
  const expr = buildEllipse(params);
  await client.sendCreate(expr);

  const existingElements = client.getExcalidrawElements();
  const excalEllipse = createExcalidrawEllipse({
    x: params.x, y: params.y, width: params.width, height: params.height,
    label: params.label,
  });
  const elements = [...existingElements, excalEllipse];
  if (params.label) {
    const textEl = createExcalidrawText({
      x: params.x + params.width / 2 - 50,
      y: params.y + params.height / 2 - 12,
      text: params.label,
      containerId: excalEllipse.id as string,
    });
    (excalEllipse as Record<string, unknown>).boundElements = [{ id: textEl.id, type: 'text' }];
    elements.push(textEl);
  }
  await client.sendSceneUpdate(elements);

  const label = params.label ? ` '${params.label}'` : '';
  return `Created ellipse${label} (${params.width}×${params.height}) at (${params.x}, ${params.y}) [id: ${expr.id}]`;
}

export async function executeDrawLine(
  client: IGatewayClient,
  params: DrawLineParams,
): Promise<string> {
  const expr = buildLine(params);
  await client.sendCreate(expr);
  return `Created line with ${params.points.length} points [id: ${expr.id}]`;
}

export async function executeDrawArrow(
  client: IGatewayClient,
  params: DrawArrowParams,
): Promise<string> {
  const expr = buildArrow(params);
  await client.sendCreate(expr);

  const existingElements = client.getExcalidrawElements();
  const start = params.points[0]!;
  const end = params.points[params.points.length - 1]!;
  const excalArrow = createExcalidrawArrow({
    startX: start[0], startY: start[1],
    endX: end[0], endY: end[1],
    label: params.label,
  });
  await client.sendSceneUpdate([...existingElements, excalArrow]);

  const label = params.label ? ` '${params.label}'` : '';
  return `Created arrow${label} with ${params.points.length} points [id: ${expr.id}]`;
}

export async function executeDrawText(
  client: IGatewayClient,
  params: DrawTextParams,
): Promise<string> {
  const expr = buildText(params);
  await client.sendCreate(expr);

  const existingElements = client.getExcalidrawElements();
  const fontSize = params.fontSize ?? 14;
  const estimatedWidth = Math.max(params.text.length * fontSize * 0.6, 100);
  const excalText = createExcalidrawText({
    x: params.x, y: params.y, text: params.text,
    fontSize, width: estimatedWidth, height: fontSize * 1.5,
  });
  await client.sendSceneUpdate([...existingElements, excalText]);

  const preview = params.text.length > 40 ? params.text.slice(0, 40) + '…' : params.text;
  return `Created text '${preview}' at (${params.x}, ${params.y}) [id: ${expr.id}]`;
}

export async function executeAddStickyNote(
  client: IGatewayClient,
  params: AddStickyNoteParams,
): Promise<string> {
  const expr = buildStickyNote(params);
  await client.sendCreate(expr);

  // Sticky notes → rectangle with colored background + bound text in Excalidraw
  const existingElements = client.getExcalidrawElements();
  const w = params.width ?? 200;
  const h = params.height ?? 200;
  const excalRect = createExcalidrawRectangle({
    x: params.x, y: params.y, width: w, height: h,
    backgroundColor: params.color ?? '#FFF9C4',
    strokeColor: '#1e1e1e',
  });
  const excalText = createExcalidrawText({
    x: params.x + w / 2 - 50,
    y: params.y + h / 2 - 12,
    text: params.text,
    containerId: excalRect.id as string,
  });
  (excalRect as Record<string, unknown>).boundElements = [{ id: excalText.id, type: 'text' }];
  await client.sendSceneUpdate([...existingElements, excalRect, excalText]);

  const preview = params.text.length > 40 ? params.text.slice(0, 40) + '…' : params.text;
  return `Created sticky note '${preview}' at (${params.x}, ${params.y}) [id: ${expr.id}]`;
}
