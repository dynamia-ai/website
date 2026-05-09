'use client';

import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface CopyableCommandProps {
  command: string;
  className?: string;
}

export default function CopyableCommand({ command, className = '' }: CopyableCommandProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable, no-op */
    }
  };

  return (
    <div
      className={`group relative flex items-start justify-between gap-3 rounded-md bg-gray-900 dark:bg-gray-950 px-4 py-3 text-sm text-gray-100 ${className}`}
    >
      <code className="flex-1 break-all whitespace-pre-wrap font-mono">{command}</code>
      <button
        type="button"
        onClick={handleCopy}
        className="flex-shrink-0 inline-flex items-center gap-1 rounded border border-gray-700 px-2 py-1 text-xs font-medium text-gray-300 hover:bg-gray-800 transition-colors"
        aria-label="Copy command"
      >
        {copied ? (
          <>
            <CheckIcon className="h-3.5 w-3.5 text-green-400" />
            <span className="text-green-400">Copied</span>
          </>
        ) : (
          <>
            <ClipboardIcon className="h-3.5 w-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
}
