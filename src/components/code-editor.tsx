'use client';

import Editor, { loader } from '@monaco-editor/react';
import { useTheme } from './theme-provider';
loader.config({ paths: { vs: '/monaco/vs' } });

export default function CodeEditor({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  const { theme } = useTheme();
  return <Editor height="380px" language="python" theme={theme === 'dark' ? 'vs-dark' : 'light'} value={value}
    onChange={value => onChange(value ?? '')}
    loading={<div className="skeleton">Загружаем редактор. Если он недоступен, выберите простой редактор в меню «Ещё».</div>}
    options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 20 }, wordWrap: 'on', automaticLayout: true, tabSize: 4, ariaLabel: 'Редактор Python', accessibilitySupport: 'on' }}/>
}
