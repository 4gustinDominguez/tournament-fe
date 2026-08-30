import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'es'];

export default getRequestConfig(async ({ requestLocale }) => {
    const locale = (await requestLocale) || 'es';
    // Validate that the incoming `locale` parameter is valid
    if (!locales.includes(locale as any)) notFound();

    const [mainMessages, docsMessages] = await Promise.all([
        import(`./messages/${locale}.json`),
        import(`./messages/docs-${locale}.json`)
    ]);

    return {
        locale,
        messages: {
            ...mainMessages.default,
            ...docsMessages.default
        }
    };
});
