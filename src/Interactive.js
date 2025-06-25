import React, {Component} from 'react';
import DataTable from './DataTable';

import Switch from '@material-ui/core/Switch';
import Slider from '@material-ui/core/Slider';
import Checkbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import RotateLeft from '@material-ui/icons/RotateLeft';

import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { Modal } from '@material-ui/core';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
//import { func } from 'prop-types';
//import am4themes_animated from "@amcharts/amcharts4/themes/animated";


const TempSwitch = withStyles({
    switchBase: {
        color: '#138785',
            '&$checked': { color: '#27baaf'},
            '&$checked + $track': { backgroundColor: '#138785'}
    },
    checked: {},
    track: {},
    })(Switch);

class Interactive extends Component {
  //Initial State (HISTORIC DATA)
  state = {
    ready: true,
    showDataModal: false,
    running: false,
    tempScaleCelsius: true,
    emissionRate: 10.5,
    climateSensitivity: 3,
    displayEmissionsSeries: true,
    displayCO2Series: true,
    displayTempSeries: true,
    displayDataTable: false,
    data: [
      {
        year: new Date(1960, 0),
        co2Emissions: 4.14,
        co2Concentration: 316.91,
        tempC: 13.977,
        tempF: 57.159,
      },
      {
        year: new Date(1965, 0),
        co2Emissions: 4.68,
        co2Concentration: 320.04,
        tempC: 13.886,
        tempF: 56.995,
      },
      {
        year: new Date(1970, 0),
        co2Emissions: 5.59,
        co2Concentration: 325.68,
        tempC: 13.922,
        tempF: 57.06,
      },
      {
        year: new Date(1975, 0),
        co2Emissions: 5.86,
        co2Concentration: 331.08,
        tempC: 13.92,
        tempF: 57.056,
      },
      {
        year: new Date(1980, 0),
        co2Emissions: 6.53,
        co2Concentration: 338.68,
        tempC: 14.053,
        tempF: 57.295,
      },
      {
        year: new Date(1985, 0),
        co2Emissions: 6.68,
        co2Concentration: 346.04,
        tempC: 14.081,
        tempF: 57.346,
      },
      {
        year: new Date(1990, 0),
        co2Emissions: 7.34,
        co2Concentration: 354.35,
        tempC: 14.191,
        tempF: 57.544,
      },
      {
        year: new Date(1995, 0),
        co2Emissions: 7.79,
        co2Concentration: 360.8,
        tempC: 14.239,
        tempF: 57.63,
      },
      {
        year: new Date(2000, 0),
        co2Emissions: 7.79,
        co2Concentration: 369.52,
        tempC: 14.401,
        tempF: 57.922,
      },
      {
        year: new Date(2005, 0),
        co2Emissions: 8.93,
        co2Concentration: 379.8,
        tempC: 14.471,
        tempF: 58.048,
      },
      {
        year: new Date(2010, 0),
        co2Emissions: 9.84,
        co2Concentration: 389.85,
        tempC: 14.451,
        tempF: 58.012,
      },
      {
        year: new Date(2015, 0),
        co2Emissions: 10.34,
        co2Concentration: 399.4,
        tempC: 14.65,
        tempF: 58.37,
      },
      {
        year: new Date(2020, 0),
        co2Emissions: 9.3,
        co2Concentration: 412,
        tempC: 14.88,
        tempF: 58.8,
      },
    ],
  };

  // modal handlers
  handleOpenDataModal = () => {
    this.setState({ showDataModal: true });
  };

  handleCloseDataModal = () => {
    this.setState({ showDataModal: false });
  };

  //**** SIDEBAR HANDLES */
  //Change Temperature Scale
  handleTSChange = (event) => {
    this.setState({ tempScaleCelsius: !this.state.tempScaleCelsius });
    //this.removeSeries();
    if (this.state.tempScaleCelsius) {
      this.switchToFarenheit();
    } else {
      this.switchToCelsius();
    }
  };
  //Change Emission Rate
  handleERChange = (event, newValue) => {
    this.setState({ emissionRate: newValue });
  };
  //Choose Graphs to Display
  handleGraphsToDisplay = (event) => {
    this.setState({ [event.target.value]: event.target.checked });
    let checkedValue = event.target.checked;
    let seriesValue = event.target.value;
    let seriesID;

    //Find series ID and set
    switch (seriesValue) {
      case "displayEmissionsSeries":
        seriesID = "co2Emissions";
        break;

      case "displayCO2Series":
        seriesID = "co2Concentration";
        break;

      case "displayTempSeries":
        seriesID = "tempC";
        break;

      default:
        break;
    }

    //Show or hide specific series
    if (checkedValue) {
      this.chart.map.getKey(seriesID).show();
    } else {
      this.chart.map.getKey(seriesID).hide();
    }
  };

