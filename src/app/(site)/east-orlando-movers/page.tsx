import type { Metadata } from "next";
import {
  AreaMoversPage,
  areaMetadata,
} from "@/components/area-movers-page";
import { EAST_ORLANDO } from "@/lib/east-orlando-movers";

export const metadata: Metadata = areaMetadata(EAST_ORLANDO);

export default function EastOrlandoMoversPage() {
  return <AreaMoversPage content={EAST_ORLANDO} />;
}
