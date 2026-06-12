'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { submitContact } from '@/utils/contact';

interface WebMCPTool<Input = unknown> {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Input) => Promise<unknown> | unknown;
}

interface ModelContextProvider {
  provideContext: (context: {
    name: string;
    description: string;
    tools: WebMCPTool[];
  }) => void | (() => void);
}

interface WebMCPNavigator extends Navigator {
  modelContext?: ModelContextProvider;
}

interface ContactRequestInput {
  name?: string;
  email: string;
  company?: string;
  message: string;
}

interface SiteResourceInput {
  path: '/products' | '/solutions' | '/resources' | '/case-studies' | '/tools';
}

const SITE_RESOURCE_PATHS = ['/products', '/solutions', '/resources', '/case-studies', '/tools'];

function isContactRequestInput(input: unknown): input is ContactRequestInput {
  if (!input || typeof input !== 'object') return false;

  const candidate = input as Partial<ContactRequestInput>;
  return typeof candidate.email === 'string' && typeof candidate.message === 'string';
}

function isSiteResourceInput(input: unknown): input is SiteResourceInput {
  if (!input || typeof input !== 'object') return false;

  const candidate = input as Partial<SiteResourceInput>;
  return typeof candidate.path === 'string' && SITE_RESOURCE_PATHS.includes(candidate.path);
}

const WebMCPProvider: React.FC = () => {
  const locale = useLocale();

  useEffect(() => {
    const modelContext = (navigator as WebMCPNavigator).modelContext;
    if (!modelContext?.provideContext) return;

    const cleanup = modelContext.provideContext({
      name: 'Dynamia AI Website',
      description: 'Agent tools for Dynamia AI website discovery, navigation, and contact requests.',
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
          execute: async (input: unknown) => {
            if (!isContactRequestInput(input)) {
              return {
                success: false,
                error: 'email and message are required.',
              };
            }

            const result = await submitContact({
              locale,
              _subject: 'Agent Contact Request',
              _gotcha: '',
              ...input,
            });

            if (!result.success) {
              return {
                success: false,
              };
            }

            return result;
          },
        },
        {
          name: 'open_site_resource',
          description: 'Open a key Dynamia AI website resource in the current browser context.',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                enum: SITE_RESOURCE_PATHS,
              },
            },
            required: ['path'],
          },
          execute: (input: unknown) => {
            if (!isSiteResourceInput(input)) {
              return {
                success: false,
                error: 'Unsupported resource path.',
              };
            }

            const { path } = input;
            window.location.assign(path);
            return {
              success: true,
              path,
            };
          },
        },
      ],
    });

    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);

  return null;
};

export default WebMCPProvider;
