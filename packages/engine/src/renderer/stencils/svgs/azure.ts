/**
 * Azure cloud service SVG icons for the stencil catalog.
 *
 * Six monochrome icons (64×64 viewBox) representing core Azure services:
 * App Gateway, AKS, Storage, SQL, Functions, and VNet.
 *
 * @module
 */

/** Azure Application Gateway — gateway box with routing arrows. */
export const AZURE_APP_GATEWAY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="6" y="14" width="52" height="36" rx="4" />
  <line x1="6" y1="32" x2="20" y2="32" />
  <circle cx="24" cy="32" r="4" />
  <line x1="28" y1="32" x2="36" y2="20" />
  <line x1="28" y1="32" x2="36" y2="32" />
  <line x1="28" y1="32" x2="36" y2="44" />
  <polygon points="42,20 36,17 36,23" fill="currentColor" stroke="none" />
  <polygon points="42,32 36,29 36,35" fill="currentColor" stroke="none" />
  <polygon points="42,44 36,41 36,47" fill="currentColor" stroke="none" />
  <rect x="42" y="16" width="10" height="8" rx="1" />
  <rect x="42" y="28" width="10" height="8" rx="1" />
  <rect x="42" y="40" width="10" height="8" rx="1" />
</svg>`;

/** Azure Kubernetes Service (AKS) — Kubernetes wheel in Azure style. */
export const AZURE_AKS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="32" cy="32" r="24" />
  <circle cx="32" cy="32" r="8" />
  <line x1="32" y1="8" x2="32" y2="24" />
  <line x1="32" y1="40" x2="32" y2="56" />
  <line x1="11.2" y1="20" x2="25.6" y2="28" />
  <line x1="38.4" y1="36" x2="52.8" y2="44" />
  <line x1="11.2" y1="44" x2="25.6" y2="36" />
  <line x1="38.4" y1="28" x2="52.8" y2="20" />
  <circle cx="32" cy="8" r="3" fill="currentColor" />
  <circle cx="32" cy="56" r="3" fill="currentColor" />
  <circle cx="11.2" cy="20" r="3" fill="currentColor" />
  <circle cx="52.8" cy="44" r="3" fill="currentColor" />
  <circle cx="11.2" cy="44" r="3" fill="currentColor" />
  <circle cx="52.8" cy="20" r="3" fill="currentColor" />
</svg>`;

/** Azure Storage — stacked disks and tables. */
export const AZURE_STORAGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <ellipse cx="32" cy="14" rx="20" ry="6" />
  <path d="M12 14v12c0 3.3 9 6 20 6s20-2.7 20-6V14" />
  <path d="M12 26v12c0 3.3 9 6 20 6s20-2.7 20-6V26" />
  <path d="M12 38v12c0 3.3 9 6 20 6s20-2.7 20-6V38" />
  <path d="M12 26c0 3.3 9 6 20 6s20-2.7 20-6" />
  <path d="M12 38c0 3.3 9 6 20 6s20-2.7 20-6" />
</svg>`;

/** Azure SQL Database — database cylinder with Azure diamond mark. */
export const AZURE_SQL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <ellipse cx="32" cy="16" rx="20" ry="8" />
  <path d="M12 16v32c0 4.4 9 8 20 8s20-3.6 20-8V16" />
  <path d="M12 30c0 4.4 9 8 20 8s20-3.6 20-8" />
  <polygon points="32,36 38,42 32,48 26,42" fill="currentColor" stroke="currentColor" stroke-width="1" />
</svg>`;

/** Azure Functions — lightning bolt (serverless). */
export const AZURE_FUNCTIONS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="8" y="4" width="48" height="56" rx="6" />
  <polygon points="34,12 20,34 30,34 26,52 44,28 32,28" fill="currentColor" stroke="currentColor" stroke-linejoin="round" />
