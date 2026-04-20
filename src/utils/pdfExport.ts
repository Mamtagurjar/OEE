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

  const canvas = await html2canvas(element, {
    backgroundColor,
    scale,
    useCORS: true,
    logging: false,
    windowWidth: document.documentElement.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/png');

  // Use mm to avoid DPI confusion.
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidthMm = pdf.internal.pageSize.getWidth();
  const pageHeightMm = pdf.internal.pageSize.getHeight();

  const canvasWidthMm = pxToMm(canvas.width);
  const canvasHeightMm = pxToMm(canvas.height);

  // Fit image to page width.
  const renderWidthMm = pageWidthMm;
  const renderHeightMm = (canvasHeightMm * renderWidthMm) / canvasWidthMm;

  // Multi-page handling by shifting the same image up.
  let remainingHeightMm = renderHeightMm;
  let offsetYmm = 0;

  // First page
  pdf.addImage(imgData, 'PNG', 0, offsetYmm, renderWidthMm, renderHeightMm);
  remainingHeightMm -= pageHeightMm;

  while (remainingHeightMm > 0) {
    offsetYmm -= pageHeightMm;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, offsetYmm, renderWidthMm, renderHeightMm);
    remainingHeightMm -= pageHeightMm;
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
