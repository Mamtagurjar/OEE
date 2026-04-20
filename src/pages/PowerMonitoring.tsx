import React, { useEffect, useRef, useState } from 'react';
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
import { flashOutline, speedometerOutline, pulseOutline } from 'ionicons/icons';
import ApexCharts from 'apexcharts';
import '../components/EnergyConsumption.css';
import PdfDownloadControl from '../components/PdfDownloadControl';
import NotificationBell from '../components/NotificationBell';
import { getTimeRangeTotalMinutes, type CustomRange } from '../utils/timeRange';

const PowerMonitoring: React.FC = () => {
  const chartRef1 = useRef<HTMLDivElement | null>(null);
  const chartRef2 = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [selectedRange, setSelectedRange] = useState('5m');
  const [customRange, setCustomRange] = useState<CustomRange | null>(null);

  const [m1Voltage, setM1Voltage] = useState(229.4);
  const [m2Current, setM2Current] = useState(46.2);
  const [m3Freq, setM3Freq] = useState(50.02);
  const pfRef = useRef<[number, number, number]>([0.92, 0.88, 0.95]);

  const handleSelectRange = (
    range: string,
    _label: string,
    selectedCustomRange?: CustomRange,
  ) => {
    setSelectedRange(range);
    setCustomRange(range === 'custom' && selectedCustomRange ? selectedCustomRange : null);
  };

  useEffect(() => {
    let pfChart: ApexCharts | null = null;
    let voltageChart: ApexCharts | null = null;

    const totalMinutes = getTimeRangeTotalMinutes(selectedRange, customRange);
    const points = ['thisWeek', 'lastWeek', 'thisMonth', 'lastMonth'].includes(selectedRange) ? 7 : 12;
    const stepMs = Math.max(3000, Math.round((totalMinutes * 60000) / Math.max(1, points - 1)));
    const tickMs = stepMs;

    const categories: number[] = [];
    const vM1: number[] = [];
    const vM2: number[] = [];
    const vM3: number[] = [];

    const now = Date.now();
    for (let i = points - 1; i >= 0; i--) {
      categories.push(now - i * tickMs);
      vM1.push(parseFloat((Math.random() * (235 - 225) + 225).toFixed(1)));
      vM2.push(parseFloat((Math.random() * (225 - 215) + 215).toFixed(1)));
      vM3.push(parseFloat((Math.random() * (245 - 235) + 235).toFixed(1)));
    }

    if (chartRef1.current) {
      pfChart = new ApexCharts(chartRef1.current, {
        chart: {
          type: 'radialBar',
          height: 350,
          animations: { enabled: true, dynamicAnimation: { speed: 1000 } }
        },
        series: pfRef.current.map((pf) => parseFloat((pf * 100).toFixed(1))),
        colors: ['#4f46e5', '#10b981', '#f59e0b'],
        plotOptions: {
          radialBar: {
            hollow: { size: '40%' },
            dataLabels: {
              name: { show: true, fontSize: '14px', color: '#64748b' },
              value: {
                show: true,
                fontSize: '24px',
                fontWeight: 'bold',
                formatter: (val: number) => (val / 100).toFixed(2)
              },
              total: {
                show: true,
                label: 'Avg PF',
                formatter: () => ((pfRef.current[0] + pfRef.current[1] + pfRef.current[2]) / 3).toFixed(2)
              }
            }
          }
        },
        labels: ['Machine 1', 'Machine 2', 'Machine 3'],
      });
      pfChart.render();
    }

    if (chartRef2.current) {
      voltageChart = new ApexCharts(chartRef2.current, {
        chart: {
          type: 'area',
          height: 300,
          toolbar: { show: false },
          animations: { enabled: true, dynamicAnimation: { speed: 1000 } },
          zoom: { enabled: false }
        },
        stroke: { curve: 'smooth', width: 2 },
        series: [
          { name: 'Machine 1 (V)', data: [...vM1] },
          { name: 'Machine 2 (V)', data: [...vM2] },
          { name: 'Machine 3 (V)', data: [...vM3] }
        ],
        colors: ['#4f46e5', '#10b981', '#f59e0b'],
        xaxis: {
          type: 'datetime',
          categories: [...categories],
          labels: { datetimeUTC: false, format: 'HH:mm:ss' },
        },
        yaxis: {
          min: 200,
          max: 260,
          title: { text: 'Voltage (V)' }
        },
        tooltip: {
          x: { format: 'HH:mm:ss' },
          y: { formatter: (val: number) => `${val.toFixed(1)} V` }
        },
        dataLabels: { enabled: false },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05 } }
      });
      voltageChart.render();
    }

    const interval = setInterval(() => {
      const pf1 = parseFloat((Math.random() * (0.99 - 0.85) + 0.85).toFixed(2));
      const pf2 = parseFloat((Math.random() * (0.95 - 0.80) + 0.80).toFixed(2));
      const pf3 = parseFloat((Math.random() * (0.99 - 0.90) + 0.90).toFixed(2));
      pfRef.current = [pf1, pf2, pf3];
      pfChart?.updateSeries(pfRef.current.map((pf) => parseFloat((pf * 100).toFixed(1))));

      const v1 = parseFloat((Math.random() * (235 - 225) + 225).toFixed(1));
      const v2 = parseFloat((Math.random() * (225 - 215) + 215).toFixed(1));
      const v3 = parseFloat((Math.random() * (245 - 235) + 235).toFixed(1));

      const i2 = parseFloat((Math.random() * (55 - 35) + 35).toFixed(1));
      const f3 = parseFloat((Math.random() * (50.10 - 49.90) + 49.90).toFixed(2));

      setM1Voltage(v1);
      setM2Current(i2);
      setM3Freq(f3);

      categories.shift();
      categories.push(Date.now());
      vM1.shift();
      vM1.push(v1);
      vM2.shift();
      vM2.push(v2);
      vM3.shift();
      vM3.push(v3);

      if (voltageChart) {
        voltageChart.updateOptions({ xaxis: { categories: [...categories] } }, false, false);
        voltageChart.updateSeries(
          [
            { name: 'Machine 1 (V)', data: [...vM1] },
            { name: 'Machine 2 (V)', data: [...vM2] },
            { name: 'Machine 3 (V)', data: [...vM3] }
          ],
          true
        );
      }
    }, tickMs);

    return () => {
      clearInterval(interval);
      pfChart?.destroy();
      voltageChart?.destroy();
    };
  }, [selectedRange, customRange]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton color="primary" />
          </IonButtons>
          <IonTitle>Power Monitoring</IonTitle>
          <PdfDownloadControl
            pageTitle="Power Monitoring"
            selectedRange={selectedRange}
            onSelectRange={handleSelectRange}
            contentRef={contentRef}
            fileName={(rangeLabel) => `Power Monitoring - ${rangeLabel}.pdf`}
          />
          <NotificationBell />
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding" style={{ '--background': '#f8fafc' }}>
        <div ref={contentRef} className="energy-inner" style={{ paddingTop: '1rem' }}>
          <div className="energy-title-row">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Realtime Electrical Parameters</h2>
          </div>

          <div className="energy-widgets">
            <IonCard className="widget-card" style={{ borderTop: '4px solid #4f46e5', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div className="widget-title" style={{ fontWeight: 600, color: '#4f46e5' }}><IonIcon icon={flashOutline} /> Machine 1 Voltage</div>
              <div className="widget-value">{m1Voltage.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748b' }}>V</span></div>
              <div className="widget-sub">Line voltage snapshot</div>
            </IonCard>
            <IonCard className="widget-card" style={{ borderTop: '4px solid #10b981', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div className="widget-title" style={{ fontWeight: 600, color: '#10b981' }}><IonIcon icon={pulseOutline} /> Machine 2 Current</div>
              <div className="widget-value">{m2Current.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748b' }}>A</span></div>
              <div className="widget-sub">Load draw monitoring</div>
            </IonCard>
            <IonCard className="widget-card" style={{ borderTop: '4px solid #f59e0b', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div className="widget-title" style={{ fontWeight: 600, color: '#f59e0b' }}><IonIcon icon={speedometerOutline} /> Machine 3 Frequency</div>
              <div className="widget-value">{m3Freq.toFixed(2)} <span style={{ fontSize: '1rem', color: '#64748b' }}>Hz</span></div>
              <div className="widget-sub">Grid stability check</div>
            </IonCard>
          </div>

          <div className="energy-grid">
            <IonCard className="energy-card" style={{ borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
              <div className="card-head" style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div className="card-title" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Power Factor by Machine</div>
                <div className="card-badge" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>Live</div>
              </div>
              <div ref={chartRef1} style={{ padding: '1rem 0' }}></div>
            </IonCard>

            <IonCard className="energy-card" style={{ gridColumn: 'span 2', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
              <div className="card-head" style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div className="card-title" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Voltage Trend (Live)</div>
                <div className="card-badge" style={{ backgroundColor: '#f3e8ff', color: '#8b5cf6' }}>V</div>
              </div>
              <div ref={chartRef2} style={{ padding: '1rem 0' }}></div>
            </IonCard>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default PowerMonitoring;
