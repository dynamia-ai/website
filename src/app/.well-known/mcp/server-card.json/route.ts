import { absoluteUrl, jsonResponse } from '@/lib/agent-discovery';

export const dynamic = 'force-static';

export function GET() {
  return jsonResponse({
    serverInfo: {
      name: 'Dynamia AI Website',
      version: '1.0.0',
    },
    transport: {
      type: 'webmcp',
      endpoint: absoluteUrl('/'),
    },
    capabilities: {
      tools: true,
      resources: true,
      prompts: false,
    },
    tools: [
      {
        name: 'submit_contact_request',
        description: 'Submit a contact, demo, pricing, or trial request to Dynamia AI.',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            company: { type: 'string' },
            message: { type: 'string' },
          },
          required: ['email', 'message'],
        },
      },
      {
        name: 'open_site_resource',
        description: 'Open a key Dynamia AI website resource.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              enum: ['/products', '/solutions', '/resources', '/case-studies', '/tools'],
            },
          },
          required: ['path'],
        },
      },
    ],
  });
}
