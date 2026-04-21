import React, { useState } from 'react';
import { IonButton, IonButtons, IonIcon, IonLoading } from '@ionic/react';
import { downloadOutline } from 'ionicons/icons';

import { exportElementToPdf, waitForPaint } from '../utils/pdfExport';

type CustomRange = { start: string; end: string };

type PdfDownloadControlProps = {
  pageTitle: string;
  theme?: 'light' | 'dark';
  selectedRange: string;
  onSelectRange: (value: string, label: string, customRange?: CustomRange) => void;
  contentRef: React.RefObject<HTMLElement | null>;
  fileName?: (rangeLabel: string, rangeValue: string) => string;
};

const sanitizeFileName = (name: string): string =>
  name.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim();

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const PdfDownloadControl: React.FC<PdfDownloadControlProps> = ({
  pageTitle,
  theme = 'light',
  selectedRange,
  onSelectRange,
  contentRef,
  fileName,
}) => {
  const [isDownloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    const target = contentRef.current;
    if (!target) {
      window.alert('Unable to export PDF: page content not found.');
      return;
    }

    setDownloading(true);
    try {
      await waitForPaint(3);
      await delay(250);

      const finalFileName = sanitizeFileName(
        fileName
          ? fileName(selectedRange, selectedRange)
          : `${pageTitle}.pdf`,
      );

      await exportElementToPdf(target, {
        fileName: finalFileName,
        shareTitle: pageTitle,
        backgroundColor: '#ffffff',
        scale: 2,
      });
    } catch (error) {
      console.error('PDF export failed', error);
      window.alert('PDF export failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <IonLoading
        isOpen={isDownloading}
        message="Preparing PDF…"
        backdropDismiss={false}
      />

      <IonButtons slot="end">
        <IonButton
          onClick={handleDownload}
          disabled={isDownloading}
          aria-label="Download PDF"
        >
          <IonIcon icon={downloadOutline} slot="icon-only" />
        </IonButton>
      </IonButtons>
    </>
  );
};

export default PdfDownloadControl;
