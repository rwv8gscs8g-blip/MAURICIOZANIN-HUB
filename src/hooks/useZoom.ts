import { useState, useEffect } from "react";

interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  zoomUrl?: string;
  zoomId?: string;
  zoomPasscode?: string;
}

export function useZoom() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock de lista de reuniões
    const mockMeetings: Meeting[] = [
      {
        id: "1",
        title: "Reunião de Alinhamento - Projeto X",
        description: "Discussão sobre conformidade com Lei 14.133/2021",
        startTime: new Date(Date.now() + 86400000).toISOString(), // Amanhã
        endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
        zoomUrl: "https://zoom.us/j/123456789",
        zoomId: "123456789",
        zoomPasscode: "ABC123",
      },
      {
        id: "2",
        title: "Workshop de Compras Públicas",
        description: "Capacitação sobre processos licitatórios",
        startTime: new Date(Date.now() + 172800000).toISOString(), // Depois de amanhã
        zoomUrl: "https://zoom.us/j/987654321",
        zoomId: "987654321",
        zoomPasscode: "XYZ789",
      },
    ];

    // Simular delay de API
    setTimeout(() => {
      setMeetings(mockMeetings);
      setLoading(false);
    }, 500);
  }, []);

  return {
    meetings,
    loading,
    refetch: () => {
      setLoading(true);
      // Re-executar o fetch
      setTimeout(() => {
        setLoading(false);
      }, 500);
    },
  };
}
