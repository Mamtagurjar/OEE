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
import { barChartOutline, speedometerOutline } from 'ionicons/icons';
import ApexCharts from 'apexcharts';
import '../components/EnergyConsumption.css';
import PdfDownloadControl from '../components/PdfDownloadControl';
import NotificationBell from '../components/NotificationBell';

const MachineComparison: React.FC = () => {
  const barChartRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [selectedRange, setSelectedRange] = useState("5m");
  const [customRange, setCustomRange] = useState<{start: string, end: string} | null>(null);

  const handleSelectRange = (
    range: string,
    _label: string,
    selectedCustomRange?: {start: string, end: string}
  ) => {
    setSelectedRange(range);
    setCustomRange(range === "custom" && selectedCustomRange ? selectedCustomRange : null);
  };

  useEffect(() => {
    let comparisonChart: ApexCharts | null = null;
    
    let stepMs = 60000; 
    let pointCount = 6;
    
    switch(selectedRange) {
      case '5m': stepMs = 60000; pointCount = 6; break;
      case '30m': stepMs = 5 * 60000; pointCount = 7; break;
      case '6h': stepMs = 60 * 60000; pointCount = 7; break;
      case '12h': stepMs = 2 * 60 * 60000; pointCount = 7; break;
      case '24h': stepMs = 4 * 60 * 60000; pointCount = 7; break;
      case 'thisWeek': case 'lastWeek': stepMs = 24 * 60 * 60000; pointCount = 7; break;
      case 'thisMonth': case 'lastMonth': stepMs = 5 * 24 * 60 * 60000; pointCount = 7; break;
      case 'custom':
        if (customRange) {
            const s = new Date(customRange.start).getTime();
            const e = new Date(customRange.end).getTime();
            stepMs = Math.max(60000, (e - s) / 6);
            pointCount = 7;
        }
        break;
      default: stepMs = 60000; pointCount = 6; 
    }

    const categories: number[] = [];
    const dataM1: number[] = [];
    const dataM2: number[] = [];
    const dataM3: number[] = [];
    const now = Date.now();
    
    let xAxisFormat = "HH:mm";
    if (['thisWeek', 'lastWeek', 'thisMonth', 'lastMonth'].includes(selectedRange)) {
        xAxisFormat = "dd MMM";
    } else if (selectedRange === 'custom' && customRange) {
        const diffMs = new Date(customRange.end).getTime() - new Date(customRange.start).getTime();
        if (diffMs > 24 * 60 * 60 * 1000) xAxisFormat = "dd MMM";
    }
    
    for (let i = pointCount - 1; i >= 0; i--) {
      categories.push(now - i * stepMs);
      dataM1.push(parseFloat((Math.random() * (85 - 65) + 65).toFixed(1))); // kW
      dataM2.push(parseFloat((Math.random() * (110 - 80) + 80).toFixed(1))); // kW
      dataM3.push(parseFloat((Math.random() * (75 - 55) + 55).toFixed(1))); // kW
    }
    
    if (barChartRef.current) {
      comparisonChart = new ApexCharts(barChartRef.current, {
        chart: { type: 'bar', height: 350, toolbar: { show: false }, animations: { enabled: true, dynamicAnimation: { speed: 1000 } } },
        series: [
          { name: 'Machine 1 (kW)', data: [...dataM1] },
          { name: 'Machine 2 (kW)', data: [...dataM2] },
          { name: 'Machine 3 (kW)', data: [...dataM3] }
        ],
        colors: ['#4f46e5', '#10b981', '#f59e0b'],
        xaxis: {
          type: 'datetime',
          categories: [...categories],
          labels: {
            datetimeUTC: false,
            format: xAxisFormat
          }
        },
        yaxis: {
          title: { text: 'kW' },
          labels: { formatter: (val: number) => val.toFixed(0) }
        },
        dataLabels: { enabled: false },
        tooltip: {
          x: { format: 'dd MMM yyyy, HH:mm' },
          y: { formatter: (val: number) => `${val.toFixed(1)} kW` }
        },
        plotOptions: { bar: { borderRadius: 2, columnWidth: '60%' } }
      });
      comparisonChart.render();
    }

    const interval = setInterval(() => {
      if (comparisonChart) {
        categories.shift();
        categories.push(Date.now());
        
        dataM1.shift();
        dataM1.push(parseFloat((Math.random() * (85 - 65) + 65).toFixed(1)));

        dataM2.shift();
        dataM2.push(parseFloat((Math.random() * (110 - 80) + 80).toFixed(1)));

        dataM3.shift();
        dataM3.push(parseFloat((Math.random() * (75 - 55) + 55).toFixed(1)));

        comparisonChart.updateOptions({ xaxis: { categories: [...categories] } }, false, false);
        comparisonChart.updateSeries([
          { name: 'Machine 1 (kW)', data: [...dataM1] },
          { name: 'Machine 2 (kW)', data: [...dataM2] },
          { name: 'Machine 3 (kW)', data: [...dataM3] }
        ], true);
      }
    }, Math.max(60000, stepMs));

    return () => {
      clearInterval(interval);
      comparisonChart?.destroy();
    };
  }, [selectedRange, customRange]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton color="primary" />
          </IonButtons>
          <IonTitle>Machine Comparison</IonTitle>
          <PdfDownloadControl
            pageTitle="Machine Comparison"
            selectedRange={selectedRange}
            onSelectRange={handleSelectRange}
            contentRef={contentRef}
          />
          <NotificationBell />
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding" style={{ '--background': '#f8fafc' }}>
        <div ref={contentRef} className="energy-inner" style={{ paddingTop: '1rem' }}>
          
          <div className="energy-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>System Analytics</h2>
            {/* <button className="time-range-button" onClick={() => setModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
              <IonIcon icon={calendarOutline} style={{ color: '#64748b' }} />
              <span style={{ fontWeight: 500, color: '#334155' }}>{selectedRangeLabel}</span>
            </button> */}
          </div>

          <div className="energy-widgets">
            <IonCard className="widget-card" style={{ borderTop: '4px solid #4f46e5', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div className="widget-title" style={{ fontWeight: 600, color: '#4f46e5' }}><IonIcon icon={barChartOutline} /> Machine 1 Status</div>
              <div className="widget-value" style={{ margin: '10px 0', fontSize: '1.25rem', fontWeight: 700 }}>Normal</div>
              <div className="widget-sub" style={{ color: '#64748b', fontWeight: 500 }}>Balanced load distribution</div>
            </IonCard>
            <IonCard className="widget-card" style={{ borderTop: '4px solid #ef4444', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div className="widget-title" style={{ fontWeight: 600, color: '#ef4444' }}><IonIcon icon={barChartOutline} /> Peak Consumer</div>
              <div className="widget-value" style={{ margin: '10px 0', fontSize: '1.25rem', fontWeight: 700 }}>Machine 2</div>
              <div className="widget-sub negative" style={{ color: '#ef4444', fontWeight: 500 }}>▲ 12% higher than avg</div>
            </IonCard>
            <IonCard className="widget-card" style={{ borderTop: '4px solid #f59e0b', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div className="widget-title" style={{ fontWeight: 600, color: '#f59e0b' }}><IonIcon icon={speedometerOutline} /> Most Efficient</div>
              <div className="widget-value" style={{ margin: '10px 0', fontSize: '1.25rem', fontWeight: 700 }}>Machine 3</div>
              <div className="widget-sub" style={{ color: '#64748b', fontWeight: 500 }}>Operating at optimal load</div>
            </IonCard>
          </div>

          <div className="energy-grid" style={{ marginTop: '1.5rem' }}>
            <IonCard className="energy-card" style={{ gridColumn: 'span 2', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', border: 'none', background: '#ffffff' }}>
              <div className="card-head" style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="card-title" style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>Power Demand Comparison</div>
                <div className="card-badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>History</div>
              </div>
              <div ref={barChartRef} style={{ padding: '1rem', minHeight: '350px' }}></div>
            </IonCard>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default MachineComparison;