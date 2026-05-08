import { absoluteUrl, jsonResponse } from '@/lib/agent-discovery';

export const dynamic = 'force-static';

export function GET() {
  return jsonResponse({
    issuer: absoluteUrl('/'),
    authorization_endpoint: absoluteUrl('/oauth/authorize'),
    token_endpoint: absoluteUrl('/oauth/token'),
    jwks_uri: absoluteUrl('/.well-known/jwks.json'),
    grant_types_supported: ['authorization_code', 'client_credentials'],
    response_types_supported: ['code'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    scopes_supported: ['openid', 'profile', 'email', 'contact:write'],
    claims_supported: ['sub', 'name', 'email'],
    token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
    service_documentation: absoluteUrl('/resources'),
  });
}
