"use client";

import { useTenant } from "@/hooks/useTenant";
import { AnnouncementBar } from "./AnnouncementBar";

export function AnnouncementBarWrapper() {
  const { config } = useTenant();

  if (!config) return null;

  return (
    <div id="global-announcement">
      <AnnouncementBar accentColor={config.theme.accentColor} config={config} />
    </div>
  );
}
