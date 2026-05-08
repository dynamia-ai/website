import { AGENT_DISCOVERY_SKILL } from '@/lib/agent-discovery';

export const dynamic = 'force-static';

export function GET() {
  return new Response(AGENT_DISCOVERY_SKILL, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
