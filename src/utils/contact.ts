interface ContactResult {
  success: boolean;
  id?: string;
  error?: string;
  status?: number;
}

export interface ContactPayload {
  locale: string;
  [key: string]: unknown;
}

export async function submitContact(payload: ContactPayload): Promise<ContactResult> {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let error: string | undefined;
    try {
      const body = await response.json();
      error = body.error;
    } catch {
      // response body wasn't JSON
    }
    return { success: false, error, status: response.status };
  }

  return response.json();
}
