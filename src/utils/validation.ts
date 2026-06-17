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

const jobTitleSchema = z.string().trim().min(1, 'pricing.form.jobTitleRequired').max(100).regex(
  /^[^<>{}[\]|\\]*$/,
  'pricing.form.invalidJobTitle',
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

const CN_MOBILE = /^1[3-9]\d{9}$/;
const WECHAT_OR_ID = /^[\w.\-+()@\s\u4e00-\u9fa5]{2,50}$/u;
const SAFE_OPTIONAL_CONTACT = /^[^<>{}[\]|\\]*$/;

function isValidCnContact(value: string): boolean {
  const v = value.trim();
  return CN_MOBILE.test(v) || WECHAT_OR_ID.test(v);
}

/** Phone / WeChat contact field — required (zh) validates CN mobile or WeChat ID; optional skips format checks. */
function createContactSchema(
  isRequired: boolean,
  messages: { required: string; invalid: string },
) {
  if (isRequired) {
    return z.string().trim().min(1, messages.required).refine(
      isValidCnContact,
      messages.invalid,
    );
  }
  return z.string().optional().refine(
    (v) => !v || (v.trim().length <= 50 && SAFE_OPTIONAL_CONTACT.test(v.trim())),
    messages.invalid,
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
    phone: createContactSchema(fields.phone.required, {
      required: 'freeTrial.form.phoneRequired',
      invalid: 'freeTrial.form.invalidPhoneOrWechat',
    }),
    useCase: z.string().optional(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'freeTrial.form.termsRequired' }),
    }),
    _gotcha: z.string().optional(),
  });
}

export function createGateSchema(fields: {
  email: { required: boolean };
  phone: { required: boolean };
}) {
  return z.object({
    name: nameSchema,
    email: createEmailSchema(fields.email.required),
    company: companySchema,
    jobTitle: jobTitleSchema,
    phone: createContactSchema(fields.phone.required, {
      required: 'freeTrial.form.phoneRequired',
      invalid: 'freeTrial.form.invalidPhoneOrWechat',
    }),
    message: z.string().optional(),
  });
}

/**
 * Returns a Zod schema for the pricing form. Field requirements
 * come from the dictionary's `pricing.form.fields` config.
 */
export function createPricingSchema(fields: {
  email: { required: boolean };
  phone: { required: boolean };
}) {
  return z.object({
    name: nameSchema,
    email: createEmailSchema(fields.email.required),
    company: companySchema,
    jobTitle: jobTitleSchema,
    phone: createContactSchema(fields.phone.required, {
      required: 'pricing.form.phoneRequired',
      invalid: 'pricing.form.invalidPhoneOrWechat',
    }),
    gpuCount: z.string().min(1),
    message: z.string().optional(),
  });
}
