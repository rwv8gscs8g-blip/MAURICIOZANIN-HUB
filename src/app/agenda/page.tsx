"use client";

import { useZoom } from "@/hooks/useZoom";
import { Calendar, Clock, Video, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function AgendaPage() {
  const { meetings, loading } = useZoom();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-12 flex items-center justify-center">
        <div className="text-[#64748B] text-fluid-base">Carregando reuniões...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-4 tracking-tight">
            Agenda
          </h1>
          <p className="text-fluid-base text-[#64748B] mb-12 leading-[1.7]">
            Agenda em consolidação para publicação das próximas ações
          </p>

          {meetings.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] p-12 text-center">
              <Calendar className="h-12 w-12 text-[#64748B] mx-auto mb-4" />
              <p className="text-[#64748B] text-fluid-base">Nenhuma reunião agendada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting, index) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-[#E2E8F0] p-6 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-fluid-xl font-semibold text-[#0F172A] mb-2 tracking-tight">
                        {meeting.title}
                      </h3>
                      {meeting.description && (
                        <p className="text-fluid-base text-[#64748B] mb-4 leading-[1.7]">
                          {meeting.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-6 text-fluid-sm text-[#64748B]">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(
                              new Date(meeting.startTime),
                              "dd/MM/yyyy 'às' HH:mm"
                            )}
                          </span>
                        </div>
                        {meeting.zoomId && (
                          <div className="flex items-center space-x-2">
                            <Video className="h-4 w-4" />
                            <span>ID: {meeting.zoomId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {meeting.zoomUrl && (
                      <a
                        href={meeting.zoomUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 bg-[#1E3A8A] text-white px-5 py-2.5 text-fluid-sm font-medium transition-colors hover:bg-[#1E3A8A]/90 border border-[#1E3A8A]"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Entrar</span>
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
