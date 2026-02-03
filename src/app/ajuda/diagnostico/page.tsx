import Link from "next/link";

export default function AjudaDiagnosticoPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container-fluid max-w-4xl py-12 space-y-10">
        <header className="space-y-3">
          <div className="text-xs uppercase tracking-[0.24em] text-[#64748B]">Ajuda</div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Diagnóstico (MVP) — Como preencher</h1>
          <p className="text-[#475569]">
            Guia rápido do wizard do Diagnóstico Cidade Empreendedora (Eixo 5 - Compras), incluindo autosave,
            submissão e visualização do relatório HTML.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/diagnostico" className="px-4 py-2 bg-[#1E3A8A] text-white text-sm">
              Abrir Diagnóstico
            </Link>
            <Link href="/ajuda/sala" className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-sm">
              Manual de Sala
            </Link>
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#0F172A]">Autosave e prevenção de perda</h2>
          <ul className="list-disc pl-6 space-y-2 text-[#0F172A]">
            <li>O sistema salva automaticamente em memória local do navegador (para recuperar se a aba fechar).</li>
            <li>Quando possível, também salva no servidor em rascunho (especialmente no fluxo via sala).</li>
            <li>Ao trocar de aba ou perder foco, o sistema tenta preservar o que foi digitado.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#0F172A]">Submissão</h2>
          <ul className="list-disc pl-6 space-y-2 text-[#0F172A]">
            <li>Ao submeter, o status muda para <strong>SUBMITTED</strong>.</li>
            <li>No fluxo via sala, a submissão usa <code>classroomCode+classroomToken</code> (sem login).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#0F172A]">Consultor: onde avaliar diagnósticos enviados</h2>
          <p className="text-[#475569]">
            Para ver e avaliar diagnósticos <strong>pendentes de avaliação</strong> (enviados a partir de uma sala), use uma destas opções:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-[#0F172A]">
            <li>
              <strong>Página do cliente:</strong> clique no card &quot;Avaliar diagnósticos enviados&quot; — abre a tela só de pendentes.
            </li>
            <li>
              <strong>Passo 3 do fluxo:</strong> na página de diagnóstico, no &quot;Fluxo em sala de aula&quot;, use o botão &quot;Ir para Diagnósticos submetidos (só pendentes)&quot;.
            </li>
            <li>
              <strong>Nesta página (completa):</strong> role até a seção &quot;Diagnósticos submetidos (Análise de respostas recebidas)&quot; ou use a tabela &quot;Municípios … Criar, editar e ajustar&quot; e clique em Editar / Radiografia / Ver diagnóstico no município.
            </li>
          </ul>
          <div className="flex flex-wrap gap-3 mt-3">
            <Link href="/diagnostico?view=submitted" className="px-4 py-2 bg-amber-100 text-amber-800 text-sm font-medium rounded-lg hover:bg-amber-200">
              Ir para tela só de pendentes
            </Link>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#0F172A]">Relatório HTML</h2>
          <ul className="list-disc pl-6 space-y-2 text-[#0F172A]">
            <li>
              Abra <code>/diagnostico/imprimir?id=&lt;diagnosticoId&gt;</code> e use imprimir do navegador.
            </li>
            <li>O layout é print-friendly via <code>@media print</code>.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}

