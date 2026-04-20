import React, { useState } from 'react';
import { IonButton, IonButtons, IonIcon, IonLoading } from '@ionic/react';
import { downloadOutline } from 'ionicons/icons';
import TimeRangeModal from './TimeRangeModal';
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
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDownloading, setDownloading] = useState(false);

  const handleSelect = async (
    value: string,
    label: string,
    customRange?: CustomRange,
  ) => {
    onSelectRange(value, label, customRange);
    setModalOpen(false);

    const target = contentRef.current;
    if (!target) {
      window.alert('Unable to export PDF: page content not found.');
      return;
    }

    setDownloading(true);
    try {
      // Let state updates + ApexCharts renders settle.
      await waitForPaint(3);
      await delay(250);

      const finalFileName = sanitizeFileName(
        fileName
          ? fileName(label, value)
          : `${pageTitle} - ${label}.pdf`,
      );

      await exportElementToPdf(target, {
        fileName: finalFileName,
        shareTitle: pageTitle,
        backgroundColor: '#ffffff',
        scale: 2,
      });
    } catch (error) {
      // Keep UX minimal: log + alert.
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
          onClick={() => setModalOpen(true)}
          disabled={isDownloading}
          aria-label="Download PDF"
        >
          <IonIcon icon={downloadOutline} slot="icon-only" />
        </IonButton>
      </IonButtons>

      <TimeRangeModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleSelect}
        selectedRange={selectedRange}
        theme={theme}
        title="Select Download Range"
        customTitle="Custom Download Range"
      />
    </>
  );
};

export default PdfDownloadControl;
