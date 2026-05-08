import {
  AGENT_DISCOVERY_SKILL,
  absoluteUrl,
  jsonResponse,
  sha256Digest,
} from '@/lib/agent-discovery';

export const dynamic = 'force-static';

export async function GET() {
  return jsonResponse({
    $schema: 'https://agentskills.io/schemas/agent-skills-index-v0.2.0.json',
    skills: [
      {
        name: 'dynamia-ai-agent-discovery',
        type: 'skill',
        description: 'Discover Dynamia AI public APIs, documentation, metadata, and browser-exposed agent tools.',
        url: absoluteUrl('/.well-known/agent-skills/agent-discovery/SKILL.md'),
        sha256: await sha256Digest(AGENT_DISCOVERY_SKILL),
      },
    ],
  });
}
