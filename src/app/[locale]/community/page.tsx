import RedesignPage, { redesignTitle } from '@/redesign/RedesignPage';
import {setRequestLocale} from 'next-intl/server';
interface Props {params: Promise<{locale: string}>}
export function generateMetadata() {return {title: redesignTitle('/community')}}
export default async function Page({params}: Props) {
  const {locale}=await params;setRequestLocale(locale);
  return <RedesignPage route="/community" locale={locale}/>;
}
