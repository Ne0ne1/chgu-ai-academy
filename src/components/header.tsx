'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ChevronDown, Moon, Sun, UserRound } from 'lucide-react';
import { useTheme } from './theme-provider';

const navigation = [['/', 'Главная'], ['/program', 'Программа'], ['/progress', 'Прогресс']];

export function Header() {
  const path = usePathname();
  const { theme, setTheme } = useTheme();
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !menu.current?.contains(event.target) && menu.current) menu.current.open = false;
    }
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);
  return <header className="site-header"><div className="header-inner">
    <Link className="brand" href="/" aria-label="CHGU AI Academy — главная">CHGU <span>AI Academy</span></Link>
    <nav className="main-nav" aria-label="Главная навигация">
      {navigation.map(([href, label]) => <Link key={href} href={href} aria-current={path === href || (href === '/program' && (path.startsWith('/learn/') || path.startsWith('/practice/'))) ? 'page' : undefined}>{label}</Link>)}
    </nav>
    <details className="user-menu" ref={menu} onKeyDown={event => {
      if (event.key === 'Escape' && menu.current?.open) { menu.current.open = false; menu.current.querySelector('summary')?.focus(); }
    }} onBlur={event => {
      if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
    }}>
      <summary aria-label="Меню пользователя"><UserRound size={17}/><span>Гость</span><ChevronDown size={13}/></summary>
      <div className="user-popover">
        <p className="small">Гостевой режим · без аккаунта</p>
        <fieldset className="theme-options"><legend>Тема оформления</legend>
          <label><input type="radio" name="theme" checked={theme === 'light'} onChange={() => setTheme('light')}/><Sun size={15}/>Светлая</label>
          <label><input type="radio" name="theme" checked={theme === 'dark'} onChange={() => setTheme('dark')}/><Moon size={15}/>Тёмная</label>
        </fieldset>
        <Link href="/about" onClick={() => { if (menu.current) menu.current.open = false; }}>О платформе</Link>
      </div>
    </details>
  </div></header>;
}
