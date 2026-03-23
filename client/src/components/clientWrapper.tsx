"use client";

import BonguFlixIntro from "./BonguFlixIntro";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BonguFlixIntro>{children}</BonguFlixIntro>;
}