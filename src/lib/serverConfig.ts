import type { ServerConfig } from "@/lib/types";

const DEFAULT_HOST = process.env.NEXT_PUBLIC_DEFAULT_SERVER_HOST ?? "192.168.0.15";
const DEFAULT_PORT = Number(process.env.NEXT_PUBLIC_DEFAULT_SERVER_PORT ?? "4180");

export const defaultServerConfig: ServerConfig = { host: DEFAULT_HOST, port: DEFAULT_PORT };

const KEY = "my-garden-diary-server";

export function getServerConfig(): ServerConfig {
  if (typeof window === "undefined") return defaultServerConfig;
  const raw = localStorage.getItem(KEY);
  if (!raw) return defaultServerConfig;
  try {
    return JSON.parse(raw) as ServerConfig;
  } catch {
    localStorage.removeItem(KEY);
    return defaultServerConfig;
  }
}

export function saveServerConfig(config: ServerConfig): void {
  localStorage.setItem(KEY, JSON.stringify(config));
}

export function clearServerConfig(): void {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}

export function hasSavedServerConfig(): boolean {
  return typeof window !== "undefined" && localStorage.getItem(KEY) !== null;
}

/**
 * 明示的に保存された設定がある場合のみ絶対URLを返す。
 * 未設定の場合は空文字（相対URL）を返し、現在のサーバを使う。
 */
export function getBaseUrl(): string {
  if (typeof window === "undefined") return "";
  const raw = localStorage.getItem(KEY);
  if (!raw) return "";
  try {
    const { host, port } = JSON.parse(raw) as ServerConfig;
    return `http://${host}:${port}`;
  } catch {
    localStorage.removeItem(KEY);
    return "";
  }
}
