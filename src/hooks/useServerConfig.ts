"use client";

import { useState } from "react";
import { defaultServerConfig, getServerConfig, saveServerConfig } from "@/lib/serverConfig";
import type { ServerConfig } from "@/lib/types";

export function useServerConfig(): [ServerConfig, (next: ServerConfig) => void] {
  const [config, setConfig] = useState<ServerConfig>(
    typeof window !== "undefined" ? getServerConfig() : defaultServerConfig,
  );

  const update = (next: ServerConfig): void => {
    setConfig(next);
    saveServerConfig(next);
  };

  return [config, update];
}
