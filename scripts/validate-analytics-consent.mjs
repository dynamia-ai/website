import { readFileSync } from 'node:fs';

const source = readFileSync('src/components/ConsentAwareAnalytics.tsx', 'utf8');

const failures = [];

if (source.includes('isZh ||')) {
  failures.push('Analytics consent must not be auto-granted from the /zh route.');
}

if (!source.includes('analyticsEnabled &&')) {
  failures.push('Google Analytics scripts must be gated by explicit analytics consent state.');
}

if (!source.includes('window.dataLayer.push(arguments)')) {
  failures.push('Consent updates must use the same arguments object format as the Google gtag snippet.');
}

if (!source.includes('clearGoogleAnalyticsCookies()') || !source.includes("name.startsWith('_ga')")) {
  failures.push('Google Analytics cookies must be cleared when analytics consent is missing or denied.');
}

const configIndex = source.indexOf("gtag('config'");
const consentGateIndex = source.indexOf('analyticsEnabled &&');

if (configIndex !== -1 && (consentGateIndex === -1 || configIndex < consentGateIndex)) {
  failures.push("gtag('config') must only run after analytics consent is enabled.");
}

if (failures.length > 0) {
  console.error('Analytics consent validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Analytics consent validation passed.');
