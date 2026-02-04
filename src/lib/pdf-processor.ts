import { createCanvas, Canvas, Image } from "canvas";
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

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
        verbosity: 0
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
