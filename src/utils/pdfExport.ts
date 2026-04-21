
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

  if (!element.isConnected) {
    throw new Error('PDF export target is not mounted in the DOM.');
  }

  // We capture the clean, pre-designed template exactly as it is.
  const canvas = await html2canvas(element, {
    backgroundColor,
    scale: scale,
    useCORS: true,
    logging: false,
    scrollY: 0,
    scrollX: 0,
    windowWidth: element.offsetWidth,
    windowHeight: element.offsetHeight,
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
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

  if (!Capacitor.isNativePlatform()) {
    pdf.save(fileName);
    return;
  }

  const [{ Filesystem, Directory }, { Share }] = await Promise.all([
    import('@capacitor/filesystem'),
    import('@capacitor/share'),
  ]);

  const arrayBuffer = pdf.output('arraybuffer') as ArrayBuffer;
  const base64Data = btoa(
    new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );

  const safeName = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  const result = await Filesystem.writeFile({
    path: safeName,
    data: base64Data,
    directory: Directory.Documents,
  });

  await Share.share({
    title: shareTitle ?? 'Report',
    url: result.uri,
  });
};
