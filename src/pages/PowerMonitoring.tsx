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
  IonIcon,
  IonSelect,
  IonSelectOption
} from '@ionic/react';
import { flashOutline, speedometerOutline, pulseOutline } from 'ionicons/icons';
import ApexCharts from 'apexcharts';
import '../components/EnergyConsumption.css';
import PdfDownloadControl from '../components/PdfDownloadControl';
import NotificationBell from '../components/NotificationBell';
import { getTimeRangeTotalMinutes, makeSeededRandom, type CustomRange } from '../utils/timeRange';
import { triggerAlert } from '../utils/notifications';

const PowerMonitoring: React.FC = () => {
  const chartRef1 = useRef<HTMLDivElement | null>(null);
  const chartRef2 = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [selectedRange, setSelectedRange] = useState('5m');
  const [selectedRangeLabel, setSelectedRangeLabel] = useState('5 min');
  const [customRange, setCustomRange] = useState<CustomRange | null>(null);

  const [m1Voltage, setM1Voltage] = useState(229.4);
  const [m1Current, setM1Current] = useState(42.1);
  const [m1Freq, setM1Freq] = useState(50.01);

  const [m2Voltage, setM2Voltage] = useState(221.2);
  const [m2Current, setM2Current] = useState(46.2);
  const [m2Freq, setM2Freq] = useState(49.98);

  const [m3Voltage, setM3Voltage] = useState(238.5);
  const [m3Current, setM3Current] = useState(38.4);
  const [m3Freq, setM3Freq] = useState(50.02);
  const pfRef = useRef<[number, number, number]>([0.92, 0.88, 0.95]);

  const [selectedMachine, setSelectedMachine] = useState('m1');

  // Custom Alerts State
  const [alertMachine, setAlertMachine] = useState('m1');
  const [thresholds, setThresholds] = useState(() => {
    const saved = localStorage.getItem('power_thresholds');
    return saved ? JSON.parse(saved) : {
      m1: { v: 300, i: 50, f: 50 },
      m2: { v: 300, i: 50, f: 50 },
      m3: { v: 300, i: 50, f: 50 }
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

  const handleSelectRange = (
    range: string,
    label: string,
    selectedCustomRange?: CustomRange,
  ) => {
    setSelectedRange(range);
    setSelectedRangeLabel(label);
    setCustomRange(range === 'custom' && selectedCustomRange ? selectedCustomRange : null);
  };

  useEffect(() => {
    let pfChart: ApexCharts | null = null;
    let voltageChart: ApexCharts | null = null;

    const totalMinutes = getTimeRangeTotalMinutes(selectedRange, customRange);
    const points = ['thisWeek', 'lastWeek', 'thisMonth', 'lastMonth'].includes(selectedRange) ? 7 : 12;
    const stepMs = Math.max(3000, Math.round((totalMinutes * 60000) / Math.max(1, points - 1)));
    const tickMs = 1000; // Reduced to 1 second for faster responsiveness

    const categories: number[] = [];
    const vM1: number[] = [];
    const vM2: number[] = [];
    const vM3: number[] = [];

    const rng = makeSeededRandom(`${selectedRange}|${customRange?.start ?? ''}`);
    const now = Date.now();
    for (let i = points - 1; i >= 0; i--) {
      categories.push(now - i * tickMs);
      vM1.push(parseFloat((rng() * (255 - 225) + 225).toFixed(1)));
      vM2.push(parseFloat((rng() * (245 - 215) + 215).toFixed(1)));
      vM3.push(parseFloat((rng() * (265 - 235) + 235).toFixed(1)));
    }

    if (chartRef1.current) {
      let series = pfRef.current.map((pf) => parseFloat((pf * 100).toFixed(1)));
      let labels = ['Machine 1', 'Machine 2', 'Machine 3'];

      if (selectedMachine !== 'all') {
        const idx = parseInt(selectedMachine.replace('m', '')) - 1;
        series = [series[idx]];
        labels = [`Machine ${idx + 1}`];
      }

      const machineColors = {
        m1: '#4f46e5',
        m2: '#10b981',
        m3: '#f59e0b'
      };

      let chartColors = [machineColors.m1, machineColors.m2, machineColors.m3];
      if (selectedMachine !== 'all') {
        chartColors = [machineColors[selectedMachine as keyof typeof machineColors]];
      }

      pfChart = new ApexCharts(chartRef1.current, {
        chart: {
          type: 'radialBar',
          height: 350,
          animations: { enabled: true, dynamicAnimation: { speed: 500 } }
        },
        series: series,
        colors: chartColors,
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
                formatter: () => {
                  if (selectedMachine !== 'all') {
                    const idx = parseInt(selectedMachine.replace('m', '')) - 1;
                    return pfRef.current[idx].toFixed(2);
                  }
                  return ((pfRef.current[0] + pfRef.current[1] + pfRef.current[2]) / 3).toFixed(2);
                }
              }
            }
          }
        },
        labels: labels,
      });
      pfChart.render();
    }

    if (chartRef2.current) {
      let series = [
        { name: 'Machine 1 (V)', data: [...vM1] },
        { name: 'Machine 2 (V)', data: [...vM2] },
        { name: 'Machine 3 (V)', data: [...vM3] }
      ];

      if (selectedMachine !== 'all') {
        const idx = parseInt(selectedMachine.replace('m', '')) - 1;
        series = [series[idx]];
      }

      const machineColors = {
        m1: '#4f46e5',
        m2: '#10b981',
        m3: '#f59e0b'
      };

      let chartColors = [machineColors.m1, machineColors.m2, machineColors.m3];
      if (selectedMachine !== 'all') {
        chartColors = [machineColors[selectedMachine as keyof typeof machineColors]];
      }

      voltageChart = new ApexCharts(chartRef2.current, {
        chart: {
          type: 'area',
          height: 300,
          toolbar: { show: false },
          animations: { enabled: true, dynamicAnimation: { speed: 500 } },
          zoom: { enabled: false }
        },
        stroke: { curve: 'smooth', width: 2 },
        series: series,
        colors: chartColors,
        xaxis: {
          type: 'datetime',
          categories: [...categories],
          labels: { datetimeUTC: false, format: 'HH:mm:ss' },
        },
        yaxis: {
          min: 200,
          max: 280,
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
      if (pfChart) {
        let series = pfRef.current.map((pf) => parseFloat((pf * 100).toFixed(1)));
        if (selectedMachine !== 'all') {
          const idx = parseInt(selectedMachine.replace('m', '')) - 1;
          series = [series[idx]];
        }
        pfChart.updateSeries(series);
      }

      const v1 = parseFloat((Math.random() * (255 - 225) + 225).toFixed(1));
      const i1 = parseFloat((Math.random() * (50 - 30) + 30).toFixed(1));
      const f1 = parseFloat((Math.random() * (50.10 - 49.90) + 49.90).toFixed(2));

      const v2 = parseFloat((Math.random() * (245 - 215) + 215).toFixed(1));
      const i2 = parseFloat((Math.random() * (55 - 35) + 35).toFixed(1));
      const f2 = parseFloat((Math.random() * (50.10 - 49.90) + 49.90).toFixed(2));

      const v3 = parseFloat((Math.random() * (265 - 235) + 235).toFixed(1));
      const i3 = parseFloat((Math.random() * (45 - 25) + 25).toFixed(1));
      const f3 = parseFloat((Math.random() * (50.10 - 49.90) + 49.90).toFixed(2));

      setM1Voltage(v1);
      setM1Current(i1);
      setM1Freq(f1);

      setM2Voltage(v2);
      setM2Current(i2);
      setM2Freq(f2);

      setM3Voltage(v3);
      setM3Current(i3);
      setM3Freq(f3);

      // Alert Trigger Logic
      const machineDataArr = [
        { id: 'm1', name: 'Machine 1', v: v1, i: i1, f: f1 },
        { id: 'm2', name: 'Machine 2', v: v2, i: i2, f: f2 },
        { id: 'm3', name: 'Machine 3', v: v3, i: i3, f: f3 }
      ];

      machineDataArr.forEach(m => {
        const t = thresholds[m.id as keyof typeof thresholds];
        if (m.v > t.v) triggerAlert('High Voltage Alert', `⚠️ ${m.name} Voltage (${m.v.toFixed(1)}V) exceeded threshold (${t.v}V)`);
        if (m.i > t.i) triggerAlert('Current Overload Alert', `⚠️ ${m.name} Current (${m.i.toFixed(1)}A) exceeded threshold (${t.i}A)`);
        if (m.f > t.f) triggerAlert('Frequency Deviation Alert', `⚠️ ${m.name} Frequency (${m.f.toFixed(2)}Hz) exceeded threshold (${t.f}Hz)`);
      });

      categories.shift();
      categories.push(Date.now());
      vM1.shift();
      vM1.push(v1);
      vM2.shift();
      vM2.push(v2);
      vM3.shift();
      vM3.push(v3);

      if (voltageChart) {
        let series = [
          { name: 'Machine 1 (V)', data: [...vM1] },
          { name: 'Machine 2 (V)', data: [...vM2] },
          { name: 'Machine 3 (V)', data: [...vM3] }
        ];

        if (selectedMachine !== 'all') {
          const idx = parseInt(selectedMachine.replace('m', '')) - 1;
          series = [series[idx]];
        }

        voltageChart.updateOptions({ xaxis: { categories: [...categories] } }, false, false);
        voltageChart.updateSeries(series, true);
      }
    }, tickMs);

    return () => {
      clearInterval(interval);
      pfChart?.destroy();
      voltageChart?.destroy();
    };
  }, [selectedRange, customRange, selectedMachine]);

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
            selectedRangeLabel={selectedRangeLabel}
            onSelectRange={handleSelectRange}
            contentRef={contentRef}
            fileName={(rangeLabel) => `Power Monitoring - ${rangeLabel}.pdf`}
            moduleType="power"
            data={{
              widgets: [
                { title: 'Machine 1 Voltage', value: `${m1Voltage.toFixed(1)} V`, sub: 'Line voltage snapshot', trendColor: '#4f46e5' },
                { title: 'Machine 1 Current', value: `${m1Current.toFixed(1)} A`, sub: 'Load draw monitoring', trendColor: '#4f46e5' },
                { title: 'Machine 1 Frequency', value: `${m1Freq.toFixed(2)} Hz`, sub: 'Grid stability check', trendColor: '#4f46e5' },
                { title: 'Machine 2 Voltage', value: `${m2Voltage.toFixed(1)} V`, sub: 'Line voltage snapshot', trendColor: '#10b981' },
                { title: 'Machine 2 Current', value: `${m2Current.toFixed(1)} A`, sub: 'Load draw monitoring', trendColor: '#10b981' },
                { title: 'Machine 2 Frequency', value: `${m2Freq.toFixed(2)} Hz`, sub: 'Grid stability check', trendColor: '#10b981' },
                { title: 'Machine 3 Voltage', value: `${m3Voltage.toFixed(1)} V`, sub: 'Line voltage snapshot', trendColor: '#f59e0b' },
                { title: 'Machine 3 Current', value: `${m3Current.toFixed(1)} A`, sub: 'Load draw monitoring', trendColor: '#f59e0b' },
                { title: 'Machine 3 Frequency', value: `${m3Freq.toFixed(2)} Hz`, sub: 'Grid stability check', trendColor: '#f59e0b' }
              ],
              chartTitles: ['Power Factor by Machine', 'Voltage Trend (Live)'],
              chartDatasets: [
                {
                  type: 'radialBar',
                  series: pfRef.current.map(pf => parseFloat((pf * 100).toFixed(1))),
                  radialLabels: ['Machine 1', 'Machine 2', 'Machine 3']
                },
                {
                  type: 'area',
                  series: [
                    { name: 'Machine 1', data: [225, 240, 255, 230, 245, 250] },
                    { name: 'Machine 2', data: [215, 230, 245, 220, 235, 240] },
                    { name: 'Machine 3', data: [235, 250, 265, 240, 255, 260] }
                  ],
                  colors: ['#4f46e5', '#10b981', '#f59e0b'],
                  categories: [Date.now() - 5000, Date.now() - 4000, Date.now() - 3000, Date.now() - 2000, Date.now() - 1000, Date.now()]
                }
              ]
            }}
          />
          <NotificationBell />
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ '--background': '#f8fafc' }}>
        <div ref={contentRef} className="energy-inner" style={{ paddingTop: '2.5rem' }}>
          <div className="energy-title-row">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Realtime Electrical Parameters</h2>
            <div className="machine-selector-container">
              <IonSelect
                value={selectedMachine}
                onIonChange={(e) => setSelectedMachine(e.detail.value)}
                interface="popover"
                interfaceOptions={{
                  cssClass: 'machine-selector-popover'
                }}
                className="machine-minimal-select"
              >
                <IonSelectOption value="m1">Machine 1</IonSelectOption>
                <IonSelectOption value="m2">Machine 2</IonSelectOption>
                <IonSelectOption value="m3">Machine 3</IonSelectOption>
              </IonSelect>
            </div>
          </div>

          <div className="machine-groups-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {selectedMachine === 'm1' && (
              <div className="machine-section">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4f46e5', marginBottom: '1rem', paddingLeft: '0.5rem' }}>Machine 1</h3>
                <div className="energy-widgets">
                  <IonCard className="widget-card" style={{ borderTop: '4px solid #4f46e5', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <div className="widget-title" style={{ fontWeight: 600, color: '#4f46e5' }}><IonIcon icon={flashOutline} /> Machine 1 Voltage</div>
                    <div className="widget-value">{m1Voltage.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748b' }}>V</span></div>
                    <div className="widget-sub">Line voltage snapshot</div>
                  </IonCard>
                  <IonCard className="widget-card" style={{ borderTop: '4px solid #4f46e5', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <div className="widget-title" style={{ fontWeight: 600, color: '#4f46e5' }}><IonIcon icon={pulseOutline} /> Machine 1 Current</div>
                    <div className="widget-value">{m1Current.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748b' }}>A</span></div>
                    <div className="widget-sub">Load draw monitoring</div>
                  </IonCard>
                  <IonCard className="widget-card" style={{ borderTop: '4px solid #4f46e5', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <div className="widget-title" style={{ fontWeight: 600, color: '#4f46e5' }}><IonIcon icon={speedometerOutline} /> Machine 1 Frequency</div>
                    <div className="widget-value">{m1Freq.toFixed(2)} <span style={{ fontSize: '1rem', color: '#64748b' }}>Hz</span></div>
                    <div className="widget-sub">Grid stability check</div>
                  </IonCard>
                </div>
              </div>
            )}

            {selectedMachine === 'm2' && (
              <div className="machine-section">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginBottom: '1rem', paddingLeft: '0.5rem' }}>Machine 2</h3>
                <div className="energy-widgets">
                  <IonCard className="widget-card" style={{ borderTop: '4px solid #10b981', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <div className="widget-title" style={{ fontWeight: 600, color: '#10b981' }}><IonIcon icon={flashOutline} /> Machine 2 Voltage</div>
                    <div className="widget-value">{m2Voltage.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748b' }}>V</span></div>
                    <div className="widget-sub">Line voltage snapshot</div>
                  </IonCard>
                  <IonCard className="widget-card" style={{ borderTop: '4px solid #10b981', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <div className="widget-title" style={{ fontWeight: 600, color: '#10b981' }}><IonIcon icon={pulseOutline} /> Machine 2 Current</div>
                    <div className="widget-value">{m2Current.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748b' }}>A</span></div>
                    <div className="widget-sub">Load draw monitoring</div>
                  </IonCard>
                  <IonCard className="widget-card" style={{ borderTop: '4px solid #10b981', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <div className="widget-title" style={{ fontWeight: 600, color: '#10b981' }}><IonIcon icon={speedometerOutline} /> Machine 2 Frequency</div>
                    <div className="widget-value">{m2Freq.toFixed(2)} <span style={{ fontSize: '1rem', color: '#64748b' }}>Hz</span></div>
                    <div className="widget-sub">Grid stability check</div>
                  </IonCard>
                </div>
              </div>
            )}

            {selectedMachine === 'm3' && (
              <div className="machine-section">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', marginBottom: '1rem', paddingLeft: '0.5rem' }}>Machine 3</h3>
                <div className="energy-widgets">
                  <IonCard className="widget-card" style={{ borderTop: '4px solid #f59e0b', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <div className="widget-title" style={{ fontWeight: 600, color: '#f59e0b' }}><IonIcon icon={flashOutline} /> Machine 3 Voltage</div>
                    <div className="widget-value">{m3Voltage.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748b' }}>V</span></div>
                    <div className="widget-sub">Line voltage snapshot</div>
                  </IonCard>
                  <IonCard className="widget-card" style={{ borderTop: '4px solid #f59e0b', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <div className="widget-title" style={{ fontWeight: 600, color: '#f59e0b' }}><IonIcon icon={pulseOutline} /> Machine 3 Current</div>
                    <div className="widget-value">{m3Current.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748b' }}>A</span></div>
                    <div className="widget-sub">Load draw monitoring</div>
                  </IonCard>
                  <IonCard className="widget-card" style={{ borderTop: '4px solid #f59e0b', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <div className="widget-title" style={{ fontWeight: 600, color: '#f59e0b' }}><IonIcon icon={speedometerOutline} /> Machine 3 Frequency</div>
                    <div className="widget-value">{m3Freq.toFixed(2)} <span style={{ fontSize: '1rem', color: '#64748b' }}>Hz</span></div>
                    <div className="widget-sub">Grid stability check</div>
                  </IonCard>
                </div>
              </div>
            )}
          </div>

          <div className="energy-grid">
            <IonCard className="energy-card" style={{ borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
              <div className="card-head" style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div className="card-title" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Power Factor by Machine</div>
                <div className="card-badge" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>Live</div>
              </div>
              <div ref={chartRef1} style={{ padding: '1rem 0' }}></div>
            </IonCard>

            <IonCard className="energy-card span-2" style={{ borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
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
