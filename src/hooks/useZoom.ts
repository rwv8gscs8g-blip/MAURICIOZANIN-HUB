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
    setMeetings([]);
    setLoading(false);
  }, []);

  return {
    meetings,
    loading,
    refetch: () => {
      setLoading(true);
      setLoading(false);
    },
  };
}
