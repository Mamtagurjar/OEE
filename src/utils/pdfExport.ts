
export type PdfExportOptions = {
  fileName: string;
  backgroundColor?: string;
  scale?: number;
  shareTitle?: string;
};

const nextAnimationFrame = (): Promise<void> =>
  new Promise((resolve) => requestAnimationFrame(() => resolve()));

export const waitForPaint = async (frames: number = 2): Promise<void> => {
  for (let i = 0; i < frames; i++) {
    await nextAnimationFrame();
  }
};

const pxToMm = (px: number): number => (px * 25.4) / 96;

export const exportElementToPdf = async (
  element: HTMLElement,
  options: PdfExportOptions,
): Promise<void> => {
  const {
    fileName,
    backgroundColor = '#ffffff',
    scale = 2,
    shareTitle,
  } = options;

  const [{ default: html2canvas }, { jsPDF }, { Capacitor }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
    import('@capacitor/core'),
  ]);

  // Ensure the element is in the layout.
  if (!element.isConnected) {
    throw new Error('PDF export target is not mounted in the DOM.');
  }

  // Assign a temporary ID to locate it in the cloned document
  const originalId = element.id;
  const tempId = `pdf-export-target-${Date.now()}`;
  element.id = tempId;

  let canvas: HTMLCanvasElement;
  try {
    const exportWidth = 1100;
    canvas = await html2canvas(element, {
      backgroundColor,
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: exportWidth,
      width: exportWidth,
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById(tempId);
        if (clonedEl) {
          const body = clonedDoc.body;
          const html = clonedDoc.documentElement;

          html.style.width = `${exportWidth}px`;
          body.style.width = `${exportWidth}px`;
          body.style.margin = '0';
          body.style.padding = '0';
          body.style.backgroundColor = backgroundColor || '#f8fafc';

          clonedEl.style.width = `${exportWidth}px`;
          clonedEl.style.maxWidth = `${exportWidth}px`;
          clonedEl.style.margin = '0';
          clonedEl.style.padding = '30px';
          clonedEl.style.boxSizing = 'border-box';
          clonedEl.style.display = 'block';
          clonedEl.style.visibility = 'visible';
          clonedEl.style.position = 'absolute';
          clonedEl.style.top = '0';
          clonedEl.style.left = '0';
          clonedEl.style.height = 'auto';
          clonedEl.style.minHeight = '0';

          body.innerHTML = '';
          body.appendChild(clonedEl);

          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            * {
              box-sizing: border-box !important;
              -webkit-print-color-adjust: exact !important;
            }

            .energy-inner, main, section, .energy-page-wrapper {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              display: block !important;
              height: auto !important;
              min-height: auto !important;
            }

            .energy-title-row {
              display: flex !important;
              justify-content: flex-end !important;
              width: 100% !important;
              margin-bottom: 40px !important;
              padding-bottom: 20px
              border-bottom: 2px solid #e2e8f0;
            }
            .energy-title-row h2 { 
              font-size: 34px !important; 
              font-weight: 800 !important; 
              color: #0f172a !important;
              margin: 0 !important;
            }

            .energy-widgets, .energy-grid, .energy-dashboard-grid {
              display: grid !important;
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 30px !important;
              width: 100% !important;
              margin-bottom: 40px !important;
            }

            .energy-card, .widget-card, ion-card {
              grid-column: span 1;
              width: 100% !important;
              margin: 0 !important;
              background-color: #ffffff !important;
              border: 1px solid #e2e8f0 !important;
              border-radius: 20px !important;
              padding: 25px !important;
              box-shadow: none !important;
              break-inside: avoid !important;
              display: flex !important;
              flex-direction: column !important;
              min-height: 200px;
            }

            .widget-value { font-size: 32px !important; font-weight: 800 !important; color: #0f172a !important; margin: 10px 0 !important; }
            .widget-title { font-size: 16px !important; font-weight: 700 !important; color: #64748b !important; }
            .card-title { font-size: 20px !important; font-weight: 700 !important; color: #1e293b !important; display: block !important; }

            .energy-grid > .energy-card:nth-child(2),
            [style*="grid-column: span 2"], [style*="grid-column:span 2"] {
              grid-column: span 2 !important;
            }

            .energy-chart, [id^="energy-chart-"], .apexcharts-canvas, .apexcharts-canvas svg {
              width: 100% !important;
              min-height: 380px !important;
              visibility: visible !important;
            }

            .time-range-button, button, .machine-selector-wrapper, 
            ion-select, .ion-hide, .card-badge {
              display: none !important;
            }

            ion-list { background: transparent !important; }
            ion-item { --background: transparent !important; --border-style: none !important; }
          `;
          clonedDoc.head.appendChild(style);
        }
      },
    });
  } finally {
    // Restore original ID
    if (originalId) {
      element.id = originalId;
    } else {
      element.removeAttribute('id');
    }
  }

  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  let remainingHeight = pdfHeight;
  let position = 0;
  const pageHeight = pdf.internal.pageSize.getHeight();

  while (remainingHeight > 0) {
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
    remainingHeight -= pageHeight;
    if (remainingHeight > 0) {
      position -= pageHeight;
      pdf.addPage();
    }
  }

  // Web vs Native
  if (!Capacitor.isNativePlatform()) {
    pdf.save(fileName);
    return;
  }

  const [{ Filesystem, Directory }, { Share }] = await Promise.all([
    import('@capacitor/filesystem'),
    import('@capacitor/share'),
  ]);

  const arrayBuffer = pdf.output('arraybuffer') as ArrayBuffer;
  const uint8 = new Uint8Array(arrayBuffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < uint8.length; i += chunkSize) {
    binary += String.fromCharCode(...uint8.subarray(i, i + chunkSize));
  }
  const base64Data = btoa(binary);

  const safeName = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  const result = await Filesystem.writeFile({
    path: safeName,
    data: base64Data,
    directory: Directory.Documents,
  });

  await Share.share({
    title: shareTitle ?? 'PDF Report',
    text: safeName,
    url: result.uri,
    dialogTitle: 'Share PDF',
  });
};

