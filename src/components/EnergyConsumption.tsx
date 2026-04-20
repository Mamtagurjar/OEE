// src/components/EnergyConsumption.tsx
import React, { useEffect, useRef, useState } from "react";
import ApexCharts, { ApexOptions } from "apexcharts";
import "./EnergyConsumption.css";
import TimeRangeModal from "./TimeRangeModal";
import { IonIcon, IonCard } from "@ionic/react";
import { calendarOutline } from "ionicons/icons";

const CHART_COUNT = 3;

export type RangeKey =
  | "5m"
  | "30m"
  | "6h"
  | "12h"
  | "24h"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "custom";

interface RangeSpec {
  totalMinutes: number;
  stepMinutes: number;
}

export interface CustomRange {
  start: string;
  end: string;
}

interface ChartDataset {
  labels: string[];
  timestamps: number[];
  dataA: number[];
  dataB: number[];
  stepMinutes: number;
}

interface ChartInstance {
  chart: ApexCharts;
  timestamps: number[];
  stepMinutes: number;
  seriesA: number[];
  seriesB: number[];
}

const FIXED_RANGE_SPECS: Record<Exclude<RangeKey, "custom">, RangeSpec> = {
  "5m": { totalMinutes: 5, stepMinutes: 1 },
  "30m": { totalMinutes: 30, stepMinutes: 5 },
  "6h": { totalMinutes: 360, stepMinutes: 30 },
  "12h": { totalMinutes: 720, stepMinutes: 60 },
  "24h": { totalMinutes: 1440, stepMinutes: 120 },
  thisWeek: { totalMinutes: 7 * 24 * 60, stepMinutes: 12 * 60 },
  lastWeek: { totalMinutes: 7 * 24 * 60, stepMinutes: 12 * 60 },
  thisMonth: { totalMinutes: 30 * 24 * 60, stepMinutes: 24 * 60 },
  lastMonth: { totalMinutes: 30 * 24 * 60, stepMinutes: 24 * 60 },
};

const valueFromWave = (idx: number, machineOffset: number, base: number): number => {
  const trend = Math.sin((idx + machineOffset) / 3) * 8;
  const noise = (Math.random() - 0.5) * 6;
  return Math.max(5, Math.round(base + trend + noise));
};

