"use client";

import { motion } from "framer-motion";
import { ShoppingCart, MapPin, Handshake } from "lucide-react";
import { useState } from "react";

const pillars = [
  {
    title: "Compras Governamentais",
    description:
      "Consultoria especializada em processos licitatórios, conformidade com a Lei 14.133/2021 e otimização de compras públicas.",
    icon: ShoppingCart,
  },
  {
    title: "Municípios",
    description:
      "Apoio técnico para gestão municipal, planejamento estratégico e implementação de políticas públicas eficientes.",
    icon: MapPin,
  },
  {
    title: "Cooperação",
    description:
      "Fomento à cooperação intermunicipal, consórcios públicos e parcerias estratégicas para desenvolvimento regional.",
    icon: Handshake,
  },
];

export function TriplePillar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-white">
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-fluid-3xl font-bold text-[#0F172A] mb-4 tracking-tight">
            Os Três Pilares da Consultoria
          </h2>
          <p className="text-fluid-base text-[#64748B] max-w-2xl mx-auto leading-[1.8]">
            Nossa abordagem integrada garante resultados eficazes em todas as
            dimensões da gestão pública.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const isHovered = hoveredIndex === index;
            
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="group"
              >
                <div className="border border-[#E2E8F0] bg-transparent p-8 transition-all duration-300 ease-out hover:-translate-y-1">
                  <div className="mb-6">
                    <Icon
                      className={`h-8 w-8 text-[#64748B] transition-colors duration-300 ${
                        isHovered ? "text-[#1E3A8A]" : ""
                      }`}
                    />
                  </div>
                  <h3 className="text-fluid-xl font-bold text-[#0F172A] mb-4 tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-fluid-base text-[#64748B] leading-[1.8]">
                    {pillar.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
