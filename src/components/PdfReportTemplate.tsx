import React, { useEffect, useRef } from "react";
import ApexCharts, { ApexOptions } from "apexcharts";

export type ModuleType = 'energy' | 'oee' | 'maintenance' | 'comparison' | 'production' | 'alerts' | 'power';

type ChartSeries = {
  name: string;
  data: number[];
};

type PdfWidget = {
  title: string;
  value: string | number;
  sub: string;
  trendColor?: string;
};

type PdfChartDataset = {
  type?: 'line' | 'bar' | 'area' | 'radialBar';
  series: number[] | ChartSeries[];
  colors?: string[];
  categories?: number[];
  yTitle?: string;
  radialLabels?: string[];
};

type PdfLogItem = {
  name: string;
  status: string;
  statusColor?: string;
  lastCheck: string;
};

type PdfAlertItem = {
  title: string;
  message: string;
  time: string;
  color?: string;
};

type PdfProgressItem = {
  label: string;
  used: number;
  budget: number;
  color?: string;
};

export interface PdfReportData {
  widgets?: PdfWidget[];
  chartTitles?: string[];
  chartDatasets?: PdfChartDataset[];
  radialSeries?: number[];
  radialLabels?: string[];
  breakdownSeries?: ChartSeries[];
  progressItems?: PdfProgressItem[];
  alerts?: PdfAlertItem[];
  logs?: PdfLogItem[];
  avgOee?: string | number;
}

