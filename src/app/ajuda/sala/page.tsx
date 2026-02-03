import Link from "next/link";
import { BookOpen, ArrowRight, LogIn } from "lucide-react";

export default function AjudaSalaPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <div className="container-fluid max-w-4xl py-12 space-y-10">
        <header className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-8 space-y-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#64748B]">
            <BookOpen className="h-4 w-4" aria-hidden /> Manual
          </div>
          <h1 className="text-fluid-2xl font-bold text-[#0F172A]">Sala de Aula (MVP) — Como usar</h1>
          <p className="text-fluid-sm text-[#64748B]">
            Este manual descreve o fluxo recomendado para uso em sala, sem WebSockets (atualização por polling),
            com token mágico (hash no banco) e diagnóstico com autosave.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/sala"
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#1E3A8A] text-[#1E3A8A] text-sm rounded-lg hover:bg-[#1E3A8A]/5 transition-colors"
            >
              <ArrowRight className="h-4 w-4" /> Ir para Salas
            </Link>
            <Link
              href="/sala/entrar"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white text-sm rounded-lg hover:bg-[#1E3A8A]/90 transition-colors"
            >
              <LogIn className="h-4 w-4" /> Página de entrada (participante)
            </Link>
          </div>
        </header>

        <section className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold text-[#0F172A]">1) Preparação (consultor)</h2>
          <ol className="list-decimal pl-6 space-y-2 text-[#0F172A]">
            <li>Acesse <code>/sala/criar</code> e crie a sala.</li>
            <li>
              Copie e guarde <strong>código</strong> e <strong>token</strong> (o token aparece uma única vez).
            </li>
            <li>Compartilhe com os alunos: link <code>/sala/entrar?code=SEUCODIGO</code> + o token.</li>
            <li>
              No painel da sala (<code>/sala/[id]</code>), mantenha em <strong>PREPARACAO</strong> até todos entrarem.
            </li>
          </ol>
        </section>

        <section className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold text-[#0F172A]">2) Entrada (participante)</h2>
          <ol className="list-decimal pl-6 space-y-2 text-[#0F172A]">
            <li>Acesse <code>/sala/entrar</code> e informe código + token.</li>
            <li>Preencha nome e (opcionalmente) e-mail/órgão/função.</li>
            <li>Ao entrar, o sistema guarda o token no browser e redireciona para o diagnóstico.</li>
          </ol>
          <p className="text-[#475569] text-sm">
            Observação: não é necessário login para o participante no MVP.
          </p>
        </section>

        <section className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold text-[#0F172A]">3) Preenchimento do Diagnóstico (participante)</h2>
          <ul className="list-disc pl-6 space-y-2 text-[#0F172A]">
            <li>
              O diagnóstico salva em rascunho automaticamente (autosave local + autosave no servidor quando possível).
            </li>
            <li>Ao submeter, o diagnóstico fica <strong>SUBMITTED</strong> e entra no fluxo do consultor.</li>
          </ul>
        </section>

        <section className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold text-[#0F172A]">4) Acompanhamento (consultor)</h2>
          <ul className="list-disc pl-6 space-y-2 text-[#0F172A]">
            <li>
              No painel da sala (<code>/sala/[id]</code>), os contadores e lista de diagnósticos atualizam a cada ~5s.
            </li>
            <li>
              Se houver edição concorrente, surgirá aviso de <strong>conflito</strong> (last-write-wins) e você pode
              registrar resolução.
            </li>
            <li>Relatório HTML: <code>/diagnostico/imprimir?id=&lt;diagnosticoId&gt;</code> e imprimir no navegador.</li>
          </ul>
        </section>

        <section className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold text-[#0F172A]">5) Regras e segurança (MVP)</h2>
          <ul className="list-disc pl-6 space-y-2 text-[#0F172A]">
            <li>O token mágico é armazenado apenas como hash.</li>
            <li>Rotas sensíveis registram auditoria mínima (inclui 401/403 bloqueados).</li>
            <li>Participante acessa ações de sala/diagnóstico via <code>classroomCode+classroomToken</code>.</li>
          </ul>
        </section>

        <hr className="border-[#E2E8F0]" />
        <footer className="text-xs text-[#64748B] py-4">
          Dica: use o modo de impressão do navegador para gerar PDF (fase 2 terá PDF server-side).
        </footer>
      </div>
    </main>
  );
}

