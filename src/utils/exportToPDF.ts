import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportToPDF(
  elements: HTMLElement | (HTMLElement | null)[],
  filename: string
) {
  const pdf = new jsPDF("p", "mm", "a4");

  const elementsArray = Array.isArray(elements) ? elements : [elements];

  let yOffset = 10;

  for (const element of elementsArray) {
    if (!element) continue;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    if (yOffset + pdfHeight > pdf.internal.pageSize.getHeight()) {
      pdf.addPage();
      yOffset = 10;
    }

    pdf.addImage(imgData, "PNG", 10, yOffset, pdfWidth, pdfHeight);
    yOffset += pdfHeight + 10;
  }

  pdf.save(`${filename}.pdf`);
}
