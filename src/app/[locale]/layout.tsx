import React from 'react';
import { Barlow_Condensed, Archivo } from 'next/font/google';
import { AuthProvider } from '@/sections/tournaments/auth-context';
import { TournamentProvider } from '@/sections/tournaments/tournament-provider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import '@/styles/globals.css';

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-archivo',
  display: 'swap',
});

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${barlowCondensed.variable} ${archivo.variable}`}>
      <body className="antialiased font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <TournamentProvider>
              {children}
            </TournamentProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};
