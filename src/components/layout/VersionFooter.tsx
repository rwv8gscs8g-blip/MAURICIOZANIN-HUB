"use client";

import { useEffect, useState } from "react";
import { getVersionInfo, formatBuildDate } from "@/lib/version";

function envLabel(env: string) {
  switch (env) {
    case "development": return "DEV";
    case "preview": return "PREVIEW";
    case "production": return "PROD";
    default: return env.toUpperCase();
  }
}

function envBadgeClass(env: string) {
  switch (env) {
    case "development":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    case "preview":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    case "production":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  }
}

export function VersionFooter() {
  const [versionInfo, setVersionInfo] = useState<ReturnType<typeof getVersionInfo> | null>(null);

  useEffect(() => {
    setVersionInfo(getVersionInfo());
  }, []);

  if (!versionInfo) {
    return (
      <footer className="mt-6 pt-4 border-t border-[#E2E8F0] dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Carregando...</span>
        </div>
      </footer>
    );
  }

  const badge = envLabel(versionInfo.environment);
  const badgeClass = envBadgeClass(versionInfo.environment);

  return (
    <footer className="mt-6 pt-4 border-t border-[#E2E8F0] dark:border-gray-700" aria-label="Informações do deploy">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-medium bg-gray-100 dark:bg-gray-800 font-mono">
          Deploy: {versionInfo.version}
        </span>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded font-semibold ${badgeClass}`}
          title="Ambiente de execução"
        >
          {badge}
        </span>
        <span className="font-mono" title="Build (commit ou timestamp)">
          Build: {versionInfo.build}
        </span>
        <span title="Data e hora do deploy">
          {formatBuildDate(versionInfo.buildDate)}
        </span>
      </div>
    </footer>
  );
}
