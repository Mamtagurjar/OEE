import React, { useMemo, useRef, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonCard,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonIcon
} from '@ionic/react';
import { documentTextOutline, constructOutline } from 'ionicons/icons';
import '../components/EnergyConsumption.css';
import PdfDownloadControl from '../components/PdfDownloadControl';
import NotificationBell from '../components/NotificationBell';
import { getTimeRangeTotalMinutes, makeSeededRandom, type CustomRange } from '../utils/timeRange';

const MaintenanceLog: React.FC = () => {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [selectedRange, setSelectedRange] = useState('5m');
  const [customRange, setCustomRange] = useState<CustomRange | null>(null);

  const handleSelectRange = (
    range: string,
    _label: string,
    selectedCustomRange?: CustomRange,
  ) => {
    setSelectedRange(range);
    setCustomRange(range === 'custom' && selectedCustomRange ? selectedCustomRange : null);
  };

  const stats = useMemo(() => {
    const totalMinutes = getTimeRangeTotalMinutes(selectedRange, customRange);
    const rng = makeSeededRandom(`${selectedRange}|${customRange?.start ?? ''}|${customRange?.end ?? ''}`);

    const incidents = Math.max(0, Math.round((rng() * 4 + 1) * (totalMinutes >= 24 * 60 ? 1.4 : 1)));
    const nextInspectionDays = Math.max(1, Math.round((rng() * 4 + 1) * (totalMinutes >= 7 * 24 * 60 ? 1.5 : 1)));
    return { incidents, nextInspectionDays };
  }, [selectedRange, customRange]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton color="primary" />
          </IonButtons>
          <IonTitle>Maintenance Log</IonTitle>
          <PdfDownloadControl
            pageTitle="Maintenance Log"
            selectedRange={selectedRange}
            onSelectRange={handleSelectRange}
            contentRef={contentRef}
            fileName={(rangeLabel) => `Maintenance Log - ${rangeLabel}.pdf`}
          />
          <NotificationBell />
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen className="ion-padding" style={{ '--background': '#f8fafc' }}>
        <div ref={contentRef} className="energy-inner" style={{ paddingTop: '1rem' }}>
          
          <div className="energy-title-row">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>System Electrical Health</h2>
          </div>

          <div className="energy-widgets">
            <IonCard className="widget-card" style={{ borderTop: '4px solid #ef4444', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div className="widget-title" style={{ fontWeight: 600 }}><IonIcon icon={documentTextOutline} style={{ color: '#ef4444' }} /> Active Incidents</div>
              <div className="widget-value" style={{ margin: '10px 0' }}>{stats.incidents}</div>
              <div className="widget-sub" style={{ fontWeight: 500, color: '#64748b' }}>Pending electrical flags</div>
            </IonCard>
            <IonCard className="widget-card" style={{ borderTop: '4px solid #3b82f6', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div className="widget-title" style={{ fontWeight: 600 }}><IonIcon icon={constructOutline} style={{ color: '#3b82f6' }} /> Next Inspection</div>
              <div className="widget-value" style={{ margin: '10px 0' }}>{stats.nextInspectionDays} <span style={{ fontSize: '1rem', color: '#64748b' }}>Days</span></div>
              <div className="widget-sub" style={{ fontWeight: 500, color: '#64748b' }}>Scheduled grid diagnostics</div>
            </IonCard>
          </div>

          <div className="energy-grid">
            <IonCard className="energy-card" style={{ borderTop: '4px solid #4f46e5', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
              <div className="card-head" style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div className="card-title" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Machine 1</div>
                <IonBadge color="success">Stable</IonBadge>
              </div>
              <IonList lines="full" style={{ padding: 0 }}>
                <IonItem>
                  <IonLabel>Last Diagnostics</IonLabel>
                  <IonBadge color="light">Oct 12, 2023</IonBadge>
                </IonItem>
                <IonItem>
                  <IonLabel>Thermal Scan</IonLabel>
                  <IonBadge color="warning">Due Soon</IonBadge>
                </IonItem>
              </IonList>
            </IonCard>

            <IonCard className="energy-card" style={{ borderTop: '4px solid #10b981', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
              <div className="card-head" style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div className="card-title" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Machine 2</div>
                <IonBadge color="warning">Needs Check</IonBadge>
              </div>
              <IonList lines="full" style={{ padding: 0 }}>
                <IonItem>
                  <IonLabel>Last Diagnostics</IonLabel>
                  <IonBadge color="light">Sept 05, 2023</IonBadge>
                </IonItem>
                <IonItem>
                  <IonLabel>Phase Relay Contact</IonLabel>
                  <IonBadge color="danger">Replace</IonBadge>
                </IonItem>
              </IonList>
            </IonCard>

            <IonCard className="energy-card" style={{ borderTop: '4px solid #f59e0b', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
              <div className="card-head" style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div className="card-title" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Machine 3</div>
                <IonBadge color="success">Stable</IonBadge>
              </div>
              <IonList lines="full" style={{ padding: 0 }}>
                <IonItem>
                  <IonLabel>Last Diagnostics</IonLabel>
                  <IonBadge color="light">Nov 01, 2023</IonBadge>
                </IonItem>
                <IonItem>
                  <IonLabel>Insulation Integrity</IonLabel>
                  <IonBadge color="success">Optimal</IonBadge>
                </IonItem>
              </IonList>
            </IonCard>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MaintenanceLog;
