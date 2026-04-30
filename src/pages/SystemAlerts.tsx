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
  IonModal,
  IonButton,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { useEffect } from 'react';
import { warningOutline, flashOutline, alertCircleOutline, checkmarkCircleOutline, closeOutline, settingsOutline } from 'ionicons/icons';
import '../components/EnergyConsumption.css';
import PdfDownloadControl from '../components/PdfDownloadControl';
import NotificationBell from '../components/NotificationBell';
import { getTimeRangeTotalMinutes, makeSeededRandom, type CustomRange } from '../utils/timeRange';

export type CustomAlertItem = {
  id: string;
  title: string;
  message: string;
  createdAt: number;
};

const SystemAlerts: React.FC = () => {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [selectedRange, setSelectedRange] = useState('5m');
  const [selectedRangeLabel, setSelectedRangeLabel] = useState('5 min');
  const [customRange, setCustomRange] = useState<CustomRange | null>(null);

  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);

  const handleSelectRange = (
    range: string,
    label: string,
    selectedCustomRange?: CustomRange,
  ) => {
    setSelectedRange(range);
    setSelectedRangeLabel(label);
    setCustomRange(range === 'custom' && selectedCustomRange ? selectedCustomRange : null);
  };

  // Machine Alert Thresholds State
  const [alertMachine, setAlertMachine] = useState('m1');
  const [thresholds, setThresholds] = useState(() => {
    const saved = localStorage.getItem('power_thresholds');
    return saved ? JSON.parse(saved) : {
      m1: { v: 250, i: 50, f: 50 },
      m2: { v: 250, i: 50, f: 50 },
      m3: { v: 250, i: 50, f: 50 }
    };
  });

  const [inputV, setInputV] = useState(thresholds[alertMachine].v);
  const [inputI, setInputI] = useState(thresholds[alertMachine].i);
  const [inputF, setInputF] = useState(thresholds[alertMachine].f);

  useEffect(() => {
    setInputV(thresholds[alertMachine].v);
    setInputI(thresholds[alertMachine].i);
    setInputF(thresholds[alertMachine].f);
  }, [alertMachine, thresholds]);

  const handleUpdateThresholds = () => {
    const updated = {
      ...thresholds,
      [alertMachine]: { v: Number(inputV), i: Number(inputI), f: Number(inputF) }
    };
    setThresholds(updated);
    localStorage.setItem('power_thresholds', JSON.stringify(updated));
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
            selectedRangeLabel={selectedRangeLabel}
            onSelectRange={handleSelectRange}
            contentRef={contentRef}
            fileName={(rangeLabel) => `System Alerts - ${rangeLabel}.pdf`}
            moduleType="alerts"
            data={{
              widgets: [
                { title: 'Critical Needs', value: criticalCount, sub: 'Action required immediately', trendColor: '#ef4444' },
                { title: 'Warnings', value: warningCount, sub: 'Monitor closely', trendColor: '#f59e0b' },
                { title: 'System Status', value: `${statusPct}%`, sub: 'Network health nominal', trendColor: '#10b981' }
              ],
              alerts: alerts.map(a => ({
                title: `${a.machine} - ${a.message}`,
                message: `Incident type: ${a.type}`,
                time: a.time,
                color: a.type === 'critical' ? '#ef4444' : a.type === 'warning' ? '#f59e0b' : '#3b82f6'
              }))
            }}
          />
          <NotificationBell />
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ '--background': '#f8fafc' }}>
        <div ref={contentRef} className="energy-inner" style={{ paddingTop: '2.5rem' }}>
          
          <div className="energy-title-row" style={{ justifyContent: 'flex-start' }}>
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

          <div style={{ marginTop: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>System Anomaly Monitoring</h3>
              <IonButton 
                size="small" 
                fill="solid" 
                shape="round" 
                color="primary"
                onClick={() => setIsThresholdModalOpen(true)}
                style={{ '--box-shadow': '0 4px 10px rgba(79, 70, 229, 0.2)', fontWeight: 600 }}
              >
                <IonIcon slot="start" icon={settingsOutline} />
                Custom Alerts
              </IonButton>
            </div>
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

        <IonModal 
          isOpen={isThresholdModalOpen} 
          onDidDismiss={() => setIsThresholdModalOpen(false)} 
          breakpoints={[0, 0.85, 1]} 
          initialBreakpoint={0.85}
          handleBehavior="cycle"
        >
          <IonHeader className="ion-no-border">
            <IonToolbar>
              <IonTitle>Configuration Thresholds</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsThresholdModalOpen(false)}><IonIcon icon={closeOutline} size="large" /></IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding" style={{ '--background': '#ffffff' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                Set safety limits for each machine. Automatically triggers a notification when live telemetry exceeds these values.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>Machine Selector</label>
                <IonSelect
                  value={alertMachine}
                  onIonChange={e => setAlertMachine(e.detail.value)}
                  interface="popover"
                  interfaceOptions={{
                    cssClass: 'machine-selector-popover'
                  }}
                  style={{
                    '--background': '#ffffff',
                    'border': '1px solid #e2e8f0',
                    'border-radius': '10px',
                    'padding': '4px 12px',
                    'width': '100%',
                    'font-weight': '600'
                  }}
                >
                  <IonSelectOption value="m1">Machine 1</IonSelectOption>
                  <IonSelectOption value="m2">Machine 2</IonSelectOption>
                  <IonSelectOption value="m3">Machine 3</IonSelectOption>
                </IonSelect>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>Voltage (V)</label>
                  <input
                    type="number"
                    value={inputV}
                    onChange={e => setInputV(e.target.value)}
                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', background: '#f8fafc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>Current (A)</label>
                  <input
                    type="number"
                    value={inputI}
                    onChange={e => setInputI(e.target.value)}
                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', background: '#f8fafc' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>Frequency (Hz)</label>
                <input
                  type="number"
                  value={inputF}
                  onChange={e => setInputF(e.target.value)}
                  style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', background: '#f8fafc' }}
                />
              </div>

              <div style={{ marginTop: '1rem', paddingBottom: '2.5rem' }}>
                <IonButton 
                  expand="block" 
                  shape="round" 
                  color="primary" 
                  onClick={() => {
                    handleUpdateThresholds();
                    setIsThresholdModalOpen(false);
                  }}
                  style={{ fontWeight: 700, height: '48px', '--box-shadow': '0 4px 12px rgba(79, 70, 229, 0.3)' }}
                >
                  Save Performance Limits
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default SystemAlerts;
