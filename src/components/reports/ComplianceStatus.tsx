"use client";

import { motion } from "framer-motion";

interface ComplianceData {
  overall: number; // 0-100
  categories: {
    name: string;
    score: number; // 0-100
  }[];
}

interface ComplianceStatusProps {
  data: ComplianceData;
}

export function ComplianceStatus({ data }: ComplianceStatusProps) {
  const getStatusColor = (score: number) => {
    if (score >= 80) return "bg-emerald-600";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getStatusText = (score: number) => {
    if (score >= 80) return "Conforme";
    if (score >= 60) return "Parcialmente Conforme";
    return "Não Conforme";
  };

  return (
    <div className="bg-white border border-[#E2E8F0] p-8">
      <h3 className="text-fluid-2xl font-bold text-[#0F172A] mb-8 tracking-tight">
        Status de Conformidade com Lei 14.133/2021
      </h3>

      {/* Overall Score */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-fluid-lg font-semibold text-[#0F172A]">
            Conformidade Geral
          </span>
          <span className="text-fluid-2xl font-bold text-[#0F172A] tracking-tight">
            {data.overall}%
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.overall}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${getStatusColor(data.overall)}`}
          />
        </div>
        <p className="text-fluid-sm text-[#64748B] mt-3">
          Status: {getStatusText(data.overall)}
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        <h4 className="text-fluid-lg font-semibold text-[#0F172A] mb-6">
          Análise por Categoria
        </h4>
        {data.categories.map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-fluid-sm font-medium text-[#0F172A]">
                {category.name}
              </span>
              <span className="text-fluid-sm font-semibold text-[#0F172A]">
                {category.score}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${category.score}%` }}
                transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                className={`h-full ${getStatusColor(category.score)}`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
