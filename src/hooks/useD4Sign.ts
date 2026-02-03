import { useState, useEffect } from "react";

interface DocumentStatus {
  id: string;
  documentKey: string;
  status: "pending" | "signed" | "rejected" | "expired";
  signers: Signer[];
  createdAt: string;
  expiresAt?: string;
}

interface Signer {
  name: string;
  email: string;
  status: "pending" | "signed" | "rejected";
  signedAt?: string;
}

export function useD4Sign(documentKey?: string) {
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!documentKey) {
      setLoading(false);
      return;
    }

    setDocumentStatus(null);
    setLoading(false);
  }, [documentKey]);

  return {
    documentStatus,
    loading,
    refetch: () => {
      setLoading(true);
      setLoading(false);
    },
  };
}
