import DownloadsPage from '@/redesign/DownloadsPage';
import {getTranslations,setRequestLocale} from 'next-intl/server';
interface Props {params:Promise<{locale:string;productId:string}>}
export async function generateMetadata({params}:Props) {
  const {locale}=await params;
  const t=await getTranslations({locale,namespace:'redesignDownloads'});
  return {title:t('title')};
}
export default async function Page({params}:Props) {
  const {locale,productId}=await params;setRequestLocale(locale);
  return <DownloadsPage productId={productId}/>;
}
