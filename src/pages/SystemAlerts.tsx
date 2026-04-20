import React, { useMemo, useRef, useState } from 'react';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonIcon,
} from '@ionic/react';
import { warningOutline, flashOutline, alertCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';
import '../components/EnergyConsumption.css';
import PdfDownloadControl from '../components/PdfDownloadControl';
import NotificationBell from '../components/NotificationBell';
import { getTimeRangeTotalMinutes, makeSeededRandom, type CustomRange } from '../utils/timeRange';

const SystemAlerts: React.FC = () => {
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

  const alerts = useMemo(() => {
    const totalMinutes = getTimeRangeTotalMinutes(selectedRange, customRange);
    const rng = makeSeededRandom(`${selectedRange}|${customRange?.start ?? ''}|${customRange?.end ?? ''}`);

    const count = totalMinutes <= 30 ? 3 : totalMinutes <= 24 * 60 ? 5 : 7;
    const types: Array<'critical' | 'warning' | 'info'> = ['critical', 'warning', 'info'];
    const icons = {
      critical: flashOutline,
      warning: warningOutline,
      info: alertCircleOutline,
    };

    const messages = {
      critical: ['Voltage spike detected', 'Breaker trip risk', 'Overcurrent event'],
      warning: ['Power factor trending down', 'Harmonics rising', 'Temperature threshold nearing'],
      info: ['Scheduled maintenance window', 'Auto-calibration completed', 'Sensor heartbeat OK'],
    };

    const timeLabels = ['just now', '5 mins ago', '15 mins ago', '1 hr ago', '2 hrs ago', 'yesterday'];

    return Array.from({ length: count }).map((_, idx) => {
      const t = types[Math.floor(rng() * types.length)] ?? 'info';
      const machineNo = 1 + Math.floor(rng() * 3);
      const msgList = messages[t];
      const msg = msgList[Math.floor(rng() * msgList.length)] ?? msgList[0];
      const time = timeLabels[Math.min(timeLabels.length - 1, Math.floor(rng() * timeLabels.length))];

      return {
        id: idx + 1,
        type: t,
        machine: `Machine ${machineNo}`,
        message: msg,
        time,
        icon: icons[t],
      };
    });
  }, [selectedRange, customRange]);

  const criticalCount = alerts.filter((a) => a.type === 'critical').length;
  const warningCount = alerts.filter((a) => a.type === 'warning').length;
  const statusPct = Math.max(50, Math.min(100, 100 - criticalCount * 15 - warningCount * 7));

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton color="primary" />
          </IonButtons>
          <IonTitle>System Alerts</IonTitle>
          <PdfDownloadControl
            pageTitle="System Alerts"
            selectedRange={selectedRange}
            onSelectRange={handleSelectRange}
            contentRef={contentRef}
            fileName={(rangeLabel) => `System Alerts - ${rangeLabel}.pdf`}
          />
          <NotificationBell />
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding" style={{ '--background': '#f8fafc' }}>
        <div ref={contentRef} className="energy-inner" style={{ paddingTop: '1rem' }}>
          
          <div className="energy-title-row">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Anomaly Detection</h2>
          </div>

          <div className="energy-widgets">
            <IonCard className="widget-card" style={{ borderColor: '#ef4444' }}>
              <div className="widget-title"><IonIcon icon={warningOutline} style={{ color: '#ef4444' }} /> Critical Needs</div>
              <div className="widget-value" style={{ color: '#ef4444' }}>{criticalCount}</div>
              <div className="widget-sub">Action required immediately</div>
            </IonCard>
            <IonCard className="widget-card">
              <div className="widget-title"><IonIcon icon={alertCircleOutline} /> Warnings</div>
              <div className="widget-value">{warningCount}</div>
              <div className="widget-sub">Monitor closely</div>
            </IonCard>
            <IonCard className="widget-card" style={{ borderColor: '#10b981' }}>
              <div className="widget-title"><IonIcon icon={checkmarkCircleOutline} style={{ color: '#10b981' }} /> System Status</div>
              <div className="widget-value" style={{ color: '#10b981' }}>{statusPct}%</div>
              <div className="widget-sub">Network health nominal</div>
            </IonCard>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>Recent Activity Logs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {alerts.map((alert) => (
                <IonCard key={alert.id} className="widget-card" style={{ margin: 0, padding: '1rem 1.5rem', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                      padding: '0.75rem', 
                      borderRadius: '50%', 
                      backgroundColor: alert.type === 'critical' ? '#fee2e2' : alert.type === 'warning' ? '#fef3c7' : '#e0e7ff',
                      color: alert.type === 'critical' ? '#ef4444' : alert.type === 'warning' ? '#f59e0b' : '#4f46e5'
                  }}>
                    <IonIcon icon={alert.icon} size="large" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '1.05rem', marginBottom: '0.2rem' }}>
                      {alert.machine}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{alert.message}</div>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    {alert.time}
                  </div>
                </IonCard>
              ))}
            </div>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default SystemAlerts;