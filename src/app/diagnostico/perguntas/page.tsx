import Link from "next/link";
import { eixosDiagnostico, checklistPorEixo } from "@/data/diagnostico-eixos";

export const dynamic = "force-dynamic";

export default function DiagnosticoPerguntasPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="container-fluid max-w-5xl space-y-8">
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[#64748B]">
              Diagnóstico • Configuração
            </div>
            <h1 className="text-fluid-2xl font-bold text-[#0F172A] mt-1">
              Editar perguntas do diagnóstico
            </h1>
            <p className="text-fluid-sm text-[#64748B] mt-2">
              Esta é uma visão administrativa para revisar a estrutura de eixos, perguntas e checklists
              que aparecem no formulário de diagnóstico. No MVP, as alterações são conceituais (não salvam
              ainda no banco); servem para validar o texto e a organização.
            </p>
          </div>
          <Link
            href="/clientes/sebrae"
            className="inline-flex items-center justify-center px-4 py-2 border border-[#E2E8F0] text-sm text-[#0F172A] bg-white rounded-lg hover:bg-[#F8FAFC]"
          >
            Voltar ao cliente
          </Link>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">Eixos do diagnóstico</h2>
            <p className="text-sm text-[#64748B] mt-1">
              Abaixo estão os eixos atuais e os tópicos curtos (Parte 1) sugeridos para cada um. Use esta
              página para revisar o conteúdo e alinhar o texto; em uma próxima etapa, conectaremos um
              editor persistente.
            </p>
          </div>

          <div className="space-y-6">
            {eixosDiagnostico.map((eixo) => {
              const checklists = checklistPorEixo[eixo.key as keyof typeof checklistPorEixo];
              return (
                <div key={eixo.key} className="border border-[#E2E8F0] rounded-lg p-5">
                  <h3 className="text-base font-semibold text-[#0F172A]">{eixo.title}</h3>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#94A3B8] mt-1">
                    Chave interna: {eixo.key}
                  </p>
                  <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm text-[#0F172A]">
                    <div>
                      <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-[0.18em] mb-2">
                        Aspectos positivos (Parte 1)
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {(checklists?.positivo || []).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-[0.18em] mb-2">
                        Aspectos negativos (Parte 1)
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {(checklists?.negativo || []).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-[0.18em] mb-2">
                        Alternativas de solução (Parte 1)
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {(checklists?.solucao || []).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-50 border border-dashed border-[#CBD5E1] rounded-xl p-5 text-sm text-[#64748B]">
          <p className="font-medium text-[#0F172A] mb-1">Próximos passos (MVP)</p>
          <p>
            Após validarmos o texto das perguntas e checklists com você, podemos evoluir esta página para
            um editor completo, salvando as alterações em banco de dados e refletindo automaticamente nos
            formulários utilizados nas salas de aula.
          </p>
        </div>
      </div>
    </div>
  );
}

