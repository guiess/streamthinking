/**
 * Unit tests for useAgentActionHandler — prompt construction and payload building.
 *
 * Tests pure functions exported from the hook module: buildPrompt,
 * buildAgentRequest, extractLabel, calculateSuggestedPosition.
 *
 * @vitest-environment jsdom
 * @module
 */

import { describe, it, expect } from 'vitest';
import type { VisualExpression, ExpressionKind } from '@infinicanvas/protocol';
import { DEFAULT_EXPRESSION_STYLE } from '@infinicanvas/protocol';
import {
  buildPrompt,
  buildAgentRequest,
  extractLabel,
  calculateSuggestedPosition,
  generateRequestId,
} from '../hooks/useAgentActionHandler.js';

// ── Test helpers ───────────────────────────────────────────

function makeExpression(
  kind: ExpressionKind,
  data: VisualExpression['data'],
  overrides?: Partial<VisualExpression>,
): VisualExpression {
  return {
    id: 'test-expr-1',
    kind,
    position: { x: 100, y: 200 },
    size: { width: 400, height: 300 },
    angle: 0,
    style: { ...DEFAULT_EXPRESSION_STYLE },
    meta: {
      author: { type: 'human', id: 'user-1', name: 'Test User' },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
      locked: false,
    },
    data,
    ...overrides,
  };
}

const flowchartExpr = makeExpression('flowchart', {
  kind: 'flowchart',
  title: 'Auth Flow',
  nodes: [{ id: 'n1', label: 'Start', shape: 'rect' as const }],
  edges: [],
  direction: 'TB' as const,
});

const textExpr = makeExpression('text', {
  kind: 'text',
  content: 'Hello world',
  fontSize: 16,
  fontFamily: 'sans-serif',
  textAlign: 'left',
}, { id: 'text-1', position: { x: 50, y: 100 }, size: { width: 200, height: 40 } });

const stickyExpr = makeExpression('sticky-note', {
  kind: 'sticky-note',
  text: 'Remember to refactor',
  color: '#FFEB3B',
}, { id: 'sticky-1', position: { x: 300, y: 150 }, size: { width: 150, height: 100 } });

// ── Tests ──────────────────────────────────────────────────

describe('extractLabel', () => {
  it('extracts title from flowchart expression', () => {
    expect(extractLabel(flowchartExpr)).toBe('Auth Flow');
  });

  it('extracts content from text expression', () => {
    expect(extractLabel(textExpr)).toBe('Hello world');
  });

  it('extracts text from sticky note', () => {
    expect(extractLabel(stickyExpr)).toBe('Remember to refactor');
  });

  it('returns undefined for expressions without label-like fields', () => {
    const lineExpr = makeExpression('line', {
      kind: 'line',
      points: [[0, 0], [100, 100]],
      startArrowhead: false,
      endArrowhead: false,
    });
    expect(extractLabel(lineExpr)).toBeUndefined();
  });
});

describe('calculateSuggestedPosition', () => {
  it('places below a single expression with 20px offset', () => {
    const pos = calculateSuggestedPosition([flowchartExpr]);
    expect(pos.x).toBe(100); // Same X as expression
    expect(pos.y).toBe(200 + 300 + 20); // bottom + 20
  });

  it('places below the bounding box of multiple expressions', () => {
    const pos = calculateSuggestedPosition([textExpr, stickyExpr]);
    // min X = 50 (textExpr), max bottom = max(100+40, 150+100) = 250
    expect(pos.x).toBe(50);
    expect(pos.y).toBe(250 + 20);
  });

  it('returns default position for empty selection', () => {
    const pos = calculateSuggestedPosition([]);
    expect(pos.x).toBe(100);
    expect(pos.y).toBe(100);
  });
});

describe('buildPrompt', () => {
  it('builds explain prompt with expression description', () => {
    const pos = calculateSuggestedPosition([flowchartExpr]);
    const prompt = buildPrompt('explain', [flowchartExpr], pos);

    expect(prompt).toContain('Explain this');
    expect(prompt).toContain('flowchart');
    expect(prompt).toContain('Auth Flow');
    expect(prompt).toContain('text annotation or sticky note');
    expect(prompt).toContain(`(${pos.x}, ${pos.y})`);
  });

  it('builds extend prompt for expansion', () => {
    const pos = calculateSuggestedPosition([flowchartExpr]);
    const prompt = buildPrompt('extend', [flowchartExpr], pos);

    expect(prompt).toContain('Extend this');
    expect(prompt).toContain('more elements');
    expect(prompt).toContain('flowchart');
  });

  it('builds diagram prompt for text-to-diagram', () => {
    const pos = calculateSuggestedPosition([textExpr]);
    const prompt = buildPrompt('diagram', [textExpr], pos);

    expect(prompt).toContain('Diagram this');
    expect(prompt).toContain('visual diagram');
    expect(prompt).toContain('text');
    expect(prompt).toContain('Hello world');
  });

  it('handles multiple expressions in prompt', () => {
    const pos = calculateSuggestedPosition([textExpr, stickyExpr]);
    const prompt = buildPrompt('explain', [textExpr, stickyExpr], pos);

    expect(prompt).toContain('text');
    expect(prompt).toContain('sticky-note');
    expect(prompt).toContain('Hello world');
    expect(prompt).toContain('Remember to refactor');
  });

  it('handles expressions without labels', () => {
    const lineExpr = makeExpression('line', {
      kind: 'line',
      points: [[0, 0], [100, 100]],
      startArrowhead: false,
      endArrowhead: false,
    });
    const pos = calculateSuggestedPosition([lineExpr]);
    const prompt = buildPrompt('explain', [lineExpr], pos);

    expect(prompt).toContain('a line');
    expect(prompt).not.toContain('titled');
  });
});

describe('buildAgentRequest', () => {
  it('builds complete agent-request payload for explain action', () => {
    const payload = buildAgentRequest({
      action: 'explain',
      expressions: [flowchartExpr],
    });

    expect(payload.type).toBe('agent-request');
    expect(payload.requestId).toBeTruthy();
    expect(payload.action).toBe('explain');
    expect(payload.context.expressions).toHaveLength(1);
    expect(payload.context.expressions[0]!.id).toBe('test-expr-1');
    expect(payload.context.expressions[0]!.kind).toBe('flowchart');
    expect(payload.context.expressions[0]!.label).toBe('Auth Flow');
    expect(payload.context.suggestedPosition.y).toBe(200 + 300 + 20);
    expect(payload.prompt).toContain('Explain this');
  });

  it('builds payload for extend action', () => {
    const payload = buildAgentRequest({
      action: 'extend',
      expressions: [flowchartExpr],
    });

    expect(payload.action).toBe('extend');
    expect(payload.prompt).toContain('Extend this');
  });

  it('builds payload for diagram action', () => {
    const payload = buildAgentRequest({
      action: 'diagram',
      expressions: [textExpr],
    });

    expect(payload.action).toBe('diagram');
    expect(payload.prompt).toContain('Diagram this');
    expect(payload.context.expressions[0]!.kind).toBe('text');
  });

  it('generates unique request IDs', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 20; i++) {
      ids.add(generateRequestId());
    }
    expect(ids.size).toBe(20);
  });

  it('includes expression data in context', () => {
    const payload = buildAgentRequest({
      action: 'explain',
      expressions: [flowchartExpr],
    });

    const ctxExpr = payload.context.expressions[0]!;
    expect(ctxExpr.data).toBeDefined();
    expect(ctxExpr.position).toEqual({ x: 100, y: 200 });
    expect(ctxExpr.size).toEqual({ width: 400, height: 300 });
  });
});