  //Handle Data Table on/off
  handleDataTableDisplay = (event) => {
    this.setState({ [event.target.value]: event.target.checked });
  };

  //Change Climate Sensitivity
  handleCSChange = (event) => {
    this.setState({ climateSensitivity: event.target.value });
  };
  //Return string value for emissions rate slider
  valuetext(value) {
    return `${value}`;
  }
  //Change Play/Pause Buttons
  handlePlay = (event) => {
    this.setState({ running: true });
    this.playInteraction(true);
  };
  handlePause = (event) => {
    this.setState({ running: false });
    this.playInteraction(false);
  };
  handleReset = (event) => {
    this.handlePause();
    this.resetVisuals();
  };

  //**** TEMP SCALE CONVERSIONS */
  // C to F
  celsiusToFarenheit(value) {
    return (value * 9) / 5 + 32;
  }
  // F to C
  farenheitToCelsius(value) {
    return ((value - 32) * 5) / 9;
  }

  /**** ADD NEW DATA */
  addSingleDataPoint() {
    const currentData = this.state.data;
    const currentEmissionRate = this.state.emissionRate;
    const currentClimateSensitivity = this.state.climateSensitivity;
    const currentDataSize = currentData.length;
    const baselineDate = currentData[currentDataSize - 1].year;
    const baselineYear = baselineDate.getFullYear();
    const baselineTemp = currentData[currentDataSize - 1].tempC;
    const baselineCO2Concentration =
      currentData[currentDataSize - 1].co2Concentration;

    let currentDateSet = new Date(baselineYear + 5, 0); //5yr interavals set
    let currentYearSet = currentDateSet.getFullYear();
    const atmosphericFraction = 0.45; //45% standard
    const co2RemovalRate = 0.001; //0.1% per year
    let GtC_per_ppmv = 2.3; // GtC (approx. 2.3 GtC per 1 ppmv)
    let atomosphereCO2Increase =
      (1 - atmosphericFraction) * currentEmissionRate;

    let timeStep = 5; //years
    let calculatedCO2Concentration =
      baselineCO2Concentration * (1 - co2RemovalRate * timeStep) +
      (atomosphereCO2Increase / GtC_per_ppmv) * timeStep; //Multiply by 5yr interval
    let calculatedTemp =
      baselineTemp +
      currentClimateSensitivity *
        Math.log2(calculatedCO2Concentration / baselineCO2Concentration);
    let calculatedTempF = this.celsiusToFarenheit(calculatedTemp);

    let newDataPoint = {
      year: currentDateSet,
      co2Emissions: currentEmissionRate,
      co2Concentration: calculatedCO2Concentration,
      tempC: calculatedTemp,
      tempF: calculatedTempF,
    };

    //Max date 2100
    if (currentYearSet <= 2100) {
      this.setState({
        data: [...this.state.data, newDataPoint],
      });
    } else {
      this.playInteraction(false);
      this.setState({
        ready: false,
        running: false,
      });
    }

    //Write to visualization
    this.triggeredComponentUpdate();
  }

  resetVisuals() {
    //delete data and return to first 50 years (10 data points)
    let finalData = this.state.data;
    finalData.length = 12;
    //return only historic points and restore buttons
    this.setState({
      data: finalData,
      ready: true,
    });
    //init graph again
    this.triggeredComponentUpdate();
  }

  playInteraction(action) {
    //True = Play, False = Pause
    if (action) {
      this.timerID = setInterval(() => this.addSingleDataPoint(), 1000);
    } else {
      clearInterval(this.timerID);
    }
  }

