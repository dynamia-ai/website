export interface ContactPayload {
  locale: string;
  [key: string]: unknown;
}

export async function submitContact(payload: ContactPayload): Promise<{ success: boolean; id?: string }> {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return { success: false };
  }

  return response.json();
}
