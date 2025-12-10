// ChartView.tsx
import { useEffect, useRef } from "react";
import type { XYChart } from "@amcharts/amcharts4/charts";
import { createChart } from "./createChart";

type ChartViewProps = {
  data: any[];
  tempScaleCelsius: boolean;
};

export default function ChartView({ data, tempScaleCelsius }: ChartViewProps) {
  const chartRef = useRef<XYChart | null>(null);

  useEffect(() => {
    const chart = createChart("chartdiv", data, tempScaleCelsius);
    chartRef.current = chart;

    return () => {
      chart.dispose();
      chartRef.current = null;
    };
  }, [data, tempScaleCelsius]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.data = data;
    }
  }, [data]);

  return null; // the chart renders into #chartdiv
}
