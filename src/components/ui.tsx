import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
export function Action({href,children,secondary=false}:{href:string;children:ReactNode;secondary?:boolean}) {return <Link className={`button ${secondary?'secondary':''}`} href={href}>{children}<ArrowRight size={16}/></Link>}
export function Badge({children,blue=false}:{children:ReactNode;blue?:boolean}) {return <span className={`badge ${blue?'blue':''}`}>{children}</span>}
export function Breadcrumbs({items}:{items:{label:string;href?:string}[]}) {return <nav aria-label="Хлебные крошки" className="breadcrumbs"><Link href="/">Главная</Link>{items.map((item,i)=><span key={i}><ChevronRight size={13}/>{item.href?<Link href={item.href}>{item.label}</Link>:<span aria-current="page">{item.label}</span>}</span>)}</nav>}
export function PageTitle({eyebrow,title,description,aside}:{eyebrow:string;title:string;description:string;aside?:ReactNode}) {return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{aside}</div>}
export function EmptyState({icon,title,children}:{icon:ReactNode;title:string;children:ReactNode}) {return <div className="empty-state"><div className="icon-box">{icon}</div><h2>{title}</h2>{children}</div>}
export function Skeleton(){return <div className="skeleton" role="status">Загружаем редактор…</div>}
export function Progress({value,max,label}:{value:number;max:number;label:string}){return <div><div className="row-between small"><span>{label}</span><span>{value} / {max}</span></div><progress value={value} max={max} aria-label={label}/></div>}
