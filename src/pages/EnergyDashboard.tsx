import React, { useRef, useState } from 'react';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import EnergyConsumption, {
  type CustomRange,
  type RangeKey,
} from '../components/EnergyConsumption';
import PdfDownloadControl from '../components/PdfDownloadControl';
import NotificationBell from '../components/NotificationBell';


const EnergyDashboard: React.FC = () => {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [selectedRange, setSelectedRange] = useState<RangeKey>('5m');
  const [selectedRangeLabel, setSelectedRangeLabel] = useState('5 min');
  const [customRange, setCustomRange] = useState<CustomRange | null>(null);

  const handleSelectRange = (
    value: string,
    label: string,
    selectedCustomRange?: CustomRange,
  ) => {
    setSelectedRange(value as RangeKey);
    setSelectedRangeLabel(label);
    setCustomRange(value === 'custom' && selectedCustomRange ? selectedCustomRange : null);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton color="primary" />
          </IonButtons>
          <IonTitle>Energy Consumption</IonTitle>
          <PdfDownloadControl
            pageTitle="Energy Consumption"
            selectedRange={selectedRange}
            onSelectRange={handleSelectRange}
            contentRef={contentRef}
          />
          <NotificationBell />
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div ref={contentRef}>
          <EnergyConsumption
            selectedRange={selectedRange}
            selectedRangeLabel={selectedRangeLabel}
            customRange={customRange}
            onSelectRange={handleSelectRange}
            showRangeButton={true}
            showRangeModal={true}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default EnergyDashboard;
