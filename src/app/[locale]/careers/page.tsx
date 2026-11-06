import RedesignPage, { redesignTitle } from '@/redesign/RedesignPage';
import {redirect} from 'next/navigation';
import {localizedPath} from '@/utils/i18n';
import {setRequestLocale} from 'next-intl/server';
interface Props {params: Promise<{locale: string}>}
export function generateMetadata() {return {title: redesignTitle('/careers')}}
export default async function Page({params}: Props) {
  const {locale}=await params;
  if(locale!=='zh')redirect(localizedPath('/company',locale));
  setRequestLocale(locale);
  return <RedesignPage route="/careers" locale={locale}/>;
}
