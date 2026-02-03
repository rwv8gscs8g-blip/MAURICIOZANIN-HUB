"use client";

import { ComplianceStatus } from "@/components/reports/ComplianceStatus";

const complianceData = null;

export default function RelatoriosPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-4 tracking-tight">
            Relatórios de Análise
          </h1>
          <p className="text-fluid-base text-[#64748B] mb-12 leading-[1.7]">
            Análise detalhada de conformidade com a Lei 14.133/2021
          </p>
          {complianceData ? (
            <ComplianceStatus data={complianceData} />
          ) : (
            <div className="border border-[#E2E8F0] bg-white p-8 text-fluid-base text-[#64748B]">
              Relatórios em consolidação. Em breve, publicaremos as análises oficiais.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
