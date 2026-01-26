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

    // Mock de status de assinatura de contrato
    const mockStatus: DocumentStatus = {
      id: "1",
      documentKey: documentKey,
      status: "pending",
      signers: [
        {
          name: "João Silva",
          email: "joao@example.com",
          status: "signed",
          signedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          name: "Maria Santos",
          email: "maria@example.com",
          status: "pending",
        },
      ],
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      expiresAt: new Date(Date.now() + 604800000).toISOString(), // 7 dias
    };

    // Simular delay de API
    setTimeout(() => {
      setDocumentStatus(mockStatus);
      setLoading(false);
    }, 500);
  }, [documentKey]);

  return {
    documentStatus,
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
