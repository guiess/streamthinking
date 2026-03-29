/**
 * Security appliance SVG icons for the stencil catalog.
 *
 * Seven monochrome line-art icons (64×64 viewBox) representing
 * security infrastructure components.
 *
 * @module
 */

/** Next-Gen Firewall — wall with flame shield. */
export const NGFW_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="8" y="12" width="48" height="40" rx="3" />
  <line x1="8" y1="32" x2="56" y2="32" />
  <path d="M32 18 C32 18 38 22 38 28 C38 32 32 36 32 36 C32 36 26 32 26 28 C26 22 32 18 32 18Z" fill="currentColor" opacity="0.3" />
  <line x1="20" y1="40" x2="20" y2="46" />
  <line x1="32" y1="40" x2="32" y2="46" />
  <line x1="44" y1="40" x2="44" y2="46" />
</svg>`;

/** Web Application Firewall — shield with web globe. */
export const WAF_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M32 6 L54 18 V42 C54 50 32 58 32 58 C32 58 10 50 10 42 V18 Z" />
  <circle cx="32" cy="30" r="12" />
  <ellipse cx="32" cy="30" rx="12" ry="5" />
  <line x1="32" y1="18" x2="32" y2="42" />
</svg>`;

/** VPN Gateway — tunnel with lock. */
export const VPN_GATEWAY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M8 40 L24 20 H40 L56 40" />
  <line x1="8" y1="40" x2="56" y2="40" />
  <rect x="24" y="30" width="16" height="14" rx="2" />
  <path d="M28 30 V26 C28 22 36 22 36 26 V30" />
  <circle cx="32" cy="38" r="2" fill="currentColor" stroke="none" />
</svg>`;

/** SD-WAN Hub — network hub with cloud. */
export const SDWAN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M16 32 C16 24 24 18 32 18 C40 18 46 22 48 28 C54 28 58 32 56 38 C54 44 48 44 48 44 H16 C12 44 8 40 10 36 C12 32 16 32 16 32Z" />
  <circle cx="22" cy="54" r="5" />
  <circle cx="42" cy="54" r="5" />
  <line x1="22" y1="44" x2="22" y2="49" />
  <line x1="42" y1="44" x2="42" y2="49" />
  <line x1="27" y1="54" x2="37" y2="54" />
</svg>`;

/** SIEM — security analytics dashboard. */
export const SIEM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="6" y="8" width="52" height="38" rx="3" />
  <polyline points="14,36 22,22 30,30 38,16 46,24 54,20" />
  <circle cx="46" cy="24" r="3" fill="currentColor" stroke="none" />
  <path d="M32 52 C32 52 38 48 38 48 L26 48 C26 48 32 52 32 52Z" fill="currentColor" stroke="none" />
  <line x1="22" y1="52" x2="42" y2="52" />
</svg>`;

/** Endpoint Protection — laptop with shield. */
export const ENDPOINT_PROTECTION_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="12" y="10" width="40" height="30" rx="2" />
  <rect x="8" y="40" width="48" height="4" rx="2" />
  <path d="M32 16 L42 22 V30 C42 34 32 38 32 38 C32 38 22 34 22 30 V22 Z" />
  <polyline points="27,26 31,30 38,22" stroke-width="2.5" />
</svg>`;

/** SSL/TLS Inspection — certificate with magnifying glass. */
export const SSL_INSPECTION_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="10" y="8" width="32" height="42" rx="2" />
  <circle cx="26" cy="22" r="8" />
  <line x1="26" y1="18" x2="26" y2="22" />
  <line x1="26" y1="22" x2="30" y2="22" />
  <line x1="16" y1="36" x2="36" y2="36" />
  <line x1="16" y1="42" x2="32" y2="42" />
  <circle cx="48" cy="42" r="10" />
  <line x1="55" y1="49" x2="60" y2="54" stroke-width="3" />
</svg>`;
