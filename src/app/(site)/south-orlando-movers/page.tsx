import type { Metadata } from "next";
import {
  AreaMoversPage,
  areaMetadata,
} from "@/components/area-movers-page";
import { SOUTH_ORLANDO } from "@/lib/south-orlando-movers";

export const metadata: Metadata = areaMetadata(SOUTH_ORLANDO);

export default function SouthOrlandoMoversPage() {
  return <AreaMoversPage content={SOUTH_ORLANDO} />;
}
