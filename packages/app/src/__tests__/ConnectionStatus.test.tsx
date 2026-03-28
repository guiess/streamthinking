// @vitest-environment jsdom
/**
 * Unit tests for ConnectionStatus component.
 *
 * Tests written FIRST following TDD [Red → Green → Refactor].
 * Verifies: renders correct states (connected, disconnected, error, no-settings),
 * shows session ID tooltip, shows error message.
 *
 * @module
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { ConnectionStatus } from '../components/panels/ConnectionStatus.js';

// ── Setup / Teardown ───────────────────────────────────────

afterEach(() => {
  cleanup();
});

// ── Tests ──────────────────────────────────────────────────

describe('ConnectionStatus', () => {
  describe('no settings configured', () => {
    it('renders disconnected indicator', () => {
      const { container } = render(
        <ConnectionStatus
          connected={false}
          sessionId={null}
          error={null}
          hasSettings={false}
        />,
      );

      const dot = container.querySelector('[data-testid="connection-status"]');
      expect(dot).not.toBeNull();
      expect(dot!.getAttribute('data-status')).toBe('no-settings');
    });

    it('shows "No gateway configured" tooltip', () => {
      const { container } = render(
        <ConnectionStatus
          connected={false}
          sessionId={null}
          error={null}
          hasSettings={false}
        />,
      );

      const dot = container.querySelector('[data-testid="connection-status"]');
      expect(dot!.getAttribute('title')).toBe('No gateway configured');
    });
  });

  describe('connecting state', () => {
    it('renders connecting indicator when settings exist but not connected', () => {
      const { container } = render(
        <ConnectionStatus
          connected={false}
          sessionId={null}
          error={null}
          hasSettings={true}
        />,
      );

      const dot = container.querySelector('[data-testid="connection-status"]');
      expect(dot!.getAttribute('data-status')).toBe('connecting');
    });

    it('shows "Connecting…" tooltip', () => {
      const { container } = render(
        <ConnectionStatus
          connected={false}
          sessionId={null}
          error={null}
          hasSettings={true}
        />,
      );

      const dot = container.querySelector('[data-testid="connection-status"]');
      expect(dot!.getAttribute('title')).toBe('Connecting…');
    });
  });

  describe('connected state', () => {
    it('renders connected indicator', () => {
      const { container } = render(
        <ConnectionStatus
          connected={true}
          sessionId="sess-abc-123"
          error={null}
          hasSettings={true}
        />,
      );

      const dot = container.querySelector('[data-testid="connection-status"]');
      expect(dot!.getAttribute('data-status')).toBe('connected');
    });

    it('shows session ID in tooltip', () => {
      const { container } = render(
        <ConnectionStatus
          connected={true}
          sessionId="sess-abc-123"
          error={null}
          hasSettings={true}
        />,
      );

      const dot = container.querySelector('[data-testid="connection-status"]');
      expect(dot!.getAttribute('title')).toContain('sess-abc-123');
    });
  });

  describe('error state', () => {
    it('renders error indicator', () => {
      const { container } = render(
        <ConnectionStatus
          connected={false}
          sessionId={null}
          error="Authentication failed"
          hasSettings={true}
        />,
      );

      const dot = container.querySelector('[data-testid="connection-status"]');
      expect(dot!.getAttribute('data-status')).toBe('error');
    });

    it('shows error message in tooltip', () => {
      const { container } = render(
        <ConnectionStatus
          connected={false}
          sessionId={null}
          error="Authentication failed"
          hasSettings={true}
        />,
      );

      const dot = container.querySelector('[data-testid="connection-status"]');
      expect(dot!.getAttribute('title')).toContain('Authentication failed');
    });
  });

  describe('accessibility', () => {
    it('has an accessible label', () => {
      const { container } = render(
        <ConnectionStatus
          connected={true}
          sessionId="sess-1"
          error={null}
          hasSettings={true}
        />,
      );

      const dot = container.querySelector('[data-testid="connection-status"]');
      expect(dot!.getAttribute('aria-label')).toBeTruthy();
    });
  });
});
