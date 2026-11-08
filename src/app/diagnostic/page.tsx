import { Breadcrumbs, PageTitle } from '@/components/ui';
import { Diagnostic } from '@/components/diagnostic';
export const metadata={title:'Диагностика'};
export default function Page(){return <><Breadcrumbs items={[{label:'Диагностика'}]}/><PageTitle eyebrow="ПЕРЕД ПЕРВЫМ ШАГОМ" title="Что вы уже знаете?" description="Диагностика поможет выбрать точку старта. Сейчас можно попробовать один пример вопроса."/><Diagnostic/></>}
