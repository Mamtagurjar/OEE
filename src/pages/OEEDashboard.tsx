import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonIcon
} from '@ionic/react';
import { timerOutline, checkmarkCircleOutline, hardwareChipOutline } from 'ionicons/icons';
import ApexCharts from 'apexcharts';
import '../components/EnergyConsumption.css';
import PdfDownloadControl from '../components/PdfDownloadControl';
import NotificationBell from '../components/NotificationBell';
import { getTimeRangeTotalMinutes, makeSeededRandom, type CustomRange } from '../utils/timeRange';

const OEEDashboard: React.FC = () => {
  const oeeChartRef = useRef<HTMLDivElement | null>(null);
  const breakdownChartRef = useRef<HTMLDivElement | null>(null);
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

  const metrics = useMemo(() => {
    const totalMinutes = getTimeRangeTotalMinutes(selectedRange, customRange);
    const rng = makeSeededRandom(`${selectedRange}|${customRange?.start ?? ''}|${customRange?.end ?? ''}`);

    // Longer ranges look slightly more stable.
    const stability = Math.min(6, Math.log10(totalMinutes + 1) * 2);
    const clamp = (v: number) => Math.max(70, Math.min(99.9, v));
    const pick = (base: number, spread: number) => clamp(base + (rng() - 0.5) * spread + stability);

    const m1 = pick(92, 8);
    const m2 = pick(88, 10);
    const m3 = pick(95, 6);
    const avg = (m1 + m2 + m3) / 3;
    return { m1, m2, m3, avg };
  }, [selectedRange, customRange]);

  useEffect(() => {
    let oeeChart: ApexCharts | null = null;
    let breakdownChart: ApexCharts | null = null;

    if (oeeChartRef.current) {
      oeeChart = new ApexCharts(oeeChartRef.current, {
        chart: { type: 'radialBar', height: 350 },
        series: [
          parseFloat(metrics.m1.toFixed(1)),
          parseFloat(metrics.m2.toFixed(1)),
          parseFloat(metrics.m3.toFixed(1)),
        ],
        colors: ['#4f46e5', '#10b981', '#f59e0b'],
        plotOptions: {
          radialBar: {
            hollow: { size: '45%' },
            dataLabels: {
              name: { show: true, fontSize: '18px', color: '#64748b' },
              value: { show: true, fontSize: '28px', fontWeight: 'bold' },
              total: {
                show: true,
                label: 'Avg Efficiency',
                formatter: () => `${metrics.avg.toFixed(1)}%`,
              }
            }
          }
        },
        labels: ['Machine 1', 'Machine 2', 'Machine 3'],
      });
      oeeChart.render();
    }

    if (breakdownChartRef.current) {
      breakdownChart = new ApexCharts(breakdownChartRef.current, {
        chart: { type: 'bar', height: 350, toolbar: { show: false } },
        series: [
          { name: 'Uptime', data: [98, 92, 99] },
          { name: 'Load Efficiency', data: [88, 81, 95] },
          { name: 'Power Quality', data: [92, 95, 91] }
        ],
        xaxis: { categories: ['Machine 1', 'Machine 2', 'Machine 3'] },
        colors: ['#3b82f6', '#8b5cf6', '#10b981'],
        plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
        dataLabels: { enabled: false }
      });
      breakdownChart.render();
    }

    return () => {
      oeeChart?.destroy();
      breakdownChart?.destroy();
    };
  }, [metrics]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton color="primary" />
          </IonButtons>
          <IonTitle>Efficiency Analytics</IonTitle>
          <PdfDownloadControl
            pageTitle="Efficiency Analytics"
            selectedRange={selectedRange}
            onSelectRange={handleSelectRange}
            contentRef={contentRef}
            fileName={(rangeLabel) => `Efficiency Analytics - ${rangeLabel}.pdf`}
          />
          <NotificationBell />
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding" style={{ '--background': '#f8fafc' }}>
        <div ref={contentRef} className="energy-inner" style={{ paddingTop: '1rem' }}>
          
          <div className="energy-title-row">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Overall Energy Efficiency (OEE)</h2>
          </div>

          <div className="energy-widgets">
            <IonCard className="widget-card" style={{ borderTop: '4px solid #3b82f6', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div className="widget-title" style={{ fontWeight: 600 }}><IonIcon icon={timerOutline} style={{ color: '#3b82f6' }} /> Power Uptime</div>
              <div className="widget-value" style={{ margin: '10px 0' }}>{metrics.m1.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748b' }}>%</span></div>
              <div className="widget-sub" style={{ fontWeight: 500, color: '#64748b' }}>Active vs Downtime</div>
            </IonCard>
            <IonCard className="widget-card" style={{ borderTop: '4px solid #8b5cf6', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div className="widget-title" style={{ fontWeight: 600 }}><IonIcon icon={hardwareChipOutline} style={{ color: '#8b5cf6' }} /> Load Efficiency</div>
              <div className="widget-value" style={{ margin: '10px 0' }}>{metrics.m2.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748b' }}>%</span></div>
              <div className="widget-sub" style={{ fontWeight: 500, color: '#64748b' }}>Current vs Peak Load</div>
            </IonCard>
            <IonCard className="widget-card" style={{ borderTop: '4px solid #10b981', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div className="widget-title" style={{ fontWeight: 600 }}><IonIcon icon={checkmarkCircleOutline} style={{ color: '#10b981' }} /> Power Quality</div>
              <div className="widget-value" style={{ margin: '10px 0' }}>{metrics.m3.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748b' }}>%</span></div>
              <div className="widget-sub" style={{ fontWeight: 500, color: '#64748b' }}>Clean Power / Min Harmonics</div>
            </IonCard>
          </div>

          <div className="energy-grid">
            <IonCard className="energy-card" style={{ borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
              <div className="card-head" style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div className="card-title" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Efficiency by Machine</div>
                <div className="card-badge" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>Live</div>
              </div>
              <div ref={oeeChartRef} style={{ padding: '1rem 0' }}></div>
            </IonCard>

            {/* <IonCard className="energy-card" style={{ borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
              <div className="card-head" style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div className="card-title" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Metrics by Machine</div>
                <div className="card-badge" style={{ backgroundColor: '#f3e8ff', color: '#8b5cf6' }}>Details</div>
              </div>
              <div ref={breakdownChartRef} style={{ padding: '1rem 0' }}></div>
            </IonCard> */}
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default OEEDashboard;