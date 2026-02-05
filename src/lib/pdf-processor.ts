import { createCanvas, Canvas, Image } from "canvas";
import fs from "fs";
import path from "path";

// Usar build principal (compatível com Node). Worker: caminho absoluto no disco (Next/Turbopack pode devolver ID numérico em require.resolve)
const pdfjsLib = require("pdfjs-dist/build/pdf.js");
const candidateDirs: string[] = [path.join(process.cwd(), "node_modules", "pdfjs-dist")];
try {
  const resolved = require.resolve("pdfjs-dist/package.json");
  if (typeof resolved === "string") {
    candidateDirs.push(path.dirname(resolved));
  }
} catch {
  // require.resolve pode falhar ou retornar não-string no bundle; usar só process.cwd()
}
let workerPath: string | null = null;
for (const dir of candidateDirs) {
  const candidate = path.join(dir, "build", "pdf.worker.js");
  if (fs.existsSync(candidate)) {
    workerPath = candidate;
    break;
  }
}
if (workerPath && typeof pdfjsLib.GlobalWorkerOptions !== "undefined") {
  (pdfjsLib.GlobalWorkerOptions as { workerSrc: string }).workerSrc = workerPath;
}

// Factory para PDF.js v3+ Node
class NodeCanvasFactory {
    create(width: number, height: number) {
        const canvas = createCanvas(width, height);
        const context = canvas.getContext("2d");
        return {
            canvas,
            context,
        };
    }

    reset(canvasAndContext: any, width: number, height: number) {
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
    }

    destroy(canvasAndContext: any) {
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
        canvasAndContext.canvas = null;
        canvasAndContext.context = null;
    }
}

export async function processPdf(pdfBuffer: Buffer): Promise<Buffer[]> {
    const data = new Uint8Array(pdfBuffer);

    const loadingTask = pdfjsLib.getDocument({
        data,
        disableFontFace: true,
        verbosity: 0,
        isEvalSupported: false, // Mitiga GHSA-wgrm-67xf-hhpq (execução de JS arbitrário em PDF malicioso)
    });

    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    const images: Buffer[] = [];
    const canvasFactory = new NodeCanvasFactory();

    for (let i = 1; i <= numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);

        const renderContext = {
            canvasContext: canvasAndContext.context,
            viewport,
            canvasFactory
        };

        // Render e aguardar
        await page.render(renderContext).promise;

        // Converter
        const imageBuffer = (canvasAndContext.canvas as any).toBuffer("image/jpeg", { quality: 0.8 });
        images.push(imageBuffer);

        page.cleanup();
    }

    return images;
}
