import { toPng, toBlob } from "html-to-image";
import { jsPDF } from "jspdf";

/**
 * Converts an image URL (e.g. from Cloudinary or remote server)
 * into a base64 data URL to prevent CORS taint when rendering canvas.
 */
export async function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
  try {
    const res = await fetch(imageUrl, { credentials: "omit", mode: "cors" });
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("Could not convert image to base64, using original URL:", imageUrl, e);
    return imageUrl;
  }
}

/**
 * Downloads a Blob or DataURL as a file on Desktop / Mobile browsers.
 */
export function downloadFile(urlOrBlob: string | Blob, filename: string) {
  const isBlob = urlOrBlob instanceof Blob;
  const href = isBlob ? URL.createObjectURL(urlOrBlob) : urlOrBlob;

  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (isBlob) {
    setTimeout(() => URL.revokeObjectURL(href), 15000);
  }
}

/**
 * Exports a DOM element as a high-resolution PNG image (2.5x pixel ratio)
 * and triggers immediate download.
 */
export async function exportInvoiceAsPng(
  element: HTMLElement,
  filename: string = "invoice.png"
): Promise<{ success: boolean; dataUrl?: string }> {
  try {
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2.5,
      cacheBust: true,
      backgroundColor: "#FFFDF9",
    });

    downloadFile(dataUrl, filename.endsWith(".png") ? filename : `${filename}.png`);
    return { success: true, dataUrl };
  } catch (error) {
    console.error("Failed to export invoice as PNG:", error);
    throw error;
  }
}

/**
 * Exports a DOM element as a crisp, professionally formatted A4 PDF
 * and downloads it.
 */
export async function exportInvoiceAsPdf(
  element: HTMLElement,
  filename: string = "invoice.pdf"
): Promise<{ success: boolean }> {
  try {
    // Render high quality PNG from the DOM element first
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2.5,
      cacheBust: true,
      backgroundColor: "#FFFDF9",
    });

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = dataUrl;
    });

    const imgWidth = img.naturalWidth || img.width;
    const imgHeight = img.naturalHeight || img.height;

    // Standard A4 dimensions in mm
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // 8mm margin around page
    const margin = 8;
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;

    const imgRatio = imgWidth / imgHeight;
    let renderWidth = availableWidth;
    let renderHeight = availableWidth / imgRatio;

    // If height exceeds available page height, scale proportionally to fit page
    if (renderHeight > availableHeight) {
      renderHeight = availableHeight;
      renderWidth = availableHeight * imgRatio;
    }

    const posX = margin + (availableWidth - renderWidth) / 2;
    const posY = margin;

    pdf.addImage(dataUrl, "PNG", posX, posY, renderWidth, renderHeight, undefined, "FAST");

    const pdfName = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    pdf.save(pdfName);

    return { success: true };
  } catch (error) {
    console.error("Failed to export invoice as PDF:", error);
    throw error;
  }
}

/**
 * Uses the Web Share API (on iOS Safari / Android Chrome) to share the invoice image/file directly
 * (e.g. to WhatsApp, AirDrop, Save to Files).
 */
export async function shareInvoice(
  element: HTMLElement,
  orderNumber: string
): Promise<boolean> {
  try {
    const blob = await toBlob(element, {
      quality: 0.98,
      pixelRatio: 2.5,
      cacheBust: true,
      backgroundColor: "#FFFDF9",
    });

    if (!blob) return false;

    const file = new File([blob], `Invoice-${orderNumber}.png`, {
      type: "image/png",
    });

    if (
      navigator.canShare &&
      navigator.canShare({
        files: [file],
      })
    ) {
      await navigator.share({
        title: `DeRoma Invoice #${orderNumber}`,
        text: `Invoice #${orderNumber} from DeRoma Store`,
        files: [file],
      });
      return true;
    }

    // Fallback if file sharing not supported: trigger normal download
    downloadFile(blob, `Invoice-${orderNumber}.png`);
    return true;
  } catch (error) {
    if ((error as any)?.name === "AbortError") {
      // User cancelled share sheet
      return true;
    }
    console.error("Failed to share invoice:", error);
    return false;
  }
}

/**
 * Opens browser print dialog for the invoice
 */
export function printInvoiceElement(element: HTMLElement) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    window.print();
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <title>DeRoma Invoice</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Montserrat:wght@400;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          background-color: #FFFDF9;
          font-family: 'Cairo', 'Montserrat', sans-serif;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 10px;
        }
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
      </style>
    </head>
    <body>
      <div style="width: 100%; max-width: 800px;">
        ${element.outerHTML}
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.close();
          }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