const formatTick = (timestamp: number, stepMinutes: number): string => {
  const d = new Date(timestamp);

  if (stepMinutes >= 24 * 60) {
    return d.toLocaleDateString([], { month: "short", day: "2-digit" });
  }

  if (stepMinutes >= 60) {
    return d.toLocaleString([], {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const resolveSpec = (
  range: RangeKey,
  customRange: CustomRange | null
): { spec: RangeSpec; startAt: number; endAt: number } => {
  const now = Date.now();

  if (range === "custom" && customRange) {
    const startMs = new Date(customRange.start).getTime();
    const endMs = new Date(customRange.end).getTime();
    const safeEnd = Number.isFinite(endMs) ? endMs : now;
    const safeStart = Number.isFinite(startMs)
      ? Math.min(startMs, safeEnd - 60000)
      : safeEnd - 24 * 60 * 60000;

    const diffMinutes = Math.max(5, Math.round((safeEnd - safeStart) / 60000));
    let stepMinutes = 1;
    if (diffMinutes > 60 && diffMinutes <= 6 * 60) stepMinutes = 5;
    if (diffMinutes > 6 * 60 && diffMinutes <= 24 * 60) stepMinutes = 30;
    if (diffMinutes > 24 * 60 && diffMinutes <= 7 * 24 * 60) stepMinutes = 120;
    if (diffMinutes > 7 * 24 * 60) stepMinutes = 12 * 60;

    return {
      spec: { totalMinutes: diffMinutes, stepMinutes },
      startAt: safeStart,
      endAt: safeEnd,
    };
  }

  if (range === "lastWeek") {
    const endAt = now - 7 * 24 * 60 * 60000;
    const spec = FIXED_RANGE_SPECS.lastWeek;
    return { spec, startAt: endAt - spec.totalMinutes * 60000, endAt };
  }

  if (range === "lastMonth") {
    const endAt = now - 30 * 24 * 60 * 60000;
    const spec = FIXED_RANGE_SPECS.lastMonth;
    return { spec, startAt: endAt - spec.totalMinutes * 60000, endAt };
  }

  const spec = FIXED_RANGE_SPECS[range as Exclude<RangeKey, "custom">] || FIXED_RANGE_SPECS["5m"];
  const endAt = now;
  return { spec, startAt: endAt - spec.totalMinutes * 60000, endAt };
};

const buildDataset = (
  range: RangeKey,
  machineIdx: number,
  customRange: CustomRange | null
): ChartDataset => {
  const { spec, startAt, endAt } = resolveSpec(range, customRange);
  const pointCount = Math.max(2, Math.floor(spec.totalMinutes / spec.stepMinutes) + 1);
  const stepMs = spec.stepMinutes * 60000;

  const timestamps: number[] = [];
  const labels: string[] = [];
  const dataA: number[] = [];
  const dataB: number[] = [];

  for (let i = 0; i < pointCount; i++) {
    const ts = Math.min(startAt + i * stepMs, endAt);
    timestamps.push(ts);
    labels.push(formatTick(ts, spec.stepMinutes));
    dataA.push(valueFromWave(i, machineIdx * 1.7, 48));
    dataB.push(valueFromWave(i, machineIdx * 1.2, 35));
  }

  return { labels, timestamps, dataA, dataB, stepMinutes: spec.stepMinutes };
};

type EnergyConsumptionProps = {
  selectedRange?: RangeKey;
  selectedRangeLabel?: string;
  customRange?: CustomRange | null;
  onSelectRange?: (
    range: string,
    label: string,
    selectedCustomRange?: CustomRange
  ) => void;
  showRangeButton?: boolean;
  showRangeModal?: boolean;
};

export default function EnergyConsumption({
  selectedRange: controlledRange,
  selectedRangeLabel: controlledRangeLabel,
  customRange: controlledCustomRange,
  onSelectRange,
  showRangeButton = true,
  showRangeModal = true,
}: EnergyConsumptionProps) {
  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const instances = useRef<ChartInstance[]>([]);

  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<RangeKey>("5m");
  const [selectedRangeLabel, setSelectedRangeLabel] = useState("5 min");
  const [customRange, setCustomRange] = useState<CustomRange | null>(null);

  const effectiveRange = controlledRange ?? selectedRange;
  const effectiveRangeLabel = controlledRangeLabel ?? selectedRangeLabel;
  const effectiveCustomRange = controlledCustomRange ?? customRange;

  useEffect(() => {
    for (let i = 0; i < CHART_COUNT; i++) {
      const el = nodes.current[i];
      if (!el) continue;

      const initialData = buildDataset(effectiveRange, i, effectiveCustomRange);

      let xAxisFormat = "HH:mm";
      if (["thisWeek", "lastWeek", "thisMonth", "lastMonth"].includes(effectiveRange)) {
        xAxisFormat = "dd MMM";
      } else if (effectiveRange === "custom" && effectiveCustomRange) {
        const diffMs =
          new Date(effectiveCustomRange.end).getTime() -
          new Date(effectiveCustomRange.start).getTime();
        if (diffMs > 24 * 60 * 60 * 1000) xAxisFormat = "dd MMM";
      }

      const opts: ApexOptions = {
        series: [
          { name: "Energy A", data: initialData.dataA },
          { name: "Energy B", data: initialData.dataB },
        ],
        chart: {
          type: "line",
          height: 250,
          toolbar: { show: false },
          zoom: { enabled: false },
        },
        stroke: { curve: "straight", width: 2.5 },
        markers: { size: 4, strokeWidth: 1.5, hover: { size: 6 } },
        tooltip: { 
          enabled: true, 
          theme: "light", 
          x: { format: "dd MMM yyyy, HH:mm" },
          y: { formatter: (v: number) => `${v} kWh` } 
        },
        xaxis: {
          type: "datetime",
          categories: initialData.timestamps,
          labels: {
            style: { colors: "#6b7280" },
            datetimeUTC: false,
            rotate: 0,
            hideOverlappingLabels: true,
            format: xAxisFormat,
          },
          crosshairs: { show: true },
          tooltip: { enabled: false },
        },
        yaxis: { labels: { style: { colors: "#6b7280" } } },
        grid: { borderColor: "#e5e7eb" },
        colors: ["#6366f1", "#06b6d4"],
        legend: { position: "top", horizontalAlign: "right", labels: { colors: "#6b7280" } },
      };

      try {
        const chart = new ApexCharts(el, opts);
        chart.render();
        instances.current[i] = {
          chart,
          timestamps: [...initialData.timestamps],
          stepMinutes: initialData.stepMinutes,
          seriesA: [...initialData.dataA],
          seriesB: [...initialData.dataB],
        };
      } catch {
        // ignore single-chart init error
      }
    }

    const intervalId = setInterval(() => {
      instances.current.forEach((inst) => {
        if (!inst) return;

        try {
          const s0 = [...inst.seriesA];
          const s1 = [...inst.seriesB];

          if (s0.length < 2 || s1.length < 2 || inst.timestamps.length < 2) {
            return;
          }

          const lastA = s0[s0.length - 1] || 10;
          const lastB = s1[s1.length - 1] || 8;
          const newA = Math.max(0, Math.round(lastA * (0.8 + Math.random() * 0.4)));
          const newB = Math.max(0, Math.round(lastB * (0.8 + Math.random() * 0.4)));

          const updatedA = [...s0.slice(1), newA];
          const updatedB = [...s1.slice(1), newB];

          inst.seriesA = updatedA;
          inst.seriesB = updatedB;

          const nextTs = Date.now();
          inst.timestamps = [...inst.timestamps.slice(1), nextTs];
          const newCategories = inst.timestamps;

          inst.chart.updateOptions(
            {
              xaxis: { categories: newCategories },
            },
            false,
            false
          );

          inst.chart.updateSeries(
            [
              { name: "Energy A", data: updatedA },
              { name: "Energy B", data: updatedB },
            ],
            true
          );
        } catch {
          // ignore per-chart update error
        }
      });
    }, 60000);

    return () => {
      clearInterval(intervalId);
      instances.current.forEach((inst) => {
        if (inst && inst.chart) {
          try {
            inst.chart.destroy();
          } catch {
            // ignore chart destroy error
          }
        }
      });
      instances.current = [];
    };
  }, [effectiveRange, effectiveCustomRange]);

  const handleSelectRange = (
    range: string,
    label: string,
    selectedCustomRange?: CustomRange
  ) => {
    if (onSelectRange) {
      onSelectRange(range, label, selectedCustomRange);
      return;
    }

    setSelectedRange(range as RangeKey);
    setSelectedRangeLabel(label);
    setCustomRange(range === "custom" && selectedCustomRange ? selectedCustomRange : null);
  };

  return (
    <section className="energy-page-wrapper" aria-label="Energy Consumption">
      <div className="energy-inner">
        <div className="energy-title-row">
          {showRangeButton ? (
            <button
              className="time-range-button"
              onClick={() => (showRangeModal ? setModalOpen(true) : undefined)}
            >
              <IonIcon icon={calendarOutline} />
              <span>{effectiveRangeLabel}</span>
            </button>
          ) : null}
        </div>

        <div className="energy-widgets">
          <IonCard className="widget-card">
            <div className="widget-title">
              Total Energy Today
            </div>
            <div className="widget-value">2,845 <span style={{fontSize: "1rem", color: "#64748b"}}>kWh</span></div>
            <div className="widget-sub">▲ 12% vs yesterday</div>
          </IonCard>
          <IonCard className="widget-card">
            <div className="widget-title">
              Active Machines
            </div>
            <div className="widget-value">3 <span style={{fontSize: "1rem", color: "#64748b"}}>/ 3</span></div>
            <div className="widget-sub">Optimal operation</div>
          </IonCard>
          <IonCard className="widget-card">
            <div className="widget-title">
              Average Load
            </div>
            <div className="widget-value">42.5 <span style={{fontSize: "1rem", color: "#64748b"}}>kW</span></div>
            <div className="widget-sub negative">▼ 5% avg reduction</div>
          </IonCard>
        </div>

        <div className="energy-grid">
          {Array.from({ length: CHART_COUNT }).map((_, i) => (
          <IonCard className="energy-card" key={i}>
            <div className="card-head">
              <div className="card-title">Machine {i + 1}</div>
              <div className="card-badge">Live</div>
            </div>
            <div
              className="energy-chart"
              id={`energy-chart-${i}`}
              ref={(el) => {
                nodes.current[i] = el;
              }}
            />
          </IonCard>
          ))}
        </div>
      </div>
      {showRangeModal ? (
        <TimeRangeModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSelect={handleSelectRange}
          selectedRange={effectiveRange}
          theme="light"
        />
      ) : null}
    </section>
  );
}
