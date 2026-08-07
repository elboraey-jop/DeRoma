"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { SiteSettingsData, DEFAULT_SITE_SETTINGS } from "@/lib/siteSettings";

const SiteSettingsContext = createContext<SiteSettingsData>(DEFAULT_SITE_SETTINGS);

export function SiteSettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: SiteSettingsData;
}) {
  const [settings, setSettings] = useState<SiteSettingsData>(
    initialSettings || DEFAULT_SITE_SETTINGS
  );

  useEffect(() => {
    if (!initialSettings) {
      fetch("/api/site-settings")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setSettings(data);
        })
        .catch(() => null);
    }
  }, [initialSettings]);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
