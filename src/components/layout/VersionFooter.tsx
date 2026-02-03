"use client";

import { useEffect, useState } from "react";
import { getVersionInfo, formatBuildDate } from "@/lib/version";

export function VersionFooter() {
  const [versionInfo, setVersionInfo] = useState<ReturnType<typeof getVersionInfo> | null>(null);

  useEffect(() => {
    setVersionInfo(getVersionInfo());
  }, []);

  if (!versionInfo) {
    return (
      <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-fluid-xs text-[#94A3B8]">
          <span>Carregando versão...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-fluid-xs text-[#94A3B8]">
        <div className="flex items-center gap-1">
          <span className="font-medium">Versão:</span>
          <span className="font-mono">{versionInfo.version}</span>
        </div>
        <span className="hidden md:inline">•</span>
        <div className="flex items-center gap-1">
          <span className="font-medium">Build:</span>
          <span className="font-mono">{versionInfo.build}</span>
        </div>
        <span className="hidden md:inline">•</span>
        <div className="flex items-center gap-1">
          <span className="font-medium">Deploy:</span>
          <span>{formatBuildDate(versionInfo.buildDate)}</span>
        </div>
        <span className="hidden md:inline">•</span>
        <div className="flex items-center gap-1">
          <span className="font-medium">Ambiente:</span>
          <span className="uppercase font-semibold">
            {versionInfo.environment === 'development' && 'DEV'}
            {versionInfo.environment === 'preview' && 'PREVIEW'}
            {versionInfo.environment === 'production' && 'PROD'}
          </span>
        </div>
      </div>
    </div>
  );
}
