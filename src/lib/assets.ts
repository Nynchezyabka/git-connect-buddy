import assetsManifest from "../../assets-manifest.json";
import { CATEGORY_ASSET_MAP } from "@/types";

let loadedAssets: Record<string, string[]> = assetsManifest;

export function getRandomBackgroundForCategory(category: number): string | null {
  const folder = CATEGORY_ASSET_MAP[category];
  if (!folder || !loadedAssets[folder]) return null;
  const images = loadedAssets[folder];
  if (images.length === 0) return null;
  return "/" + images[Math.floor(Math.random() * images.length)];
}
