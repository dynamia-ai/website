import RedesignPage, { redesignTitle } from '@/redesign/RedesignPage';
import {setRequestLocale} from 'next-intl/server';
interface Props {params: Promise<{locale: string}>}
export function generateMetadata() {return {title: redesignTitle('/events')}}
export default async function Page({params}: Props) {
  const {locale}=await params;setRequestLocale(locale);
  return <RedesignPage route="/events" locale={locale}/>;
}
