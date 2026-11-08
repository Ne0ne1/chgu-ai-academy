import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import '@fontsource-variable/inter';
import './globals.css';
import { Header } from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: { default: 'CHGU AI Academy — обучение', template: '%s · CHGU AI Academy' },
  description: 'Учебная программа AI Engineering на 12 месяцев: теория, практика и проверка навыков.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get('chgu-theme')?.value === 'dark' ? 'dark' : 'light';
  return <html lang="ru" data-theme={theme}><body><ThemeProvider initialTheme={theme}>
    <a href="#main" className="skip-link">Перейти к содержимому</a>
    <Header/>
    <main id="main" className="container">{children}</main>
    <footer className="site-footer"><span>CHGU AI Academy</span><span>Учебный прототип</span></footer>
  </ThemeProvider></body></html>;
}