interface PdfReportTemplateProps {
  pageTitle: string;
  selectedRangeLabel: string;
  moduleType: ModuleType;
  data: PdfReportData;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const PdfReportTemplate: React.FC<PdfReportTemplateProps> = ({
  pageTitle,
  selectedRangeLabel,
  moduleType,
  data,
  containerRef,
}) => {
  const chartNodes = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const charts: ApexCharts[] = [];

    // Logic to render charts based on module type and data
    if (moduleType === 'energy' || moduleType === 'power' || moduleType === 'comparison') {
      const datasets = data.chartDatasets ?? [];
      datasets.forEach((ds, i) => {
        const node = chartNodes.current[i];
        if (!node) return;

        const options: ApexOptions = {
          series: ds.series || [],
          chart: { type: ds.type || 'line', height: 300, animations: { enabled: false }, toolbar: { show: false } },
          stroke: { curve: 'smooth', width: 3 },
          colors: ds.colors || ["#6366f1", "#10b981", "#f59e0b"],
          xaxis: { type: 'datetime', categories: ds.categories || [] },
          yaxis: { title: { text: ds.yTitle || '' } },
          legend: { position: 'top', horizontalAlign: 'right' },
          grid: { borderColor: '#f1f5f9' }
        };
        const chart = new ApexCharts(node, options);
        chart.render();
        charts.push(chart);
      });
    } else if (moduleType === 'oee') {
      // OEE specific charts
      const oeeNode = chartNodes.current[0];
      if (oeeNode) {
        const options: ApexOptions = {
          series: data.radialSeries || [],
          chart: { type: 'radialBar', height: 400, animations: { enabled: false } },
          plotOptions: { radialBar: { hollow: { size: '50%' }, dataLabels: { total: { show: true, label: 'Avg OEE', formatter: () => `${data.avgOee}%` } } } },
          labels: data.radialLabels || [],
          colors: ['#4f46e5', '#10b981', '#f59e0b']
        };
        const chart = new ApexCharts(oeeNode, options);
        chart.render();
        charts.push(chart);
      }

      const breakdownNode = chartNodes.current[1];
      if (breakdownNode && data.breakdownSeries) {
        const options: ApexOptions = {
          series: data.breakdownSeries,
          chart: { type: 'bar', height: 350, animations: { enabled: false }, toolbar: { show: false } },
          xaxis: { categories: ['Machine 1', 'Machine 2', 'Machine 3'] },
          colors: ['#3b82f6', '#8b5cf6', '#10b981'],
          plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } }
        };
        const chart = new ApexCharts(breakdownNode, options);
        chart.render();
        charts.push(chart);
      }
    }

    return () => charts.forEach(c => c.destroy());
  }, [moduleType, data]);

  const renderHeader = () => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "3px solid #f1f5f9", paddingBottom: "20px", marginBottom: "40px" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "36px", fontWeight: 800, color: "#1e293b" }}>{pageTitle}</h1>
        <p style={{ margin: "10px 0 0 0", fontSize: "16px", color: "#64748b", fontWeight: 600 }}>Period: <span style={{ color: "#4f46e5" }}>{selectedRangeLabel}</span></p>
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>Report Generated</p>
        <p style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>{new Date().toLocaleString()}</p>
      </div>
    </div>
  );

  const renderWidgets = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "40px" }}>
      {(data.widgets ?? []).map((w, i) => (
        <div key={i} style={{ padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>{w.title}</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>{w.value}</div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: w.trendColor || "#4f46e5", marginTop: "8px" }}>{w.sub}</div>
        </div>
      ))}
    </div>
  );

  const renderModuleContent = () => {
    switch (moduleType) {
      case 'maintenance':
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b" }}>Machine Health Status</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              {(data.logs ?? []).map((m, i) => (
                <div key={i} style={{ padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontWeight: 800, fontSize: "18px", marginBottom: "12px" }}>{m.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "8px" }}>
                    <span style={{ color: "#64748b" }}>Status</span>
                    <span style={{ color: m.statusColor || "#10b981", fontWeight: 700 }}>{m.status}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span style={{ color: "#64748b" }}>Last Check</span>
                    <span style={{ fontWeight: 600 }}>{m.lastCheck}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'alerts':
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b" }}>Incident Activity Log</h2>
            {(data.alerts ?? []).map((a, i) => (
              <div key={i} style={{ padding: "18px", borderRadius: "12px", borderLeft: `6px solid ${a.color || '#ef4444'}`, backgroundColor: "#fef2f2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 800, color: "#1e293b", fontSize: "16px" }}>{a.title}</div>
                  <div style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>{a.message}</div>
                </div>
                <div style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 600 }}>{a.time}</div>
              </div>
            ))}
          </div>
        );
      case 'production':
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b" }}>Shift Budget Utilization</h2>
            {(data.progressItems ?? []).map((p, i) => (
              <div key={i} style={{ padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontWeight: 800, fontSize: "16px" }}>{p.label}</span>
                  <span style={{ color: "#64748b", fontWeight: 600 }}>{p.used} / {p.budget} kWh</span>
                </div>
                <div style={{ width: "100%", height: "12px", backgroundColor: "#f1f5f9", borderRadius: "6px", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, (p.used / p.budget) * 100)}%`, height: "100%", backgroundColor: p.color || "#4f46e5" }} />
                </div>
              </div>
            ))}
          </div>
        );
      case 'oee':
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            <div style={{ padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "20px", color: "#1e293b" }}>Efficiency Overview</h3>
              <div ref={el => { chartNodes.current[0] = el; }} style={{ width: "100%", height: "400px" }} />
            </div>
            {data.breakdownSeries && (
              <div style={{ padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "20px", color: "#1e293b" }}>Efficiency Breakdown</h3>
                <div ref={el => { chartNodes.current[1] = el; }} style={{ width: "100%", height: "350px" }} />
              </div>
            )}
          </div>
        );
      default:
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            {(data.chartDatasets ?? []).map((_, i) => (
              <div key={i} style={{ padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "20px", color: "#1e293b" }}>{data.chartTitles ? data.chartTitles[i] : `Analysis View ${i + 1}`}</h3>
                <div ref={el => { chartNodes.current[i] = el; }} style={{ width: "100%", height: "300px" }} />
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "1200px",
        padding: "60px",
        backgroundColor: "#ffffff",
        color: "#0f172a",
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        minHeight: "1500px"
      }}
    >
      {renderHeader()}
      {renderWidgets()}
      {renderModuleContent()}

      <div style={{ marginTop: "auto", paddingTop: "40px", textAlign: "center", fontSize: "12px", color: "#94a3b8", borderTop: "1px solid #f1f5f9" }}>
        Analytics Intelligence Report • Performance Data Verified • Page 1 of 1
      </div>
    </div>
  );
};

export default PdfReportTemplate;
