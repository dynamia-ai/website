import { pageMetadataZh } from "@/utils/seo";
import ZhHomeClient from "./ZhHomeClient";

export const metadata = pageMetadataZh.home;

export default function ZhHome() {
  return <ZhHomeClient />;
}
