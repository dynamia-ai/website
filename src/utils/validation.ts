import { z } from 'zod';

const personalDomains = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'qq.com', '163.com', '126.com', 'foxmail.com',
  'sina.com', 'sohu.com', '139.com', 'yeah.net',
  'icloud.com', 'me.com', 'protonmail.com', 'live.com',
  'mail.com', 'yandex.com', 'aol.com', 'inbox.com',
  'zoho.com', 'gmx.com', 'msn.com',
];

function isCompanyDomain(email: string): boolean {
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  return !personalDomains.includes(parts[1].toLowerCase());
}

const nameSchema = z.string().trim().min(1).max(50).regex(
  /^[^<>{}[\]|\\]*$/,
  'freeTrial.form.invalidName',
);

const companySchema = z.string().trim().min(1).max(100).regex(
  /^[^<>{}[\]|\\]*$/,
  'freeTrial.form.invalidCompany',
);

const emailFormatSchema = z.string().trim().min(1, 'freeTrial.form.emailRequired').email('freeTrial.form.invalidEmail');

/** Standalone company email validator for gate/pricing forms. */
export const companyEmailSchema = emailFormatSchema.refine(
  isCompanyDomain,
  'common.useCompanyEmail',
);

function createEmailSchema(isRequired: boolean) {
  if (isRequired) return companyEmailSchema;
  return z.string().optional().pipe(
    z.literal('').or(companyEmailSchema),
  );
}

function createPhoneSchema(isRequired: boolean) {
  if (isRequired) {
    return z.string().trim().min(1, 'freeTrial.form.invalidPhone').regex(
      /^1[3-9]\d{9}$/,
      'freeTrial.form.invalidPhone',
    );
  }
  return z.string().optional().refine(
    (v) => !v || /^\+?[\d\s\-()]{7,20}$/.test(v),
    'freeTrial.form.invalidPhone',
  );
}

/**
 * Returns a Zod schema for the free trial form. Field requirements
 * come from the dictionary's `freeTrial.form.fields` config.
 */
export function createFreeTrialSchema(fields: {
  email: { required: boolean };
  phone: { required: boolean };
}) {
  return z.object({
    intent: z.string(),
    name: nameSchema,
    email: createEmailSchema(fields.email.required),
    company: companySchema,
    phone: createPhoneSchema(fields.phone.required),
    useCase: z.string().optional(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'freeTrial.form.termsRequired' }),
    }),
    _gotcha: z.string().optional(),
  });
}
