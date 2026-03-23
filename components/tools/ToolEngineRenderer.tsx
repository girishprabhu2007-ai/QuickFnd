"use client";

import type { PublicContentItem } from "@/lib/content-pages";
import UniversalToolEngineRenderer from "@/components/tools/UniversalToolEngineRenderer";

type Props = {
  item: PublicContentItem;
};

export default function ToolEngineRenderer({ item }: Props) {
  return <UniversalToolEngineRenderer item={item} />;
}