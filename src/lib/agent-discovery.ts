export const SITE_ORIGIN = 'https://dynamia.ai';

export const AGENT_LINK_HEADERS = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"',
  '</resources>; rel="service-doc"; type="text/html"',
  '</.well-known/oauth-protected-resource>; rel="oauth-protected-resource"; type="application/json"',
  '</.well-known/mcp/server-card.json>; rel="mcp-server-card"; type="application/json"',
  '</.well-known/agent-skills/index.json>; rel="service-meta"; type="application/json"',
];

export const HOME_MARKDOWN = `# Dynamia AI

Dynamia AI builds enterprise-grade heterogeneous computing infrastructure for AI, HPC, and edge workloads.

## Key Resources

- [Products](/products)
- [Solutions](/solutions)
- [Resources](/resources)
- [Case studies](/case-studies)
- [API catalog](/.well-known/api-catalog)
- [OpenAPI description](/openapi.json)
- [Agent skills index](/.well-known/agent-skills/index.json)

## Agent Discovery

This site publishes RFC 8288 Link headers, an RFC 9727 API catalog, OAuth discovery metadata, OAuth protected resource metadata, an MCP server card, and an agent skills discovery index.
`;

export const AGENT_DISCOVERY_SKILL = `# Dynamia AI Agent Discovery

Use this skill when an agent needs to discover Dynamia AI website resources, public APIs, documentation, and machine-readable metadata.

## Discovery Endpoints

- API catalog: https://dynamia.ai/.well-known/api-catalog
- OpenAPI description: https://dynamia.ai/openapi.json
- OAuth authorization server metadata: https://dynamia.ai/.well-known/oauth-authorization-server
- OAuth protected resource metadata: https://dynamia.ai/.well-known/oauth-protected-resource
- MCP server card: https://dynamia.ai/.well-known/mcp/server-card.json

## Public Actions

- Submit contact and demo requests through the documented contact API.
- Inspect product, solution, resource, case-study, and tooling pages.
- Request Markdown by sending Accept: text/markdown to the homepage.
`;

export function absoluteUrl(path: string) {
  return new URL(path, SITE_ORIGIN).toString();
}

export async function sha256Digest(content: string) {
  const encoded = new TextEncoder().encode(content);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  const hex = Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');

  return `sha256-${hex}`;
}

export function jsonResponse(body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      'Cache-Control': 'public, max-age=3600',
      ...init?.headers,
    },
  });
}
