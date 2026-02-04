import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Configuração do Cliente R2 (Compatível com S3)
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // Ex: https://media.mauriciozanin.com

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    console.warn(
        "[Storage] Credenciais R2 incompletas. Uploads falharão. Verifique R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME."
    );
}

export const storageClient = new S3Client({
    region: "auto",
    endpoint: `https://${(R2_ACCOUNT_ID || "").trim()}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: (R2_ACCESS_KEY_ID || "").trim(),
        secretAccessKey: (R2_SECRET_ACCESS_KEY || "").trim(),
    },
});

export function getPublicUrl(key: string): string {
    if (R2_PUBLIC_URL) {
        return `${R2_PUBLIC_URL}/${key}`;
    }
    return `https://${R2_BUCKET_NAME}.r2.cloudflarestorage.com/${key}`;
}

export async function uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string,
    folder: string = "uploads"
): Promise<string> {
    const key = `${folder}/${fileName}`;

    try {
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
            // ACL: "public-read", // R2 geralmente gerencia publicidade via Bucket Policy ou Worker
        });

        await storageClient.send(command);

        // Retorna a URL pública
        if (R2_PUBLIC_URL) {
            return `${R2_PUBLIC_URL}/${key}`;
        }
        // Fallback para URL direta do R2 (se tiver permissão pública)
        return `https://${R2_BUCKET_NAME}.r2.cloudflarestorage.com/${key}`;
    } catch (error) {
        console.error(`[Storage] Erro no upload de ${fileName}:`, error);
        throw new Error("Falha ao enviar arquivo para o R2.");
    }
}

export async function fetchFile(fileUrl: string): Promise<Buffer> {
    // Se for URL completa, extrair a chave se possível, ou usar fetch simples se for pública
    // Para simplificar, assumimos que fileUrl é acessível publicamente ou via fetch
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error(`Falha ao baixar arquivo: ${res.statusText}`);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function listFolder(prefix: string): Promise<string[]> {
    try {
        const command = new ListObjectsV2Command({
            Bucket: process.env.R2_BUCKET_NAME,
            Prefix: prefix,
        });

        const response = await storageClient.send(command);
        return response.Contents?.map((item) => item.Key || "").filter(Boolean) || [];
    } catch (error) {
        console.error(`[Storage] Erro ao listar pasta ${prefix}:`, error);
        return [];
    }
}
