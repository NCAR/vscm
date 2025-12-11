import { useEffect, useRef } from "react";
import type { XYChart } from "@amcharts/amcharts4/charts";
import { createChart } from "./createChart";

type ChartViewProps = {
  data: any[];
  tempScaleCelsius: boolean;
  displaySeries: {
    emissions: boolean;
    co2: boolean;
    temp: boolean;
  };
};

export default function ChartView({ data, tempScaleCelsius, displaySeries }: ChartViewProps) {
  const chartRef = useRef<XYChart | null>(null);

  // Create + recreate chart when scale changes
  useEffect(() => {
    const chart = createChart("chartdiv", data, tempScaleCelsius);
    chartRef.current = chart;

    return () => {
      chart.dispose();
      chartRef.current = null;
    };
  }, [tempScaleCelsius]);

  // Update data only
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.data = data;
    }
  }, [data]);

  // Update series visibility only
  useEffect(() => {
    if (!chartRef.current) return;

    const { emissions, co2, temp } = displaySeries;

    chartRef.current.series.each((series: any) => {
      const id = series.id;

      if (id === "co2Emissions") emissions ? series.show() : series.hide();
      if (id === "co2Concentration") co2 ? series.show() : series.hide();
      if (id === (tempScaleCelsius ? "tempC" : "tempF")) temp ? series.show() : series.hide();
    });
  }, [displaySeries, tempScaleCelsius]);

  return null;
}
