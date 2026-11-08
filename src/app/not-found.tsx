import { Action } from '@/components/ui';
export default function NotFound(){return <div className="empty-state"><span className="eyebrow">404</span><h1>Такой страницы пока нет</h1><p>Открытые уроки и запланированные темы собраны в программе.</p><Action href="/program">К программе</Action></div>}
