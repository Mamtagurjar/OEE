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
  IonFab,
  IonFabButton,
  IonModal,
  IonInput,
  IonTextarea,
  IonItem,
  IonLabel,
  IonButton
} from '@ionic/react';
import { warningOutline, flashOutline, alertCircleOutline, checkmarkCircleOutline, addOutline, closeOutline } from 'ionicons/icons';
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

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const [customAlerts, setCustomAlerts] = useState<CustomAlertItem[]>(() => {
    try {
      const raw = localStorage.getItem('oee.custom.alerts.v1');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  const handleCreateAlert = () => {
    if (!alertTitle.trim() || !alertMessage.trim()) return;
    
    const newAlert: CustomAlertItem = {
      id: `custom-alert-${Date.now()}`,
      title: alertTitle.trim(),
      message: alertMessage.trim(),
      createdAt: Date.now()
    };
    
    const updated = [newAlert, ...customAlerts];
    setCustomAlerts(updated);
    
    try {
      localStorage.setItem('oee.custom.alerts.v1', JSON.stringify(updated));
    } catch {}

    setAlertTitle('');
    setAlertMessage('');
    setIsAlertModalOpen(false);
  };

  const handleSelectRange = (
    range: string,
    label: string,
    selectedCustomRange?: CustomRange,
  ) => {
    setSelectedRange(range);
    setSelectedRangeLabel(label);
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
      <IonContent fullscreen className="ion-padding" style={{ '--background': '#f8fafc' }}>
        <div ref={contentRef} className="energy-inner" style={{ paddingTop: '1rem' }}>
          
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
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Custom Alerts</h3>
              <IonButton 
                size="small" 
                fill="solid" 
                shape="round" 
                color="primary"
                onClick={() => setIsAlertModalOpen(true)}
                style={{ '--box-shadow': '0 4px 10px rgba(79, 70, 229, 0.2)', fontWeight: 600 }}
              >
                <IonIcon slot="start" icon={addOutline} />
                Custom alert
              </IonButton>
            </div>
            {customAlerts.length === 0 ? (
               <p style={{ color: '#64748b' }}>No custom alerts have been created.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {customAlerts.map(alert => (
                  <IonCard key={alert.id} className="widget-card" style={{ margin: 0, padding: '1rem 1.5rem', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #4f46e5' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '1.05rem', marginBottom: '0.2rem' }}>
                        {alert.title}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{alert.message}</div>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', flexShrink: 0 }}>
                      {new Date(alert.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </IonCard>
                ))}
              </div>
            )}
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
          isOpen={isAlertModalOpen} 
          onDidDismiss={() => setIsAlertModalOpen(false)} 
          breakpoints={[0, 0.85, 1]} 
          initialBreakpoint={0.85}
          handleBehavior="cycle"
        >
          <IonHeader className="ion-no-border">
            <IonToolbar>
              <IonTitle>Post Custom Alert</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsAlertModalOpen(false)}><IonIcon icon={closeOutline} size="large" /></IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <p style={{ color: 'var(--ion-color-step-600)', marginBottom: '1.5rem', marginTop: 0 }}>
              Use this tool to manually broadcast a network-wide system alert that will instantly propagate to the notifications center.
            </p>
            <IonItem fill="outline" style={{ marginBottom: '1.25rem', '--border-radius': '8px', '--padding-top': '8px', '--padding-bottom': '8px' }}>
              <IonLabel position="floating">Alert Title</IonLabel>
              <IonInput 
                value={alertTitle} 
                onIonInput={(e) => setAlertTitle(e.detail.value!)} 
                placeholder="E.g., Component Failure" 
                clearInput
                style={{ marginTop: '4px' }}
              />
            </IonItem>
            <IonItem fill="outline" style={{ marginBottom: '1rem', '--border-radius': '8px', '--padding-top': '8px', '--padding-bottom': '8px' }}>
              <IonLabel position="floating">Incident Details</IonLabel>
              <IonTextarea 
                value={alertMessage} 
                onIonInput={(e) => setAlertMessage(e.detail.value!)} 
                placeholder="Provide metric thresholds or relevant context" 
                rows={4}
                style={{ marginTop: '4px' }}
              />
            </IonItem>
            
            <div style={{ marginTop: '1.5rem', paddingBottom: '2rem' }}>
              <IonButton 
                expand="block" 
                shape="round" 
                color="primary" 
                onClick={handleCreateAlert} 
                disabled={!alertTitle.trim() || !alertMessage.trim()} 
                style={{ fontWeight: 600, height: '48px', margin: 0, '--box-shadow': '0 4px 12px rgba(79, 70, 229, 0.3)' }}
              >
                Publish Notification
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default SystemAlerts;