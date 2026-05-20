/**
 * Validates if an email is a company email (not a common personal email)
 */
export function isCompanyEmail(email: string): boolean {
  // 常见个人邮箱域名列表
  const personalDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'qq.com', '163.com', '126.com', 'foxmail.com', 
    'sina.com', 'sohu.com', '139.com', 'yeah.net',
    'icloud.com', 'me.com', 'protonmail.com', 'live.com',
    'mail.com', 'yandex.com', 'aol.com', 'inbox.com',
    'zoho.com', 'gmx.com', 'msn.com'
  ];
  
  // 获取邮箱的域名部分
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  
  const domain = parts[1].toLowerCase();
  
  // 检查是否在个人邮箱列表中
  return !personalDomains.includes(domain);
}

const SPECIAL_CHARS = /[<>{}[\]|\\]/;

export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 50 && !SPECIAL_CHARS.test(trimmed);
}

export function isValidCompany(company: string): boolean {
  const trimmed = company.trim();
  return trimmed.length >= 1 && trimmed.length <= 100 && !SPECIAL_CHARS.test(trimmed);
}

export function isValidPhone(phone: string, isZh: boolean): boolean {
  const trimmed = phone.trim();
  if (!trimmed) return false;
  if (isZh) {
    return /^1[3-9]\d{9}$/.test(trimmed);
  }
  return /^\+?[\d\s\-()]{7,20}$/.test(trimmed);
}

export function isValidEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
} 