import forge from "node-forge";
import crypto from "crypto";

export type CertificateInfo = {
  thumbprint: string;
  subject: string;
  cpfCnpj?: string | null;
  validFrom: Date;
  validTo: Date;
};

export function parseCertificate(buffer: Buffer, password: string): CertificateInfo {
  const p12Der = forge.util.createBuffer(buffer.toString("binary"));
  const p12Asn1 = forge.asn1.fromDer(p12Der);
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

  const bags = p12.getBags({ bagType: forge.pki.oids.certBag })[
    forge.pki.oids.certBag
  ];
  if (!bags || !bags.length) {
    throw new Error("Nenhum certificado encontrado no arquivo.");
  }

  const cert = bags[0].cert;
  if (!cert) {
    throw new Error("Certificado inválido no arquivo.");
  }
  const subject = cert.subject.attributes
    .map((attr: any) => `${attr.shortName || attr.name}=${attr.value}`)
    .join(", ");

  // Thumbprint (SHA-256) a partir do DER
  const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
  const thumbprint = crypto.createHash("sha256").update(Buffer.from(certDer, "binary")).digest("hex");

  // CPF/CNPJ em certificados ICP-Brasil costuma aparecer no serialNumber ou em OIDs específicos
  let cpfCnpj: string | null = null;
  const serial = cert.subject.getField("serialNumber");
  if (serial?.value) {
    const digits = String(serial.value).replace(/\D/g, "");
    if (digits.length === 11 || digits.length === 14) cpfCnpj = digits;
  }

  return {
    thumbprint,
    subject,
    cpfCnpj,
    validFrom: cert.validity.notBefore,
    validTo: cert.validity.notAfter,
  };
}