  switchToFarenheit() {
    this.chart.series.getIndex(2).dataFields.valueY = "tempF";
    this.chart.series.getIndex(2).label = "°F";
    this.chart.series.getIndex(
      2
    ).tooltipText = `[bold]Temperature:[/] {valueY.formatNumber('###.00')} °F`;
    this.chart.yAxes.values[2].title.text = "°F";
    this.chart.yAxes.values[2].max = 64.4;
    this.chart.yAxes.values[2].axisRanges.values[0].values.value.value = 60.44;
    console.log(
      this.chart.yAxes.values[2].axisRanges.values[0].values.value.value
    ); // = "°F";
  }
  switchToCelsius() {
    this.chart.series.getIndex(2).dataFields.valueY = "tempC";
    this.chart.series.getIndex(2).label = "°C";
    this.chart.series.getIndex(
      2
    ).tooltipText = `[bold]Temperature:[/] {valueY.formatNumber('###.00')} °C`;
    this.chart.yAxes.values[2].title.text = "°C";
    this.chart.yAxes.values[2].max = 18;
    this.chart.yAxes.values[2].axisRanges.values[0].values.value.value = 15.8;
  }
  removeSeries() {
    if (this.chart.series.length > 2) {
      this.chart.series.removeIndex(2).dispose();
    }
  }

  componentDidMount() {
    //am4core.useTheme(am4themes_animated);

    // Create chart instance
    let chart = am4core.create("chartdiv", am4charts.XYChart);
    chart.paddingTop = 20;

    // Initial data
    chart.data = this.state.data;

    // Create Date Axes (X = categoryAxis)
    let categoryAxis = chart.xAxes.push(new am4charts.DateAxis());
    categoryAxis.renderer.grid.template.location = 0.5;
    categoryAxis.renderer.minGridDistance = 40;
    categoryAxis.dateFormats.setKey("yyyy");
    categoryAxis.renderer.labels.template.location = 0.5;
    categoryAxis.renderer.labels.template.fontSize = 12;
    //categoryAxis.renderer.labels.template.rotation = -45;
    categoryAxis.fillRule = function (dataItem) {
      var date = new Date(dataItem.value);
      if (date.getFullYear() >= 1960 || date.getFullYear() <= 2010) {
        dataItem.axisFill.visible = true;
      } else {
        dataItem.axisFill.visible = false;
      }
    };

    // Create series
    function createSeriesAndAxis(
      field,
      name,
      topMargin,
      bottomMargin,
      bulletOutline,
      bulletFill,
      label
    ) {
      // Create Value Axes (Y = valueAxis)
      var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

      var series = chart.series.push(new am4charts.LineSeries());
      series.id = field;
      series.dataFields.valueY = field;
      series.dataFields.dateX = "year";
      series.name = name;
      series.label = label;
      series.tooltipText = `[bold]${name}:[/] {valueY.formatNumber('###.00')} ${label}`;
      series.strokeWidth = 2;
      series.yAxis = valueAxis;
      series.stroke = bulletOutline;
      series.fill = bulletFill;

      series.events.on("hidden", toggleAxes);
      series.events.on("shown", toggleAxes);

      valueAxis.renderer.line.strokeOpacity = 1;
      valueAxis.renderer.line.stroke = series.stroke;
      valueAxis.renderer.grid.template.stroke = series.stroke;
      valueAxis.renderer.grid.template.strokeOpacity = 0.1;
      valueAxis.renderer.labels.template.fill = series.stroke;
      valueAxis.renderer.labels.template.fontSize = 12;

      /* Set up axis title*/
      valueAxis.title.text = `${label}`;
      valueAxis.title.fill = bulletFill;
      valueAxis.title.align = "absolute";
      valueAxis.title.fontSize = 10;
      valueAxis.title.rotation = 0;
      valueAxis.title.align = "right";
      valueAxis.title.valign = "bottom";
      valueAxis.title.dy = -480;
      valueAxis.title.dx = 30;
      valueAxis.title.fontWeight = 600;

      valueAxis.align = "right";

      if (topMargin && bottomMargin) {
        valueAxis.marginTop = 10;
        valueAxis.marginBottom = 10;
      } else {
        if (topMargin) {
          valueAxis.marginTop = 20;
        }
        if (bottomMargin) {
          valueAxis.marginBottom = 20;
        }
      }

      function toggleAxes(ev) {
        let axis = ev.target.yAxis;
        let disabled = true;
        axis.series.each(function (series) {
          if (!series.isHiding && !series.isHidden) {
            disabled = false;
          }
        });
        axis.disabled = disabled;
      }

      switch (field) {
        case "co2Emissions":
          var bullet = series.bullets.push(new am4charts.CircleBullet());
          bullet.circle.stroke = am4core.color(bulletOutline);
          bullet.circle.fill = bulletFill;
          bullet.circle.strokeWidth = 2;
          valueAxis.max = 30;
          valueAxis.renderer.grid.template.disabled = true;
          break;

        case "co2Concentration":
          var bullet2 = series.bullets.push(new am4charts.Bullet());
          let arrow = bullet2.createChild(am4core.Triangle);
          arrow.width = 10;
          arrow.height = 10;
          arrow.horizontalCenter = "middle";
          arrow.verticalCenter = "middle";
          arrow.stroke = bulletOutline;
          arrow.fill = bulletFill;
          arrow.strokeWidth = 2;
          valueAxis.max = 800;
          //valueAxis.min = 0;
          valueAxis.renderer.grid.template.disabled = true;
          break;

        case "tempC":
          var bullet3 = series.bullets.push(new am4charts.Bullet());
          let square = bullet3.createChild(am4core.Rectangle);
          square.width = 8;
          square.height = 8;
          square.horizontalCenter = "middle";
          square.verticalCenter = "middle";
          square.stroke = bulletOutline;
          square.fill = bulletFill;
          square.strokeWidth = 2;
          valueAxis.max = 18;
          valueAxis.renderer.grid.template.disabled = false;
          valueAxis.renderer.labels.template.fill = series.fill;

          /* Recommended Temperature Limit Guide */
          var limitGuide = valueAxis.axisRanges.create();
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

        case "tempF":
          var bullet4 = series.bullets.push(new am4charts.Bullet());
          let square2 = bullet4.createChild(am4core.Rectangle);
          square2.width = 8;
          square2.height = 8;
          square2.horizontalCenter = "middle";
          square2.verticalCenter = "middle";
          square2.stroke = bulletOutline;
          square2.fill = bulletFill;
          square2.strokeWidth = 2;
          valueAxis.max = 64.4;
          valueAxis.renderer.grid.template.disabled = false;
          valueAxis.renderer.labels.template.fill = series.fill;

          /* Recommended Temperature Limit Guide */
          var limitGuideF = valueAxis.axisRanges.create();
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

        default:
          break;
      }
    }

    //CREATE EACH SERIES AND AXIS
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
      "CO2 Concentration",
      true,
      true,
      "#444",
      "#000",
      "ppm"
    );

