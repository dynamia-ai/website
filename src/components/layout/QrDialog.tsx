'use client';

import {useEffect, useRef, useState, type ReactNode} from 'react';
import {useTranslations} from 'next-intl';

interface QrDialogProps {
  namespace: 'company' | 'community';
  dialogClassName: string;
  dialogId: string;
  titleId: string;
  trigger: (open: () => void) => ReactNode;
}

export default function QrDialog({
  namespace,
  dialogClassName,
  dialogId,
  titleId,
  trigger,
}: QrDialogProps) {
  const tQr = useTranslations('siteShell.qr');
  const copy = tQr.raw(namespace) as {title: string; description: string; image: string; alt: string};
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => setOpen(false);
    const onClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        setOpen(false);
      }
    };
    dialog.addEventListener('close', onClose);
    dialog.addEventListener('click', onClick);
    return () => {
      dialog.removeEventListener('close', onClose);
      dialog.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <>
      {trigger(() => setOpen(true))}
      <dialog ref={dialogRef} className={dialogClassName} id={dialogId} aria-labelledby={titleId}>
        <button
          className="modal-close"
          type="button"
          aria-label={tQr('close')}
          onClick={() => setOpen(false)}
        >
          {tQr('closeSymbol')}
        </button>
        <h2 id={titleId}>{copy.title}</h2>
        <p>{copy.description}</p>
        <img src={copy.image} alt={copy.alt} />
      </dialog>
    </>
  );
}
