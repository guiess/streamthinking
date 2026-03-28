/**
 * Unit tests for AgentActions loading state.
 *
 * Validates that when isLoading is true:
 * - Action buttons are hidden
 * - "Thinking…" indicator is shown
 * - The pulsing indicator has the correct test ID
 *
 * @vitest-environment jsdom
 * @module
 */

import { render, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { AgentActions } from '../components/toolbar/AgentActions.js';
import type { VisualExpression, ExpressionKind } from '@infinicanvas/protocol';
import { DEFAULT_EXPRESSION_STYLE } from '@infinicanvas/protocol';

// ── Test helpers ───────────────────────────────────────────

function makeExpression(
  kind: ExpressionKind,
  data: VisualExpression['data'],
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
  };
}

const flowchartExpr = makeExpression('flowchart', {
  kind: 'flowchart',
  title: 'Test Flow',
  nodes: [{ id: 'n1', label: 'Start', shape: 'rect' as const }],
  edges: [],
  direction: 'TB' as const,
});

// ── Tests ──────────────────────────────────────────────────

describe('AgentActions loading state', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows "Thinking…" when isLoading is true', () => {
    const { getByText, getByTestId } = render(
      <AgentActions
        selectedExpressions={[flowchartExpr]}
        onAction={vi.fn()}
        isLoading={true}
      />,
    );

    expect(getByText('Thinking…')).toBeTruthy();
    expect(getByTestId('agent-actions-loading')).toBeTruthy();
  });

  it('hides action buttons when isLoading is true', () => {
    const { queryByText } = render(
      <AgentActions
        selectedExpressions={[flowchartExpr]}
        onAction={vi.fn()}
        isLoading={true}
      />,
    );

    expect(queryByText('Explain this')).toBeNull();
    expect(queryByText('Extend this')).toBeNull();
    expect(queryByText('Diagram this')).toBeNull();
  });

  it('shows action buttons when isLoading is false', () => {
    const { getByText, queryByTestId } = render(
      <AgentActions
        selectedExpressions={[flowchartExpr]}
        onAction={vi.fn()}
        isLoading={false}
      />,
    );

    expect(getByText('Explain this')).toBeTruthy();
    expect(getByText('Extend this')).toBeTruthy();
    expect(queryByTestId('agent-actions-loading')).toBeNull();
  });

  it('defaults to non-loading state when isLoading prop is omitted', () => {
    const { getByText, queryByTestId } = render(
      <AgentActions
        selectedExpressions={[flowchartExpr]}
        onAction={vi.fn()}
      />,
    );

    expect(getByText('Explain this')).toBeTruthy();
    expect(queryByTestId('agent-actions-loading')).toBeNull();
  });

  it('still renders nothing when no expressions are selected, even while loading', () => {
    const { container } = render(
      <AgentActions
        selectedExpressions={[]}
        onAction={vi.fn()}
        isLoading={true}
      />,
    );

    expect(container.querySelector('[data-testid="agent-actions"]')).toBeNull();
  });

  it('renders the agent-actions container when loading and expressions selected', () => {
    const { getByTestId } = render(
      <AgentActions
        selectedExpressions={[flowchartExpr]}
        onAction={vi.fn()}
        isLoading={true}
      />,
    );

    expect(getByTestId('agent-actions')).toBeTruthy();
  });
});
