import { useEffect, useRef } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

type GraphAreaProps = {
  data: any[];
};

const GraphArea = ({ data }: GraphAreaProps) => {
  const chartRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    // Create chart instance
    const chart = am4core.create(chartRef.current, am4charts.XYChart);

    // Initial data
    chart.data = data;


    // Create axes
    const categoryAxis = chart.xAxes.push(new am4charts.DateAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 40;
    categoryAxis.dateFormats.setKey("year", "yyyy");
    categoryAxis.renderer.labels.template.location = 0;
    categoryAxis.renderer.labels.template.fontSize = 12;

    function createSeriesAndAxis(
      field: any,
      name: any,
      topMargin: any,
      bottomMargin: any,
      bulletOutline: any,
      bulletFill: any,
      bulletType: any
    )
{
      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

      const series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.valueY = field;
      series.dataFields.dateX = "year";
      series.name = name;
      series.tooltipText = "{name}: [b]{valueY}[/]";
      series.strokeWidth = 2;
      series.yAxis = valueAxis;
      series.stroke = am4core.color(bulletOutline);
      series.fill = am4core.color(bulletFill);

      valueAxis.renderer.line.strokeOpacity = 1;
      valueAxis.renderer.line.stroke = series.stroke;
      valueAxis.renderer.grid.template.stroke = series.stroke;
      valueAxis.renderer.grid.template.strokeOpacity = 0.1;
      valueAxis.renderer.labels.template.fill = series.stroke;
      valueAxis.renderer.minGridDistance = 50;
      valueAxis.renderer.labels.template.fontSize = 12;
      valueAxis.align = "right";

      if (topMargin && bottomMargin) {
        valueAxis.marginTop = 10;
        valueAxis.marginBottom = 10;
      } else {
        if (topMargin) valueAxis.marginTop = 20;
        if (bottomMargin) valueAxis.marginBottom = 20;
      }

      switch (bulletType) {
        case "circle": {
          const bullet = series.bullets.push(new am4charts.CircleBullet());
          bullet.stroke = am4core.color(bulletOutline);
          bullet.fill = am4core.color(bulletFill);
          bullet.circle.strokeWidth = 2;
          break;
        }

        case "square": {
          const bullet2 = series.bullets.push(new am4charts.Bullet());
          const square = bullet2.createChild(am4core.Rectangle);
          square.width = 8;
          square.height = 8;
          square.horizontalCenter = "middle";
          square.verticalCenter = "middle";
          square.stroke = am4core.color(bulletOutline);
          square.fill = am4core.color(bulletFill);
          square.strokeWidth = 2;
          break;
        }

        case "triangle": {
          const bullet3 = series.bullets.push(new am4charts.Bullet());
          const triangle = bullet3.createChild(am4core.Triangle);
          triangle.width = 10;
          triangle.height = 10;
          triangle.horizontalCenter = "middle";
          triangle.verticalCenter = "middle";
          triangle.stroke = am4core.color(bulletOutline);
          triangle.fill = am4core.color(bulletFill);
          triangle.strokeWidth = 2;
          break;
        }

        default:
          break;
      }

      // Warning limit guide
      const limitGuide = valueAxis.axisRanges.create();
      limitGuide.value = 14.1;
      limitGuide.grid.stroke = am4core.color("orange");
      limitGuide.grid.strokeOpacity = 0.6;
      limitGuide.label.text = "RTL";
      limitGuide.label.align = "right";
      limitGuide.label.verticalCenter = "bottom";
      limitGuide.label.fillOpacity = 0.8;
    }

    createSeriesAndAxis(
      "co2Emissions",
      "Carbon Emissions",
      false,
      true,
      "#007bff",
      "#007bff",
      "triangle"
    );
    createSeriesAndAxis(
      "co2Concentration",
      "CO2 Concentration",
      true,
      true,
      "#444",
      "#000",
      "circle"
    );
    createSeriesAndAxis(
      "tempC",
      "Temperature",
      true,
      false,
      "#6a124f",
      "#ff0000",
      "square"
    );

    chart.legend = new am4charts.Legend();
    chart.cursor = new am4charts.XYCursor();
    chart.leftAxesContainer.layout = "horizontal";

    // Store chart instance for cleanup
    //const chartId = chart.uid; // optional, for debugging
    return () => {
      if (chart) {
        chart.dispose();
      }
    };
  }, [data]); // Recreate chart if `data` changes

  return (
    <div id="graph-area" className="col-sm-8">

        <div
          id="chartdiv"
          ref={chartRef}
          style={{ width: "100%", height: "500px" }}
        />
      </div>
 
  );
};

export default GraphArea;