    if (this.state.tempScaleCelsius) {
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
      createSeriesAndAxis("tempF", "", true, false, "#6a124f", "#ff0000", "°F");
    }

    //Chart legends
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

    chart.cursor.yAxis = chart.valueAxis;
    chart.cursor.lineY.disabled = false;

    //Add range for historic data background
    let range = categoryAxis.axisRanges.create();
    range.date = new Date(1962, 5);
    range.endDate = new Date(2022, 5);
    range.axisFill.fill = am4core.color("#a6d1ff");
    range.axisFill.fillOpacity = 0.2;
    range.grid.strokeOpacity = 0;

    //hide inactive temp
    /*let seriesTempF = chart.map.getKey("tempF");
        seriesTempF.hide();*/

    this.chart = chart;
  }

  triggeredComponentUpdate() {
    this.chart.data = this.state.data;
  }

  componentDidUpdate(oldProps) {
    this.chart.data = this.state.data;
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  render() {
    return (
      <div className="col">
        <div id="sidebar">
          <div className="base-panel">
            <div className="sidebar-block-container">
              <div className="sidebar-block">
                <p className="sidebar-title">Temperature scale:</p>
                <Typography component="div">
                  <Grid
                    component="label"
                    container
                    alignItems="center"
                    spacing={1}
                  >
                    <Grid item>&deg;F</Grid>
                    <Grid item>
                      <TempSwitch
                        checked={this.state.tempScaleCelsius}
                        value="tempScaleCelsius"
                        onChange={this.handleTSChange}
                      />
                    </Grid>
                    <Grid item>&deg;C</Grid>
                  </Grid>
                </Typography>
              </div>

              <div className="sidebar-block">
                <p className="sidebar-title">Select an emissions rate:</p>
                <Typography component="div">
                  <Slider
                    defaultValue={10.5}
                    //value={this.state.emissionRate}
                    //getAriaValueText={this.valuetext}
                    //aria-labelledby="discrete-slider-small-steps"
                    step={0.2}
                    marks
                    min={0}
                    max={30}
                    valueLabelDisplay="on"
                    track="inverted"
                    //onChange={this.handleERChange}
                    onChangeCommitted={this.handleERChange}
                  />
                  Gigatons Carbon per Year
                </Typography>
              </div>

              <div className="sidebar-block">
                <p className="sidebar-title">
                  Choose the graphs <br />
                  you want to see:
                </p>
                <FormControlLabel
                  value="displayEmissionsSeries"
                  control={
                    <Checkbox
                      color="primary"
                      checked={this.state.displayEmissionsSeries}
                      onChange={this.handleGraphsToDisplay}
                    />
                  }
                  label="Carbon Emissions"
                />
                <FormControlLabel
                  value="displayCO2Series"
                  control={
                    <Checkbox
                      color="primary"
                      checked={this.state.displayCO2Series}
                      onChange={this.handleGraphsToDisplay}
                    />
                  }
                  label="CO2 Concentration"
                  onChange={this.handleGraphsToDisplay}
                />
                <FormControlLabel
                  value="displayTempSeries"
                  control={
                    <Checkbox
                      color="primary"
                      checked={this.state.displayTempSeries}
                      onChange={this.handleGraphsToDisplay}
                    />
                  }
                  label="Temperature"
                  onChange={this.handleGraphsToDisplay}
                />
              </div>

              <div className="sidebar-block">
                <p className="sidebar-title">Change climate sensitivity:</p>
                <FormControl>
                  <Select
                    labelId="cs-selector"
                    id="cs-selector"
                    value={this.state.climateSensitivity}
                    onChange={this.handleCSChange}
                  >
                    <MenuItem value={2}>2 degrees Celsius</MenuItem>
                    <MenuItem value={2.5}>2.5 degrees Celsius</MenuItem>
                    <MenuItem value={3}>3 degrees Celsius</MenuItem>
                    <MenuItem value={4}>4 degrees Celsius</MenuItem>
                    <MenuItem value={4.5}>4.5 degrees Celsius</MenuItem>
                    <MenuItem value={5}>5 degrees Celsius</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
            {this.state.ready ? (
              <div className="sidebar-buttons">
                <Button
                  className="skip-button"
                  onClick={() => this.addSingleDataPoint()}
                  variant="contained"
                  color="primary"
                  title="Step Forward"
                >
                  <SkipNextIcon />
                </Button>

                {this.state.running ? (
                  <Button
                    className="pause-button"
                    onClick={(event) => this.handlePause(event)}
                    variant="contained"
                    color="primary"
                    title="Pause"
                  >
                    <PauseIcon />
                  </Button>
                ) : (
                  <Button
                    className="play-button"
                    onClick={(event) => this.handlePlay(event)}
                    variant="contained"
                    color="primary"
                    title="Go"
                  >
                    <PlayArrowIcon />
                  </Button>
                )}

                <Button
                  className="reset-button"
                  onClick={(event) => this.handleReset(event)}
                  variant="contained"
                  color="primary"
                  title="Start Over"
                >
                  <RotateLeft />
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.handleOpenDataModal}
                >
                  Show Data
                </Button>
              </div>
            ) : (
              <div className="sidebar-buttons">
                <Button
                  className="reset-button"
                  onClick={(event) => this.handleReset(event)}
                  variant="contained"
                  color="primary"
                  title="Start Over"
                >
                  <RotateLeft /> Start Over
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.handleOpenDataModal}
                >
                  Show Data
                </Button>
              </div>
            )}
          </div>
        </div>
        <div id="graph-area">
          <div className="base-panel">
            <div id="chartdiv"></div>
          </div>
        </div>

        <div className="data-wrap col-sm-12">
          {this.state.displayDataTable ? (
            <DataTable data={this.state.data} />
          ) : null}
        </div>

        <Modal
          open={this.state.showDataModal}
          onClose={this.handleCloseDataModal}
          aria-labelledby="data-table-modal"
          aria-describedby="modal-with-data-table"
        >
          <div
            aria-live="polite"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80%",
              backgroundColor: "white",
              padding: "20px",
              boxShadow: 24,
              outline: "none",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h2 id="data-table-modal">Data</h2>

            <DataTable data={this.state.data} />
            <Button onClick={this.handleCloseDataModal} color="secondary">
              Close
            </Button>
          </div>
        </Modal>
      </div>
    );
  }
}

export default Interactive;
