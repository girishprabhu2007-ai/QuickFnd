"use client";

import type { PublicContentItem } from "@/lib/content-pages";
import UniversalToolEngineRenderer from "@/components/tools/UniversalToolEngineRenderer";
import PasswordStrengthCheckerClient from "@/components/tools/PasswordStrengthCheckerClient";

type Props = {
  item: PublicContentItem;
};

export default function BuiltInToolClient({ item }: Props) {
  if (item.slug === "password-strength-checker") {
    return <PasswordStrengthCheckerClient />;
  }

  return <UniversalToolEngineRenderer item={item} />;
}