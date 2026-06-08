import { setRequestLocale, getTranslations } from "next-intl/server";
import { localizedPath, generatePageMetadata } from "@/utils/i18n";
import { faqSchema, JsonLd } from "@/components/StructuredData";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return generatePageMetadata(locale, "faq", "/faq");
}

export default async function FAQ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "faq" });
  const questions = t.raw("questions") as Array<{ question: string; answer: string }>;
  const applyTrialPath = localizedPath("/apply-trial", locale);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {questions.map((faq, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {faq.question}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gray-50 dark:bg-gray-900 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t("ctaTitle")}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t("ctaDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={applyTrialPath}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors"
            >
              {t("ctaPrimary")}
            </a>
            <a
              href="mailto:info@dynamia.ai"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:bg-gray-900 transition-colors"
            >
              {t("ctaSecondary")}
            </a>
          </div>
        </div>
      </div>

      <JsonLd data={faqSchema(questions)} />
    </div>
  );
}
