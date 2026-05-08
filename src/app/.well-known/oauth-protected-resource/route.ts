import { absoluteUrl, jsonResponse } from '@/lib/agent-discovery';

export const dynamic = 'force-static';

export function GET() {
  return jsonResponse({
    resource: absoluteUrl('/api'),
    authorization_servers: [
      absoluteUrl('/'),
    ],
    scopes_supported: ['contact:write'],
    bearer_methods_supported: ['header'],
    resource_documentation: absoluteUrl('/resources'),
  });
}
