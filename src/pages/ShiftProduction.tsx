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
  IonProgressBar,
  IonIcon
} from '@ionic/react';
import { flashOutline, speedometerOutline, pulseOutline } from 'ionicons/icons';
import '../components/EnergyConsumption.css';
import '../components/CustomSelect.css';
import SearchableDropdown from '../components/SearchableDropdown';
import PdfDownloadControl from '../components/PdfDownloadControl';
import NotificationBell from '../components/NotificationBell';
import { getTimeRangeTotalMinutes, makeSeededRandom, type CustomRange } from '../utils/timeRange';

const ShiftProduction: React.FC = () => {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [selectedRange, setSelectedRange] = useState('5m');
  const [selectedRangeLabel, setSelectedRangeLabel] = useState('5 min');
  const [customRange, setCustomRange] = useState<CustomRange | null>(null);

  const [selectedShift, setSelectedShift] = useState<'General' | '1st shift' | '2nd shift' | '3rd shift'>('General');

  const shiftOptions = [
    { value: 'General', label: 'General' },
    { value: '1st shift', label: '1st shift' },
    { value: '2nd shift', label: '2nd shift' },
    { value: '3rd shift', label: '3rd shift' },
  ];

  const handleSelectRange = (
    range: string,
    label: string,
    selectedCustomRange?: CustomRange,
  ) => {
    setSelectedRange(range);
    setSelectedRangeLabel(label);
    setCustomRange(range === 'custom' && selectedCustomRange ? selectedCustomRange : null);
  };

  const metrics = useMemo(() => {
    const totalMinutes = getTimeRangeTotalMinutes(selectedRange, customRange);
    const rng = makeSeededRandom(`${selectedShift}|${selectedRange}|${customRange?.start ?? ''}|${customRange?.end ?? ''}`);

    const totalEnergy = 300 + rng() * 250 + Math.min(120, totalMinutes / 10);
    const peakDemand = 70 + rng() * 40 + Math.min(20, totalMinutes / 120);
    const avgPf = 0.85 + rng() * 0.12;

    const m1Used = 120 + rng() * 60;
    const m2Used = 120 + rng() * 60;
    const m3Used = 90 + rng() * 60;

    return {
      totalEnergy,
      peakDemand,
      avgPf,
      m1: { used: m1Used, budget: 160 },
      m2: { used: m2Used, budget: 160 },
      m3: { used: m3Used, budget: 150 },
    };
  }, [selectedShift, selectedRange, customRange]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton color="primary" />
          </IonButtons>
          <IonTitle>Shift Summary</IonTitle>
          <PdfDownloadControl
            pageTitle="Shift Summary"
            selectedRange={selectedRange}
            selectedRangeLabel={selectedRangeLabel}
            onSelectRange={handleSelectRange}
            contentRef={contentRef}
            fileName={(rangeLabel) => `Shift Summary - ${rangeLabel}.pdf`}
            moduleType="production"
            data={{
              widgets: [
                { title: 'Total Energy', value: `${metrics.totalEnergy.toFixed(1)} kWh`, sub: '+6.2% vs last shift', trendColor: '#4f46e5' },
                { title: 'Peak Demand', value: `${metrics.peakDemand.toFixed(1)} kW`, sub: 'Recorded at 14:20', trendColor: '#ef4444' },
                { title: 'Avg Power Factor', value: metrics.avgPf.toFixed(2), sub: 'Within target range', trendColor: '#10b981' }
              ],
              progressItems: [
                { label: 'Machine 1', used: Math.round(metrics.m1.used), budget: metrics.m1.budget, color: '#4f46e5' },
                { label: 'Machine 2', used: Math.round(metrics.m2.used), budget: metrics.m2.budget, color: '#10b981' },
                { label: 'Machine 3', used: Math.round(metrics.m3.used), budget: metrics.m3.budget, color: '#f59e0b' }
              ]
            }}
          />
          <NotificationBell />
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding" style={{ '--background': '#f8fafc' }}>
        <div ref={contentRef} className="energy-inner" style={{ paddingTop: '2.5rem' }}>
          <div className="energy-title-row">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Shift Energy Summary</h2>

            <div className="machine-selector-container">
              <SearchableDropdown
                value={selectedShift}
                options={shiftOptions}
                onChange={(value) =>
                  setSelectedShift(value as 'General' | '1st shift' | '2nd shift' | '3rd shift')
                }
                placeholder="-- Select --"
                ariaLabel="Select shift"
              />
            </div>
          </div>

          <div className="energy-widgets">
            <IonCard className="widget-card" style={{ borderTop: '4px solid #4f46e5', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div className="widget-title" style={{ fontWeight: 600, color: '#4f46e5' }}><IonIcon icon={flashOutline} /> Total Energy</div>
              <div className="widget-value">{metrics.totalEnergy.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748b' }}>kWh</span></div>
              <div className="widget-sub" style={{ color: '#64748b', fontWeight: 500 }}>+6.2% vs last shift</div>
            </IonCard>
            <IonCard className="widget-card" style={{ borderTop: '4px solid #ef4444', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div className="widget-title" style={{ fontWeight: 600, color: '#ef4444' }}><IonIcon icon={speedometerOutline} /> Peak Demand</div>
              <div className="widget-value">{metrics.peakDemand.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748b' }}>kW</span></div>
              <div className="widget-sub" style={{ color: '#64748b', fontWeight: 500 }}>Recorded at 14:20</div>
            </IonCard>
            <IonCard className="widget-card" style={{ borderTop: '4px solid #10b981', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div className="widget-title" style={{ fontWeight: 600, color: '#10b981' }}><IonIcon icon={pulseOutline} /> Avg Power Factor</div>
              <div className="widget-value">{metrics.avgPf.toFixed(2)}</div>
              <div className="widget-sub" style={{ color: '#64748b', fontWeight: 500 }}>Within target range</div>
            </IonCard>
          </div>

          <div className="energy-grid" style={{ marginTop: '1.5rem' }}>
            <IonCard className="energy-card span-2" style={{ borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
              <div className="card-head" style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div className="card-title" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Energy Budget vs Used</div>
                <div className="card-badge" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>Shift</div>
              </div>
              <IonList lines="full" style={{ padding: 0 }}>
                <IonItem>
                  <IonLabel>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong>Machine 1</strong>
                      <span style={{ color: '#64748b' }}>{Math.round(metrics.m1.used)} / {metrics.m1.budget} kWh</span>
                    </div>
                    <IonProgressBar value={Math.min(1, metrics.m1.used / metrics.m1.budget)} color="primary" />
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong>Machine 2</strong>
                      <span style={{ color: '#64748b' }}>{Math.round(metrics.m2.used)} / {metrics.m2.budget} kWh</span>
                    </div>
                    <IonProgressBar value={Math.min(1, metrics.m2.used / metrics.m2.budget)} color="success" />
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong>Machine 3</strong>
                      <span style={{ color: '#64748b' }}>{Math.round(metrics.m3.used)} / {metrics.m3.budget} kWh</span>
                    </div>
                    <IonProgressBar value={Math.min(1, metrics.m3.used / metrics.m3.budget)} color="warning" />
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCard>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ShiftProduction;
