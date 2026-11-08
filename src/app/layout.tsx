import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import '@fontsource-variable/source-serif-4';
import '@fontsource-variable/source-sans-3';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './globals.css';
import { Header } from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: { default: 'CHGU AI Academy — обучение', template: '%s · CHGU AI Academy' },
  description:
    'Браузерный учебный цикл Python: урок, проверка кода тестами, подсказка после ошибки и локальный прогресс.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get('chgu-theme')?.value === 'dark' ? 'dark' : 'light';
  return (
    <html lang="ru" data-theme={theme}>
      <body>
        <ThemeProvider initialTheme={theme}>
          <a href="#main" className="skip-link">
            Перейти к содержимому
          </a>
          <Header />
          <main id="main" className="container">
            {children}
          </main>
          <footer className="site-footer">
            <span>CHGU AI Academy</span>
            <span>Учебный прототип · без аккаунта</span>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
