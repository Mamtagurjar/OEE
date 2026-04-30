import React, { useRef, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import EnergyConsumption, {
  type CustomRange,
  type RangeKey,
} from '../components/EnergyConsumption';
import PageToolbar from '../components/PageToolbar';

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
      <PageToolbar
        title="Energy Consumption"
        selectedRange={selectedRange}
        selectedRangeLabel={selectedRangeLabel}
        onSelectRange={handleSelectRange}
        contentRef={contentRef}
        moduleType="energy"
        data={{
          widgets: [
            { title: 'Total Energy Today', value: '2,845 kWh', sub: '+12% vs yesterday', trendColor: '#4f46e5' },
            { title: 'Active Machines', value: '3 / 3', sub: 'Optimal operation', trendColor: '#10b981' },
            { title: 'Average Load', value: '42.5 kW', sub: '-5% avg reduction', trendColor: '#f59e0b' }
          ],
          chartTitles: ['Machine 1', 'Machine 2', 'Machine 3'],
          chartDatasets: [
            {
              type: 'line',
              series: [{ name: 'Energy A', data: [45, 52, 48, 55, 50, 58] }, { name: 'Energy B', data: [32, 38, 35, 40, 37, 42] }],
              categories: [Date.now() - 5000, Date.now() - 4000, Date.now() - 3000, Date.now() - 2000, Date.now() - 1000, Date.now()],
              colors: ['#6366f1', '#06b6d4']
            },
            {
              type: 'line',
              series: [{ name: 'Energy A', data: [42, 48, 45, 50, 47, 52] }, { name: 'Energy B', data: [30, 35, 32, 38, 34, 40] }],
              categories: [Date.now() - 5000, Date.now() - 4000, Date.now() - 3000, Date.now() - 2000, Date.now() - 1000, Date.now()],
              colors: ['#6366f1', '#06b6d4']
            },
            {
              type: 'line',
              series: [{ name: 'Energy A', data: [48, 55, 50, 60, 55, 62] }, { name: 'Energy B', data: [35, 42, 38, 45, 40, 48] }],
              categories: [Date.now() - 5000, Date.now() - 4000, Date.now() - 3000, Date.now() - 2000, Date.now() - 1000, Date.now()],
              colors: ['#6366f1', '#06b6d4']
            }
          ]
        }}
      />
      <IonContent>
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
