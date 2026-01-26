"use client";

import { ComplianceStatus } from "@/components/reports/ComplianceStatus";

// Mock de dados de análise
const mockComplianceData = {
  overall: 72,
  categories: [
    { name: "Processos Licitatórios", score: 85 },
    { name: "Documentação", score: 70 },
    { name: "Conformidade Legal", score: 65 },
    { name: "Gestão de Contratos", score: 68 },
    { name: "Transparência", score: 75 },
  ],
};

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
          <ComplianceStatus data={mockComplianceData} />
        </div>
      </div>
    </div>
  );
}
