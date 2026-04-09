import { pageMetadata } from "@/utils/seo";
import HomeClient from "./HomeClient";

export const metadata = pageMetadata.home;

export default function Home() {
  return <HomeClient />;
}
