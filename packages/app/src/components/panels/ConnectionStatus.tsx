/**
 * ConnectionStatus — small status indicator for the gateway connection.
 *
 * Renders a colored dot with a tooltip showing connection state:
 * - 🟢 Connected (+ session ID)
 * - 🟡 Connecting / Reconnecting
 * - ⚫ No settings configured
 * - 🔴 Error (shows error message)
 *
 * Designed to sit in the top bar alongside ThemeToggle and ExportMenu. [CLEAN-CODE]
 *
 * @module
 */

// ── Types ──────────────────────────────────────────────────

/** Props for the ConnectionStatus component. */
export interface ConnectionStatusProps {
  connected: boolean;
  sessionId: string | null;
  error: string | null;
  hasSettings: boolean;
}

/** Visual status derived from connection props. */
type StatusKind = 'connected' | 'connecting' | 'error' | 'no-settings';

// ── Helpers ────────────────────────────────────────────────

/** Map connection props to a single status kind. [SRP] */
function deriveStatus(props: ConnectionStatusProps): StatusKind {
  if (!props.hasSettings) return 'no-settings';
  if (props.error) return 'error';
  if (props.connected) return 'connected';
  return 'connecting';
}

/** Tooltip text for each status. */
function deriveTooltip(
  status: StatusKind,
  props: ConnectionStatusProps,
): string {
  switch (status) {
    case 'connected':
      return `Connected — session ${props.sessionId ?? 'unknown'}`;
    case 'connecting':
      return 'Connecting…';
    case 'error':
      return `Error: ${props.error}`;
    case 'no-settings':
      return 'No gateway configured';
  }
}

/** Accessible label for screen readers. */
function deriveAriaLabel(
  status: StatusKind,
  props: ConnectionStatusProps,
): string {
  switch (status) {
    case 'connected':
      return `Gateway connected, session ${props.sessionId ?? 'unknown'}`;
    case 'connecting':
      return 'Gateway connecting';
    case 'error':
      return `Gateway error: ${props.error}`;
    case 'no-settings':
      return 'No gateway configured';
  }
}

/** Dot color for each status. */
const STATUS_COLORS: Record<StatusKind, string> = {
  connected: '#22c55e', // Green
  connecting: '#eab308', // Yellow
  error: '#ef4444', // Red
  'no-settings': '#9ca3af', // Gray
};

// ── Component ──────────────────────────────────────────────

/**
 * Minimal connection status dot.
 *
 * Shows a small colored circle with a tooltip. Designed to sit
 * inside the top-left action bar. [CLEAN-CODE]
 */
export function ConnectionStatus(props: ConnectionStatusProps) {
  const status = deriveStatus(props);
  const tooltip = deriveTooltip(status, props);
  const ariaLabel = deriveAriaLabel(status, props);
  const color = STATUS_COLORS[status];

  return (
    <div
      data-testid="connection-status"
      data-status={status}
      title={tooltip}
      aria-label={ariaLabel}
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        cursor: 'default',
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: status === 'connected' ? `0 0 6px ${color}` : undefined,
          transition: 'background-color 0.3s',
        }}
      />
    </div>
  );
}
