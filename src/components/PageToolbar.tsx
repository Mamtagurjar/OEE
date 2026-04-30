import React from 'react';
import {
  IonButtons,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

import NotificationBell from './NotificationBell';
import PdfDownloadControl from './PdfDownloadControl';
import { type ModuleType, type PdfReportData } from './PdfReportTemplate';

type CustomRange = {
  start: string;
  end: string;
};

type PageToolbarProps = {
  title: string;
  selectedRange: string;
  selectedRangeLabel: string;
  onSelectRange: (value: string, label: string, customRange?: CustomRange) => void;
  contentRef: React.RefObject<HTMLElement | null>;
  fileName?: (rangeLabel: string, rangeValue: string) => string;
  moduleType?: ModuleType;
  data?: PdfReportData;
};

const PageToolbar: React.FC<PageToolbarProps> = ({
  title,
  selectedRange,
  selectedRangeLabel,
  onSelectRange,
  contentRef,
  fileName,
  moduleType,
  data,
}) => {
  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonMenuButton color="primary" />
        </IonButtons>
        <IonTitle>{title}</IonTitle>
        <PdfDownloadControl
          pageTitle={title}
          selectedRange={selectedRange}
          selectedRangeLabel={selectedRangeLabel}
          onSelectRange={onSelectRange}
          contentRef={contentRef}
          fileName={fileName}
          moduleType={moduleType}
          data={data}
        />
        <NotificationBell />
      </IonToolbar>
    </IonHeader>
  );
};

export default PageToolbar;
