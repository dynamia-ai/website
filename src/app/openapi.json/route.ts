import { SITE_ORIGIN, jsonResponse } from '@/lib/agent-discovery';

export const dynamic = 'force-static';

export function GET() {
  return jsonResponse({
    openapi: '3.1.0',
    info: {
      title: 'Dynamia AI Public API',
      version: '1.0.0',
      description: 'Public API surface for Dynamia AI website forms and discovery.',
    },
    servers: [
      {
        url: SITE_ORIGIN,
      },
    ],
    paths: {
      '/api/contact': {
        post: {
          operationId: 'submitContactRequest',
          summary: 'Submit a contact, demo, pricing, or trial request.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  additionalProperties: {
                    type: ['string', 'number', 'boolean', 'null'],
                  },
                  properties: {
                    _subject: {
                      type: 'string',
                      description: 'Optional email subject for the submitted form.',
                    },
                    name: {
                      type: 'string',
                    },
                    email: {
                      type: 'string',
                      format: 'email',
                    },
                    company: {
                      type: 'string',
                    },
                    message: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Submission accepted.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                      },
                    },
                    required: ['success'],
                  },
                },
              },
            },
            '500': {
              description: 'Submission failed.',
            },
          },
        },
      },
      '/api/health': {
        get: {
          operationId: 'getHealth',
          summary: 'Return public API health status.',
          responses: {
            '200': {
              description: 'Service health status.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: {
                        type: 'string',
                        enum: ['ok'],
                      },
                    },
                    required: ['status'],
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}
