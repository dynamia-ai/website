import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const INTENT_LABELS: Record<string, string> = {
  selfTrial: '自助试用',
  demo: '申请演示',
  sales: '商务咨询',
};

function buildHtmlEmail(data: Record<string, string>, subject: string): string {
  const intentLabel = INTENT_LABELS[data.intent] || data.intent;
  const fields: { label: string; value: string }[] = [
    { label: '需求类型', value: intentLabel },
    { label: '姓名', value: data.name },
    { label: '公司', value: data.company },
    { label: '邮箱', value: data.email || '—' },
    { label: '电话/微信', value: data.phone || '—' },
    { label: '使用场景', value: data.useCase || '—' },
  ];

  const rows = fields
    .map(
      (f) => `
      <tr>
        <td style="padding:8px 12px;font-weight:600;color:#374151;background:#f9fafb;border-bottom:1px solid #e5e7eb;white-space:nowrap;">${f.label}</td>
        <td style="padding:8px 12px;color:#111827;border-bottom:1px solid #e5e7eb;">${f.value}</td>
      </tr>`,
    )
    .join('');

  return `
    <div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="background:#1e40af;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;color:#fff;font-size:18px;">${subject}</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;overflow:hidden;">
        ${rows}
      </table>
      <p style="margin-top:16px;font-size:12px;color:#9ca3af;">此邮件由 dynamia.ai 官网表单自动发送</p>
    </div>`;
}

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const body = await request.json();
    const { _subject, _replyto, ...formData } = body;

    const subject = _subject || 'New Form Submission';
    const html = buildHtmlEmail(formData, subject);

    await resend.emails.send({
      from: 'Dynamia AI <noreply@dynamia.ai>',
      to: 'info@dynamia.ai',
      replyTo: _replyto || undefined,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email sending failed:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
} 