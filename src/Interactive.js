// Interactive.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createChart } from "./createChart";
import { initialData } from "./initialData";
import DataTable from "./DataTable";


import { withStyles } from "@mui/styles";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import RotateLeft from "@mui/icons-material/RotateLeft";

import { Input, Switch, Grid, Button, Checkbox, FormControlLabel, FormControl, Select, Slider, Typography, MenuItem, Box, Stack, Modal } from "@mui/material";

const GtC_per_ppmv = 2.3;
const atmosphericFraction = 0.45;
const co2RemovalRate = 0.001;
const climateSensitivityInit = 3; 
const emissionRateInit = 10.5; 

function celsiusToFahrenheit(c) {
  return (c * 9) / 5 + 32;
}

export function fahrenheitToCelsius(f) {
  return ((f - 32) * 5) / 9;
}

const TempSwitch = withStyles({
    switchBase: {
        color: '#138785',
            '&$checked': { color: '#27baaf'},
            '&$checked + $track': { backgroundColor: '#138785'}
    },
    checked: {},
    track: {},
    })(Switch);

export default function Interactive() {
  
  const chartRef = useRef(null);
  const timerRef = useRef(null);

  const [showDataModal, setShowDataModal] = useState(false);
  const [data, setData] = useState(initialData);
  const [running, setRunning] = useState(false);
  const [tempScaleCelsius, setTempScaleCelsius] = useState(true);
  const [emissionRate, setEmissionRate] = useState(emissionRateInit); // GtC/year
  const [climateSensitivity, setClimateSensitivity] = useState(climateSensitivityInit); 

  const emissionRateRef = useRef(emissionRate);
  const climateSensitivityRef = useRef(climateSensitivity);

  const [displaySeries, setDisplaySeries] = useState({
    emissions: true,
    co2: true,
    temp: true,
  });

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

  useEffect(() => {
    emissionRateRef.current = emissionRate;
  }, [emissionRate]);

  useEffect(() => {
    climateSensitivityRef.current = climateSensitivity;
  }, [climateSensitivity]);

  const updateSeriesVisibility = useCallback(() => {
    if (!chartRef.current) return;
    const { emissions, co2, temp } = displaySeries;
    chartRef.current.series.each((series) =>
    {
      if (series.id === "co2Emissions")
      {
        if (emissions === false)
        {
          series.hide();
        } else
        {
          series.show()
        }
      } else if (series.id === "co2Concentration") {
        if (co2 === false) {
          series.hide();
        } else {
          series.show();
        }
      } else if (series.id === (tempScaleCelsius ? "tempC" : "tempF")) {
        if (temp === false) {
          series.hide();
        } else {
          series.show();
        }
      }
    });
  }, [displaySeries, tempScaleCelsius]);

  useEffect(() => {
    updateSeriesVisibility();
  }, [updateSeriesVisibility]);

  const handleToggleSeries = (event) =>
  {
    setDisplaySeries((prev) => ({
      ...prev,
      [event.target.name]: event.target.checked,
    }));
  };

  const handleClimateSensitivityChange = (event) =>
  {
    setClimateSensitivity(event.target.value);
  }

  function runSimulationStep() {
    setData((currentData) =>
    {
      let timeStep = 5; //years
      const currentEmissionRate = emissionRateRef.current;
      const currentClimateSensitivity = climateSensitivityRef.current;
      const currentDataSize = currentData.length;
      const baselineDate = currentData[currentDataSize - 1].year;
      const baselineYear = baselineDate.getFullYear();
      const baselineTemp = currentData[currentDataSize - 1].tempC;
      const baselineCO2Concentration =
        currentData[currentDataSize - 1].co2Concentration;

      let currentDateSet = new Date(baselineYear + timeStep, 0); //5yr interavals set
      let currentYearSet = currentDateSet.getFullYear();


      if (currentYearSet > 2100) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setRunning(false);
        return currentData;
      }

      const atmosphericFraction = 0.45; //45% standard
      const co2RemovalRate = 0.001; //0.1% per year
      let GtC_per_ppmv = 2.3; // GtC (approx. 2.3 GtC per 1 ppmv)

      let atmosphereCO2Increase =
        (1 - atmosphericFraction) * currentEmissionRate;

      let calculatedCO2Concentration =
        baselineCO2Concentration * (1 - co2RemovalRate * timeStep) +
        (atmosphereCO2Increase / GtC_per_ppmv) * timeStep; //Multiply by 5yr interval
      let calculatedTemp =
        baselineTemp +
        currentClimateSensitivity *
          Math.log2(calculatedCO2Concentration / baselineCO2Concentration);
      let calculatedTempF = celsiusToFahrenheit(calculatedTemp);

      return [
        ...currentData,
        {
          year: currentDateSet,
          co2Emissions: currentEmissionRate,
          co2Concentration: calculatedCO2Concentration,
          tempC: calculatedTemp,
          tempF: calculatedTempF,
        },
      ];
    });
  }

  function toggleRunning() {
    setRunning((prev) => {
      if (!prev) {
        timerRef.current = setInterval(runSimulationStep, 1000);
      } else {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return !prev;
    });
  }


  function resetSimulation() {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setEmissionRate(10.5);
    setClimateSensitivity(3);
    setDisplaySeries({
      emissions: true,
      co2: true,
      temp: true,
    });
    setRunning(false);
    setData(initialData);
  }

  return (
    <Box spacing={2} sx={{ padding: 2 }} >
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={5}
          sx={{
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <Typography component="div">
            Temperature Scale:
            <Grid component="label" container alignItems="center" spacing={1}>
              <Grid>&deg;F</Grid>
              <Grid>
                <TempSwitch
                  checked={tempScaleCelsius}
                  value="tempScaleCelsius"
                  onChange={() => setTempScaleCelsius((s) => !s)}
                />
              </Grid>
              <Grid>&deg;C</Grid>
            </Grid>
          </Typography>
          <FormControl>
            <Typography gutterBottom>Emissions Rate (GtC/year)</Typography>
            <Slider
              value={emissionRate}
              marks
              min={0}
              max={30}
              step={0.2}
              valueLabelDisplay="on"
              track="inverted"
              onChangeCommitted={(e, val) => setEmissionRate(val)}
            />
          </FormControl>
          <FormControl>
            <Typography gutterBottom>
              Choose which graphs to display:
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={displaySeries.emissions}
                  onChange={handleToggleSeries}
                  name="emissions"
                />
              }
              label="Emissions"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={displaySeries.co2}
                  onChange={handleToggleSeries}
                  name="co2"
                />
              }
              label="CO₂ Concentration"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={displaySeries.temp}
                  onChange={handleToggleSeries}
                  name="temp"
                />
              }
              label="Temperature"
            />
          </FormControl>

          <FormControl>
            <Typography gutterBottom>Change Climate Sensitivity:</Typography>
            <Select
              labelId="cs-selector"
              id="cs-selector"
              value={climateSensitivity}
              onChange={handleClimateSensitivityChange}
            >
              <MenuItem value={2}>2 degrees Celsius</MenuItem>
              <MenuItem value={2.5}>2.5 degrees Celsius</MenuItem>
              <MenuItem value={3}>3 degrees Celsius</MenuItem>
              <MenuItem value={4}>4 degrees Celsius</MenuItem>
              <MenuItem value={4.5}>4.5 degrees Celsius</MenuItem>
              <MenuItem value={5}>5 degrees Celsius</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Stack
          direction="row"
          spacing={10}
          sx={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            title="Step Forward"
            onClick={runSimulationStep}
          >
            <SkipNextIcon />
          </Button>
          <Button
            variant="contained"
            color="primary"
            title={running ? "Pause" : "Go"}
            onClick={toggleRunning}
          >
            {running ? <PauseIcon /> : <PlayArrowIcon />}
          </Button>

          <Button
            variant="contained"
            color="primary"
            title="Start Over"
            onClick={resetSimulation}
          >
            <RotateLeft />
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowDataModal(true)}
          >
            Show Data
          </Button>
        </Stack>

        <Box id="chartdiv" sx={{ width: "100%", height: "500px"}} />
      </Stack>
      <div className="data-wrap col-sm-12">
        {showDataModal ? <DataTable data={data} /> : null}
      </div>

      <Modal
        open={showDataModal}
        onClose={() => setShowDataModal(false)}
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

          <DataTable data={data} />
          <Button onClick={() => setShowDataModal(false)} color="secondary">
            Close
          </Button>
        </div>
      </Modal>
    </Box>
  );
}