</svg>`;

/** Azure Virtual Network (VNet) — network with connected nodes. */
export const AZURE_VNET_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="4" y="4" width="56" height="56" rx="4" stroke-dasharray="4 2" />
  <circle cx="20" cy="20" r="6" />
  <circle cx="44" cy="20" r="6" />
  <circle cx="20" cy="44" r="6" />
  <circle cx="44" cy="44" r="6" />
  <line x1="26" y1="20" x2="38" y2="20" />
  <line x1="20" y1="26" x2="20" y2="38" />
  <line x1="44" y1="26" x2="44" y2="38" />
  <line x1="26" y1="44" x2="38" y2="44" />
  <line x1="25" y1="25" x2="39" y2="39" />
  <line x1="39" y1="25" x2="25" y2="39" />
</svg>`;

/** Azure Cosmos DB — globe with orbiting ring. */
export const AZURE_COSMOSDB_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="32" cy="32" r="16" />
  <ellipse cx="32" cy="32" rx="26" ry="10" />
  <line x1="32" y1="16" x2="32" y2="48" />
  <path d="M16 32 C20 24, 44 24, 48 32" />
  <path d="M16 32 C20 40, 44 40, 48 32" />
</svg>`;

/** Azure Redis Cache — lightning bolt on cache box. */
export const AZURE_REDIS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="10" y="14" width="44" height="36" rx="3" />
  <path d="M34 22 L28 34 H36 L30 46" stroke-width="2.5" />
  <line x1="10" y1="26" x2="54" y2="26" />
</svg>`;

/** Azure DNS — globe with DNS label. */
export const AZURE_DNS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="32" cy="28" r="18" />
  <line x1="14" y1="28" x2="50" y2="28" />
  <ellipse cx="32" cy="28" rx="18" ry="8" />
  <text x="32" y="56" text-anchor="middle" font-size="10" fill="currentColor" stroke="none" font-family="sans-serif">DNS</text>
</svg>`;

/** Azure Front Door — shield with globe. */
export const AZURE_FRONTDOOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M32 6 L54 18 V42 C54 50 32 58 32 58 C32 58 10 50 10 42 V18 Z" />
  <circle cx="32" cy="32" r="10" />
  <line x1="22" y1="32" x2="42" y2="32" />
  <line x1="32" y1="22" x2="32" y2="42" />
</svg>`;

/** Azure Traffic Manager — directional routing. */
export const AZURE_TRAFFIC_MANAGER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="32" cy="16" r="8" />
  <circle cx="14" cy="50" r="8" />
  <circle cx="50" cy="50" r="8" />
  <line x1="28" y1="23" x2="18" y2="43" />
  <line x1="36" y1="23" x2="46" y2="43" />
</svg>`;

/** Azure Monitor — chart with eye. */
export const AZURE_MONITOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="8" y="8" width="48" height="36" rx="3" />
  <polyline points="14,34 22,22 30,30 38,18 46,26" />
  <ellipse cx="32" cy="54" rx="12" ry="5" />
  <circle cx="32" cy="54" r="2" fill="currentColor" stroke="none" />
</svg>`;

/** Private Endpoint — locked connection point. */
export const AZURE_PRIVATE_ENDPOINT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="32" cy="32" r="20" />
  <rect x="24" y="28" width="16" height="12" rx="2" />
  <path d="M27 28 V24 C27 20 37 20 37 24 V28" />
  <circle cx="32" cy="34" r="2" fill="currentColor" stroke="none" />
</svg>`;

/** Network Security Perimeter — dashed boundary with shield. */
export const AZURE_NSP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="5" y="5" width="190" height="140" rx="8" stroke-dasharray="8,4" />
  <path d="M100 30 L120 42 V58 C120 66 100 72 100 72 C100 72 80 66 80 58 V42 Z" />
</svg>`;

/** Prometheus — flame icon (monitoring). */
export const PROMETHEUS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M32 6 C32 6 44 16 44 30 C44 38 40 42 40 42 C40 42 46 36 46 28 C46 28 52 36 52 44 C52 54 42 58 32 58 C22 58 12 54 12 44 C12 36 18 28 18 28 C18 36 24 42 24 42 C24 42 20 38 20 30 C20 16 32 6 32 6Z" />
  <line x1="22" y1="48" x2="42" y2="48" />
  <line x1="24" y1="52" x2="40" y2="52" />
</svg>`;
