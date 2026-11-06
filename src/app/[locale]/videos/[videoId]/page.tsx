import RedesignPage, {redesignTitle} from '@/redesign/RedesignPage';
interface Props {params: Promise<{locale:string;videoId:string}>}
export async function generateMetadata({params}:Props) {const {videoId}=await params;return {title:redesignTitle('/videos/'+videoId)}}
export default async function Page({params}:Props) {const {locale,videoId}=await params;return <RedesignPage route={'/videos/'+videoId} locale={locale}/>}
