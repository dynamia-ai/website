'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    hbspt?: {
      forms: {
        create: (config: HubSpotFormConfig) => void;
      };
    };
  }
}

interface HubSpotFormConfig {
  region: string;
  portalId: string;
  formId: string;
  target?: string;
  onFormReady?: (form: unknown) => void;
  onFormSubmit?: (form: unknown) => void;
}

interface HubSpotFormProps {
  portalId?: string;
  formId?: string;
  region?: string;
  className?: string;
  loadingPlaceholder?: React.ReactNode;
}

const HUBSPOT_SCRIPT = 'https://js.hsforms.net/forms/embed/v2.js';

export default function HubSpotForm({
  portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID,
  formId = process.env.NEXT_PUBLIC_HUBSPOT_FORM_ID,
  region = process.env.NEXT_PUBLIC_HUBSPOT_REGION || 'na1',
  className,
  loadingPlaceholder,
}: HubSpotFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (!portalId || !formId) {
      setStatus('error');
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    function initForm() {
      if (cancelled) return;
      if (!window.hbspt) {
        setStatus('error');
        return;
      }
      window.hbspt.forms.create({
        region,
        portalId: portalId!,
        formId: formId!,
        target: `#${container!.id}`,
        onFormReady: () => {
          if (!cancelled) setStatus('ready');
        },
      });
    }

    if (window.hbspt) {
      initForm();
    } else if (!scriptLoadedRef.current) {
      scriptLoadedRef.current = true;
      const script = document.createElement('script');
      script.src = HUBSPOT_SCRIPT;
      script.async = true;
      script.onload = initForm;
      script.onerror = () => {
        if (!cancelled) setStatus('error');
      };
      document.body.appendChild(script);
    } else {
      // Script already loading, poll for hbspt
      const interval = setInterval(() => {
        if (window.hbspt) {
          clearInterval(interval);
          initForm();
        }
      }, 200);
      return () => clearInterval(interval);
    }

    return () => {
      cancelled = true;
    };
  }, [portalId, formId, region]);

  if (!portalId || !formId) {
    return null;
  }

  const containerId = `hubspot-form-${formId}`;

  return (
    <div className={className}>
      {status === 'loading' && (
        loadingPlaceholder || (
          <div className="animate-pulse space-y-4 p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded w-1/2" />
          </div>
        )
      )}
      {status === 'error' && (
        <div className="text-center py-8 text-gray-500">
          Form failed to load. Please try again later.
        </div>
      )}
      <div
        ref={containerRef}
        id={containerId}
        className={status === 'ready' ? '' : 'hidden'}
      />
    </div>
  );
}
