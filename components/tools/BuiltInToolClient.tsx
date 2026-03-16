"use client";

import type { PublicContentItem } from "@/lib/content-pages";
import ToolEngineRenderer from "@/components/tools/ToolEngineRenderer";

type Props = {
  item: PublicContentItem;
};

export default function BuiltInToolClient({ item }: Props) {
  return <ToolEngineRenderer item={item} />;
}