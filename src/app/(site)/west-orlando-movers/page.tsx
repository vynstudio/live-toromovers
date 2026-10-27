import type { Metadata } from "next";
import {
  AreaMoversPage,
  areaMetadata,
} from "@/components/area-movers-page";
import { WEST_ORLANDO } from "@/lib/west-orlando-movers";

export const metadata: Metadata = areaMetadata(WEST_ORLANDO);

export default function WestOrlandoMoversPage() {
  return <AreaMoversPage content={WEST_ORLANDO} />;
}