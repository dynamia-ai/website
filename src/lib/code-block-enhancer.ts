/**
 * Client-side enhancer for markdown code blocks.
 * - Wraps each <pre> with .code-block
 * - Adds a top-left language badge (parsed from code's language-* class)
 * - Adds a top-right copy button with i18n labels
 *
 * Designed to be called from a React useEffect after dangerouslySetInnerHTML mounts.
 * Returns a cleanup function.
 */

export interface EnhanceOptions {
  /**
   * Either pass the actual container element (preferred — robust against
   * SSR/hydration ordering & className mismatches) or a CSS selector.
   */
  container?: HTMLElement | null;
  containerSelector?: string;
  labels: { copy: string; copied: string; failed: string; aria: string };
}

type CopyState = 'idle' | 'copied' | 'failed';

const LANG_LABEL_OVERRIDES: Record<string, string> = {
  bash: 'bash',
  shell: 'shell',
  sh: 'shell',
  zsh: 'zsh',
  yaml: 'yaml',
  yml: 'yaml',
  json: 'json',
  js: 'javascript',
  javascript: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  go: 'go',
  python: 'python',
  py: 'python',
  text: 'text',
  plaintext: 'text',
  dockerfile: 'dockerfile',
  toml: 'toml',
  ini: 'ini',
  hcl: 'hcl',
  diff: 'diff',
  console: 'console',
};

function detectLang(codeEl: HTMLElement): string {
  const cls = codeEl.className || '';
  const m = cls.match(/language-([\w+-]+)/i);
  if (m) {
    const raw = m[1].toLowerCase();
    return LANG_LABEL_OVERRIDES[raw] ?? raw;
  }
  return '';
}

export function enhanceCodeBlocks({
  container: providedContainer,
  containerSelector,
  labels,
}: EnhanceOptions): () => void {
  if (typeof document === 'undefined') return () => {};
  const container =
    providedContainer ??
    (containerSelector ? document.querySelector(containerSelector) : null);
  if (!container) return () => {};

  const { copy: copyLabel, copied: copiedLabel, failed: failedLabel, aria: ariaLabel } = labels;

  const setButtonLabel = (btn: HTMLButtonElement, label: string) => {
    const textSpan = btn.querySelector<HTMLSpanElement>('.code-copy-text');
    if (textSpan) textSpan.textContent = label;
    else btn.textContent = label;
  };
  const setButtonState = (btn: HTMLButtonElement, state: CopyState) => {
    btn.setAttribute('data-copy-state', state);
  };
  const ensureButtonStructure = (btn: HTMLButtonElement) => {
    if (!btn.classList.contains('code-copy-enhanced')) {
      btn.innerHTML = '<span class="code-copy-icon" aria-hidden="true"></span><span class="code-copy-text"></span>';
      btn.classList.add('code-copy-enhanced');
    }
  };
  const writeToClipboard = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        /* fallthrough */
      }
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };
  const resetTimeouts = new WeakMap<HTMLButtonElement, number>();

  const ensureWrapper = (preEl: HTMLElement): HTMLDivElement | null => {
    const parent = preEl.parentElement;
    if (!parent) return null;
    if (parent.classList.contains('code-block')) return parent as HTMLDivElement;
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    parent.insertBefore(wrapper, preEl);
    wrapper.appendChild(preEl);
    return wrapper;
  };

  const enhanceOnce = () => {
    const preElements = Array.from(container.querySelectorAll('pre'));

    preElements.forEach((pre) => {
      const preEl = pre as HTMLElement;
      const codeEl = preEl.querySelector<HTMLElement>('code');
      if (!codeEl) return;

      const wrapper = ensureWrapper(preEl);
      if (!wrapper) return;

      // Language badge
      const lang = detectLang(codeEl);
      let badge = wrapper.querySelector<HTMLSpanElement>('.code-language-badge');
      if (lang) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'code-language-badge';
          wrapper.insertBefore(badge, preEl);
        }
        badge.textContent = lang;
        wrapper.setAttribute('data-has-badge', '1');
      } else if (badge) {
        badge.remove();
        wrapper.removeAttribute('data-has-badge');
      }

      // Copy button
      let copyButton = wrapper.querySelector<HTMLButtonElement>('button.code-copy-button');
      if (!copyButton) {
        const existingInsidePre = preEl.querySelector<HTMLButtonElement>('button.code-copy-button');
        if (existingInsidePre) {
          copyButton = existingInsidePre;
          wrapper.appendChild(existingInsidePre);
        }
      }
      if (!copyButton) {
        copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.className = 'code-copy-button';
        wrapper.appendChild(copyButton);
      }
      ensureButtonStructure(copyButton);
      setButtonLabel(copyButton, copyLabel);
      setButtonState(copyButton, 'idle');
      copyButton.setAttribute('aria-label', ariaLabel);

      const handleCopy = async () => {
        const currentResetTimeout = resetTimeouts.get(copyButton!);
        if (currentResetTimeout) window.clearTimeout(currentResetTimeout);
        const success = await writeToClipboard(codeEl.textContent ?? '');
        if (success) {
          setButtonState(copyButton!, 'copied');
          setButtonLabel(copyButton!, copiedLabel);
        } else {
          setButtonState(copyButton!, 'failed');
          setButtonLabel(copyButton!, failedLabel);
        }
        const nextResetTimeout = window.setTimeout(() => {
          setButtonState(copyButton!, 'idle');
          setButtonLabel(copyButton!, copyLabel);
        }, 2000);
        resetTimeouts.set(copyButton!, nextResetTimeout);
      };
      copyButton.onclick = handleCopy;
    });
  };

  const needsEnhancement = () =>
    Array.from(container.querySelectorAll('pre')).some((pre) => {
      const preEl = pre as HTMLElement;
      const codeEl = preEl.querySelector<HTMLElement>('code');
      if (!codeEl) return false;
      const wrapper = preEl.parentElement;
      if (!wrapper?.classList.contains('code-block')) return true;
      return !wrapper.querySelector('button.code-copy-button');
    });

  let rafId: number | null = null;
  const observer =
    typeof MutationObserver === 'undefined'
      ? null
      : new MutationObserver(() => {
          if (rafId !== null) return;
          rafId = window.requestAnimationFrame(() => {
            rafId = null;
            if (needsEnhancement()) enhanceOnce();
          });
        });

  enhanceOnce();
  observer?.observe(container, { childList: true, subtree: true });

  return () => {
    if (rafId !== null) window.cancelAnimationFrame(rafId);
    observer?.disconnect();
    container.querySelectorAll<HTMLButtonElement>('button.code-copy-button').forEach((button) => {
      const resetTimeoutId = resetTimeouts.get(button);
      if (resetTimeoutId) window.clearTimeout(resetTimeoutId);
      button.onclick = null;
    });
  };
}
