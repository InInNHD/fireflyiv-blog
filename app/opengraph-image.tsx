import { getSiteInfo } from "@/lib/site";
import { makeOgImage, ogSize } from "@/lib/og-image";

export const alt = "FireflyIv 的萤火小站";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  const site = getSiteInfo();
  return makeOgImage(site.name, site.slogan);
}
