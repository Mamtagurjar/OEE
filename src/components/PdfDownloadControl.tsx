import React, { useState, useRef } from 'react';
import { IonButton, IonButtons, IonIcon, IonLoading } from '@ionic/react';
import { downloadOutline } from 'ionicons/icons';

import { exportElementToPdf, waitForPaint } from '../utils/pdfExport';
import PdfReportTemplate, { ModuleType } from './PdfReportTemplate';

type CustomRange = { start: string; end: string };

type PdfDownloadControlProps = {
  pageTitle: string;
  theme?: 'light' | 'dark';
  selectedRange: string;
  selectedRangeLabel: string;
  onSelectRange: (value: string, label: string, customRange?: CustomRange) => void;
  contentRef: React.RefObject<HTMLElement | null>;
  fileName?: (rangeLabel: string, rangeValue: string) => string;
  moduleType?: ModuleType;
  data?: any; // Live data from the caller
};

const sanitizeFileName = (name: string): string =>
  name.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim();

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const PdfDownloadControl: React.FC<PdfDownloadControlProps> = ({
  pageTitle,
  selectedRange,
  selectedRangeLabel,
  contentRef,
  fileName,
  moduleType = 'energy',
  data = {},
}) => {
  const [isDownloading, setDownloading] = useState(false);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    setDownloading(true);
    
    try {
      // Give time for the hidden template to mount and charts to render
      await delay(1200);
      await waitForPaint(10);

      const target = pdfTemplateRef.current;
      if (!target) {
        window.alert('Preparation of PDF template failed.');
        return;
      }

      const finalFileName = sanitizeFileName(
        fileName
          ? fileName(selectedRangeLabel, selectedRange)
          : `${pageTitle}.pdf`,
      );

      // Export the pre-designed template
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
        message="Assembling Professional Report…"
        backdropDismiss={false}
      />

      {/* 
          OFF-SCREEN PDF GENERATOR 
          This is where the separate DESIGN for each module lives.
      */}
      <div style={{ 
        position: 'absolute', 
        left: '-10000px', 
        top: 0, 
        zIndex: -1,
        visibility: isDownloading ? 'visible' : 'hidden' 
      }}>
        {isDownloading && (
          <PdfReportTemplate 
            containerRef={pdfTemplateRef}
            pageTitle={pageTitle}
            selectedRangeLabel={selectedRangeLabel}
            moduleType={moduleType}
            data={data}
            selectedRange={selectedRange}
          />
        )}
      </div>

      <IonButtons slot="end">
        <IonButton
          onClick={handleDownload}
          disabled={isDownloading}
          style={{ '--color': '#4f46e5' }}
          className="pdf-download-control-btn"
          aria-label="Download PDF"
        >
          <IonIcon icon={downloadOutline} slot="icon-only" />
        </IonButton>
      </IonButtons>
    </>
  );
};

export default PdfDownloadControl;
