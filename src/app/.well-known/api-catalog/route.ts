import { absoluteUrl, jsonResponse } from '@/lib/agent-discovery';

export const dynamic = 'force-static';

export function GET() {
  return jsonResponse(
    {
      linkset: [
        {
          anchor: absoluteUrl('/api/contact'),
          'service-desc': [
            {
              href: absoluteUrl('/openapi.json'),
              type: 'application/vnd.oai.openapi+json',
            },
          ],
          'service-doc': [
            {
              href: absoluteUrl('/resources'),
              type: 'text/html',
            },
          ],
          status: [
            {
              href: absoluteUrl('/api/health'),
              type: 'application/json',
            },
          ],
        },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/linkset+json; charset=utf-8',
      },
    }
  );
}
