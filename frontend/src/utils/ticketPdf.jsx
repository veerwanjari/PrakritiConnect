import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import EventTicketVisual from '../components/EventTicketVisual.jsx';

async function rasterize(node) {
  return html2canvas(node, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
}

function savePdfFromCanvas(canvas, fileName) {
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('l', 'mm', 'a4');
  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;
  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const x = margin;
  const y = margin + (contentHeight - imgHeight) / 2;
  pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
  pdf.save(fileName);
}

function fileNameFor(registration) {
  const title = registration?.event?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'ticket';
  return `${title}_PrakritiConnect_ticket.pdf`;
}

/** Generate + download a ticket PDF from an already-rendered DOM node. */
export async function downloadTicketFromNode(node, registration) {
  const canvas = await rasterize(node);
  savePdfFromCanvas(canvas, fileNameFor(registration));
}

/** Generate + download a ticket PDF without needing a visible ticket on screen. */
export async function downloadTicketPdf(registration) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.padding = '20px';
  document.body.appendChild(container);

  const root = createRoot(container);
  await new Promise((resolve) => {
    root.render(<EventTicketVisual registration={registration} ref={resolve} />);
  });
  // Give web fonts and the QR image a moment to paint before rasterizing.
  await new Promise((r) => setTimeout(r, 350));

  try {
    const node = container.firstElementChild;
    await downloadTicketFromNode(node, registration);
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}
