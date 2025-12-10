// createChart.js
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

export function createChart(chartDivId: string,
  data: any[],
  tempScaleCelsius: boolean) {
  const chart = am4core.create(chartDivId, am4charts.XYChart);
  chart.paddingTop = 30;
  chart.data = data;
  chart.readerTitle =
    "Climate data chart showing Carbon emissions, carbon concentrations, and temperature over time.";
  chart.focusable = false; // make the whole chart container focusable if needed

  const categoryAxis = chart.xAxes.push(new am4charts.DateAxis());
  categoryAxis.renderer.grid.template.location = 0.5;
  categoryAxis.renderer.minGridDistance = 40;
  categoryAxis.dateFormats.setKey("year", "yyyy")
  categoryAxis.renderer.labels.template.location = 0.5;
  categoryAxis.renderer.labels.template.fontSize = 12;
  categoryAxis.fillRule = function (dataItem) {
    const date = new Date(dataItem.value);
    dataItem.axisFill.visible =
      date.getFullYear() >= 1960 || date.getFullYear() <= 2010;
  };

function createSeriesAndAxis(
  field: string,
  name: string,
  topMargin: boolean,
  bottomMargin: boolean,
  bulletOutline: string,
  bulletFill: string,
  label: string
) {
    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    const series = chart.series.push(new am4charts.LineSeries());
    series.id = field;
    series.dataFields.valueY = field;
    series.dataFields.dateX = "year";
    series.name = name;
    //series.label = label;
    series.tooltipText = `[bold]${name}:[/] {valueY.formatNumber('###.00')} ${label}`;
    series.strokeWidth = 2;
    series.yAxis = valueAxis;
    series.stroke = am4core.color(bulletOutline);
    series.fill = am4core.color(bulletFill);
    series.focusable = false;
    series.events.on("hidden", toggleAxes);
    series.events.on("shown", toggleAxes);

    // Helper to make bullets keyboard/screen-reader friendly
   function makeBulletAccessible(
      bulletTemplate: any,
      series: am4charts.LineSeries,
      unitLabel: string
    ) {
  
      // Put bullets in the tab order
      bulletTemplate.focusable = true;

      // Give bullets a non-generic role so SRs read the label
      // (optional but helps NVDA/JAWS avoid "group")
      bulletTemplate.role = "img";

      // Per-point label derived from data item
      bulletTemplate.adapter.add("readerTitle", (_: any, target: any) => {
        const di = target.dataItem;
        if (di && di.valueY != null) {
          // di.dateX is a Date when using DateAxis; guard in case it isn't ready
          let yearText = "";
          if (di.dateX instanceof Date) {
            yearText = String(di.dateX.getFullYear());
          } else if (di.categoryX) {
            yearText = String(di.categoryX);
          }

          const val = Number(di.valueY).toFixed(2);
          return `${series.name}, Year ${yearText}, ${val} ${unitLabel}`;
        }
        // Fallback so we never throw or return empty
        return series.name + " data point";
      });
    }

    valueAxis.renderer.line.strokeOpacity = 1;
    valueAxis.renderer.line.stroke = series.stroke;
    valueAxis.renderer.grid.template.stroke = series.stroke;
    valueAxis.renderer.grid.template.strokeOpacity = 0.1;
    valueAxis.renderer.labels.template.fill = series.stroke;
    valueAxis.renderer.labels.template.fontSize = 12;
    valueAxis.title.text = `${label}`;
    valueAxis.title.fill = am4core.color(bulletFill);
    valueAxis.title.fontSize = 10;
    valueAxis.title.rotation = 0;
    valueAxis.title.align = "right";
    valueAxis.title.valign = "bottom";
    valueAxis.title.dy = -470;
    valueAxis.title.dx = 30;
    valueAxis.title.fontWeight = "600";
    valueAxis.align = "right";

    if (topMargin && bottomMargin) {
      valueAxis.marginTop = 10;
      valueAxis.marginBottom = 10;
    } else {
      if (topMargin) valueAxis.marginTop = 20;
      if (bottomMargin) valueAxis.marginBottom = 20;
    }

    function toggleAxes(ev: any) {
      const axis = ev.target.yAxis
      let disabled = true;
     
      axis.series.each((series: any) => {
        if (!series.isHiding && !series.isHidden) {
          disabled = false;
        }
      });
      axis.disabled = disabled;
    }

    switch (field) {
      case "co2Emissions": {
        const bullet = series.bullets.push(new am4charts.CircleBullet());
        bullet.circle.stroke = am4core.color(bulletOutline);
        bullet.circle.fill = am4core.color(bulletFill);
        bullet.circle.strokeWidth = 2;
            
        makeBulletAccessible(bullet, series, label);
        valueAxis.max = 30;
        valueAxis.min = 0;
        valueAxis.renderer.grid.template.disabled = true;

        break;
      }
      case "co2Concentration": {
        const bullet = series.bullets.push(new am4charts.Bullet());
            
        makeBulletAccessible(bullet, series, label);
        const arrow = bullet.createChild(am4core.Triangle);
        arrow.width = 10;
        arrow.height = 10;
        arrow.horizontalCenter = "middle";
        arrow.verticalCenter = "middle";
        arrow.stroke = am4core.color(bulletOutline);
        arrow.fill = am4core.color(bulletFill);
        arrow.strokeWidth = 2;
        valueAxis.max = 932;
        valueAxis.min = 300;
        valueAxis.renderer.grid.template.disabled = true;
        break;
      }
      case "tempC": {
        const bullet = series.bullets.push(new am4charts.Bullet());
            
        makeBulletAccessible(bullet, series, label);
        const square = bullet.createChild(am4core.Rectangle);
        square.width = 8;
        square.height = 8;
        square.horizontalCenter = "middle";
        square.verticalCenter = "middle";
        square.stroke = am4core.color(bulletOutline);
        square.fill = am4core.color(bulletFill);
        square.strokeWidth = 2;
        valueAxis.max = 21;
        valueAxis.min = 10;
        valueAxis.renderer.grid.template.disabled = false;
        valueAxis.renderer.labels.template.fill = series.fill;

        const limitGuide = valueAxis.axisRanges.create();
        limitGuide.value = 15.8;
        limitGuide.grid.stroke = am4core.color("red");
        limitGuide.label.fill = am4core.color("red");
        limitGuide.grid.strokeOpacity = 0.6;
        limitGuide.grid.strokeWidth = 2;
        limitGuide.grid.above = true;
        limitGuide.label.text = "Recommended Temperature Limit";
        limitGuide.label.align = "right";
        limitGuide.label.inside = true;
        limitGuide.label.verticalCenter = "bottom";
        limitGuide.label.horizontalCenter = "right";
        limitGuide.label.fillOpacity = 0.7;
        break;
      }
      case "tempF": {
        const bullet = series.bullets.push(new am4charts.Bullet());
            
        makeBulletAccessible(bullet, series, label);
        const square = bullet.createChild(am4core.Rectangle);
        square.width = 8;
        square.height = 8;
        square.horizontalCenter = "middle";
        square.verticalCenter = "middle";
        square.stroke = am4core.color(bulletOutline);
        square.fill = am4core.color(bulletFill);
        square.strokeWidth = 2;
        valueAxis.max = 69;
        valueAxis.min = 50;
        valueAxis.renderer.grid.template.disabled = false;
        valueAxis.renderer.labels.template.fill = series.fill;

        const limitGuideF = valueAxis.axisRanges.create();
        limitGuideF.value = 60.44;
        limitGuideF.grid.stroke = am4core.color("red");
        limitGuideF.label.fill = am4core.color("red");
        limitGuideF.grid.strokeOpacity = 0.6;
        limitGuideF.grid.strokeWidth = 2;
        limitGuideF.grid.above = true;
        limitGuideF.label.text = "Recommended Temperature Limit";
        limitGuideF.label.align = "right";
        limitGuideF.label.inside = true;
        limitGuideF.label.verticalCenter = "bottom";
        limitGuideF.label.horizontalCenter = "right";
        limitGuideF.label.fillOpacity = 0.7;
        break;
      }
      default:
        break;
    }
  }

  createSeriesAndAxis(
    "co2Emissions",
    "Carbon Emissions",
    false,
    true,
    "#007bff",
    "#007bff",
    "GtC"
  );
  createSeriesAndAxis(
    "co2Concentration",
    "Carbon Dioxide Concentration",
    true,
    true,
    "#444",
    "#000",
    "ppm"
  );

  if (tempScaleCelsius) {
    createSeriesAndAxis(
      "tempC",
      "Temperature",
      true,
      false,
      "#6a124f",
      "#ff0000",
      "°C"
    );
  } else {
    createSeriesAndAxis(
      "tempF",
      "Temperature",
      true,
      false,
      "#6a124f",
      "#ff0000",
      "°F"
    );
  }

  chart.legend = new am4charts.Legend();
  chart.legend.itemContainers.template.clickable = false;
  chart.legend.itemContainers.template.focusable = false;
  chart.legend.itemContainers.template.cursorOverStyle =
    am4core.MouseCursorStyle.default;
  chart.cursor = new am4charts.XYCursor();
  chart.leftAxesContainer.layout = "horizontal";
  chart.cursor.xAxis = categoryAxis;
  chart.cursor.fullWidthLineX = true;
  chart.cursor.lineX.strokeWidth = 0;
  chart.cursor.lineX.fill = am4core.color("#8F3985");
  chart.cursor.lineX.fillOpacity = 0.1;
  chart.cursor.lineY.disabled = false;

  const range = categoryAxis.axisRanges.create();
  range.date = new Date(1962, 5);
  range.endDate = new Date(2022, 5);
  range.axisFill.fill = am4core.color("#a6d1ff");
  range.axisFill.fillOpacity = 0.2;
  range.grid.strokeOpacity = 0;

  return chart;
}
