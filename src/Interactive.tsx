// Interactive.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createChart } from "./createChart";
import { initialData } from "./initialData";
import DataTable from "./DataTable";
import { styled } from "@mui/material/styles";
import MuiInput from "@mui/material/Input";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import RotateLeft from "@mui/icons-material/RotateLeft";
import type { XYChart } from "@amcharts/amcharts4/charts";
import { Grid, Radio, RadioGroup, FormLabel, Button, Checkbox, FormControlLabel, FormControl, Select, Slider,  MenuItem, Box, Stack, Modal } from "@mui/material";

const ChartView = React.lazy(() => import("./ChartView"));
const climateSensitivityInit = 3; 
const emissionRateInit = 10.5; 

function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

const Input = styled(MuiInput)`
  width: 55px;
`;

export default function Interactive() {
  
const chartRef = useRef<XYChart | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  const [value] = React.useState(30);

  const buttonPlayStyle = {
    backgroundColor: running ? "#cc0000" : "#A8C700",
  };
  const buttonGenericStyle = {
    backgroundColor: "#00797c",
  };
  const buttonStepStyle = {
      backgroundColor: running ? "#bbcbcb" : "#00797c",
   };

const handleERInputChange = (event: React.ChangeEvent<HTMLInputElement>) =>
  {
    let value = event.target.value === "" ? 0 : Number(event.target.value);
    if (value < 0) {
      setEmissionRate(0);
    } else if (value > 30) {
      setEmissionRate(30);
    } else
    {
      setEmissionRate(value);
    }
  };

  const handleBlur = () => {
    if (value < 0) {
      setEmissionRate(0);
    } else if (value > 30) {
      setEmissionRate(30);
    }
  };

  function toggleRunning() {
    setRunning((prev) => !prev);
  }

  useEffect(() => {
    if (running) {
      // Start
      timerRef.current = setInterval(runSimulationStep, 1000);
    } else {
      // Stop
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    // Cleanup if component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [running]);

 useEffect(() => {
  // Dispose previous chart if it exists
  if (chartRef.current) {
    chartRef.current.dispose();
    chartRef.current = null;
  }

  const newChart = createChart("chartdiv", data, tempScaleCelsius);
  chartRef.current = newChart;

  return () => {
    if (chartRef.current) {
      chartRef.current.dispose();
      chartRef.current = null;
    }
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
    chartRef.current.series.each((series:any) =>
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

const handleToggleSeries = (event: React.ChangeEvent<HTMLInputElement>) =>
  {
    setDisplaySeries((prev) => ({
      ...prev,
      [event.target.name]: event.target.checked,
    }));
  };

  function runSimulationStep() {
    setData((currentData) =>
    {
      const timeStep = 5; //years
      const currentEmissionRate = emissionRateRef.current;
      const currentClimateSensitivity = climateSensitivityRef.current;
      const currentDataSize = currentData.length;
      const baselineDate = currentData[currentDataSize - 1].year;
      const baselineYear = baselineDate.getFullYear();
      const baselineTemp = currentData[currentDataSize - 1].tempC;
      const baselineCO2Concentration =
        currentData[currentDataSize - 1].co2Concentration;

      const currentDateSet = new Date(baselineYear + timeStep, 0); //5yr interavals set
      const currentYearSet = currentDateSet.getFullYear();


      if (currentYearSet > 2100) {
        if (timerRef.current !== null) clearInterval(timerRef.current);

        timerRef.current = null;
        setRunning(false);
        return currentData;
      }

      const atmosphericFraction = 0.45; //45% standard
      const co2RemovalRate = 0.001; //0.1% per year
      const GtC_per_ppmv = 2.13; // GtC (approx. 2.3 GtC per 1 ppmv)

      const atmosphereCO2Increase =
        (1 - atmosphericFraction) * currentEmissionRate;

      const calculatedCO2Concentration =
        baselineCO2Concentration * (1 - co2RemovalRate * timeStep) +
        (atmosphereCO2Increase / GtC_per_ppmv) * timeStep; //Multiply by 5yr interval
      const calculatedTemp =
        baselineTemp +
        currentClimateSensitivity *
          Math.log2(calculatedCO2Concentration / baselineCO2Concentration);
      const calculatedTempF = celsiusToFahrenheit(calculatedTemp);

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

  useEffect(() => {
    if (running && !timerRef.current) {
      // Only create an interval if one doesn’t already exist
      timerRef.current = setInterval(runSimulationStep, 1000);
    }

    if (!running && timerRef.current) {
      // Clear interval when running stops
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        if (timerRef.current !== null) clearInterval(timerRef.current);

        timerRef.current = null;
      }
    };
  }, [running]);

  function resetSimulation() {
    if (timerRef.current !== null) clearInterval(timerRef.current);
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
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={{ xs: 2, sm: 5, md: 8 }}
          sx={{
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <FormControl component="fieldset">
            <FormLabel id="temp-scale-label" aria-hidden="true">
              Temperature Scale
            </FormLabel>
            <RadioGroup
              aria-labelledby="temp-scale-label"
              name="temp-scale"
              value={tempScaleCelsius ? "celsius" : "fahrenheit"}
              onChange={(e) =>
                setTempScaleCelsius(e.target.value === "celsius")
              }
              row
            >
              <FormControlLabel
                value="fahrenheit"
                control={<Radio />}
                label={<span aria-hidden="true">&deg;F</span>}
                aria-label="Degrees Fahrenheit"
              />
              <FormControlLabel
                value="celsius"
                control={<Radio />}
                label={<span aria-hidden="true">&deg;C</span>}
                aria-label="Degrees Celsius"
              />
            </RadioGroup>
          </FormControl>

          <Box sx={{ width: 250 }}>
            <FormLabel id="input-er-slider" aria-hidden="true">
              Emissions Rate (GtC/year)
            </FormLabel>
            <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
              <Grid size="grow">
                <Slider
                  value={emissionRate}
                  marks
                  min={0}
                  max={30}
                  step={0.5}
                  track="inverted"
                  aria-labelledby="input-er-slider"
                  onChangeCommitted={(_, val) => setEmissionRate(Number(val))}
                />
              </Grid>
              <Grid>
                <Input
                  value={emissionRate}
                  onChange={handleERInputChange}
                  onBlur={handleBlur}
                  inputProps={{
                    step: 0.5,
                    min: 0,
                    max: 30,
                    type: "number",
                    "aria-labelledby": "input-er",
                  }}
                />
              </Grid>
            </Grid>
          </Box>
          <FormControl>
            <FormLabel component="legend">
              Choose which graphs to display:
            </FormLabel>

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
            <FormLabel
              aria-hidden="true"
              component="label"
              id="cs-selector-label"
              htmlFor="cs-selector"
            >
              Change Climate Sensitivity
            </FormLabel>
            <Select<number>
              labelId="cs-selector-label"
              id="cs-selector"
              value={climateSensitivity}
              onChange={(e) => setClimateSensitivity(Number(e.target.value))}
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
            style={buttonStepStyle}
            title="Step Forward"
            disabled={running}
            onClick={runSimulationStep}
          >
            <SkipNextIcon />
          </Button>
          <Button
            variant="contained"
            style={buttonPlayStyle}
            title={running ? "Pause" : "Go"}
            onClick={toggleRunning}
          >
            {running ? <PauseIcon /> : <PlayArrowIcon />}
          </Button>

          <Button
            variant="contained"
            style={buttonGenericStyle}
            title="Start Over"
            onClick={resetSimulation}
          >
            <RotateLeft />
          </Button>
          <Button
            variant="contained"
            style={buttonGenericStyle}
            onClick={() => setShowDataModal(true)}
          >
            Show Data
          </Button>
        </Stack>

        <Box id="chartdiv" sx={{ width: "100%", height: "500px" }} />
        <React.Suspense fallback={null}>
          <ChartView data={data} tempScaleCelsius={tempScaleCelsius} />
        </React.Suspense>

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
          role="dialog"
          aria-modal="true"
          aria-labelledby="data-table-modal"
          aria-describedby="modal-with-data-table"
          tabIndex={-1} // allow programmatic focus
          ref={(el) => {
            if (el && showDataModal) {
              el.focus(); // move focus into modal on open
            }
          }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            backgroundColor: "white",
            padding: "20px",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.3)",
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
