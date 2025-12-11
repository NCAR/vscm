// Interactive.tsx
import React, { useState, useEffect, useRef } from "react";
import { initialData } from "./initialData";
import DataTable from "./DataTable";
import { styled } from "@mui/material/styles";
import MuiInput from "@mui/material/Input";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import RotateLeft from "@mui/icons-material/RotateLeft";
import {
  Grid,
  Radio,
  RadioGroup,
  FormLabel,
  Button,
  Checkbox,
  FormControlLabel,
  FormControl,
  Select,
  Slider,
  MenuItem,
  Box,
  Stack,
  Modal,
} from "@mui/material";

const ChartView = React.lazy(() => import("./ChartView"));

const CLIMATE_SENSITIVITY_INIT = 3;
const EMISSION_RATE_INIT = 10.5;
const TIME_STEP_YEARS = 5;
const EMISSION_MIN = 0;
const EMISSION_MAX = 30;

function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

const Input = styled(MuiInput)`
  width: 55px;
`;

export default function Interactive() {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showDataModal, setShowDataModal] = useState(false);
  const [data, setData] = useState(initialData);
  const [running, setRunning] = useState(false);
  const [tempScaleCelsius, setTempScaleCelsius] = useState(true);
  const [emissionRate, setEmissionRate] = useState(EMISSION_RATE_INIT); // GtC/year
  const [climateSensitivity, setClimateSensitivity] = useState(
    CLIMATE_SENSITIVITY_INIT
  );

  const emissionRateRef = useRef(emissionRate);
  const climateSensitivityRef = useRef(climateSensitivity);

  const [displaySeries, setDisplaySeries] = useState({
    emissions: true,
    co2: true,
    temp: true,
  });

  const buttonPlayStyle = {
    backgroundColor: running ? "#cc0000" : "#A8C700",
  };
  const buttonGenericStyle = {
    backgroundColor: "#00797c",
  };
  const buttonStepStyle = {
    backgroundColor: running ? "#bbcbcb" : "#00797c",
  };

  const handleERInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value === "" ? 0 : Number(event.target.value);
    const clamped = Math.min(Math.max(raw, EMISSION_MIN), EMISSION_MAX);
    setEmissionRate(clamped);
  };

  const handleBlur = () => {
    if (emissionRate < EMISSION_MIN) {
      setEmissionRate(EMISSION_MIN);
    } else if (emissionRate > EMISSION_MAX) {
      setEmissionRate(EMISSION_MAX);
    }
  };

  const toggleRunning = () => {
    setRunning((prev) => !prev);
  };

  const handleToggleSeries = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setDisplaySeries((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  function runSimulationStep() {
    setData((currentData) => {
      const currentEmissionRate = emissionRateRef.current;
      const currentClimateSensitivity = climateSensitivityRef.current;
      const currentDataSize = currentData.length;
      const baselineDate = currentData[currentDataSize - 1].year;
      const baselineYear = baselineDate.getFullYear();
      const baselineTemp = currentData[currentDataSize - 1].tempC;
      const baselineCO2Concentration =
        currentData[currentDataSize - 1].co2Concentration;

      const nextDate = new Date(baselineYear + TIME_STEP_YEARS, 0);
      const nextYear = nextDate.getFullYear();

      if (nextYear > 2100) {
        if (timerRef.current !== null) {
          clearInterval(timerRef.current);
        }
        timerRef.current = null;
        setRunning(false);
        return currentData;
      }

      const atmosphericFraction = 0.45; // 45%
      const co2RemovalRate = 0.001; // 0.1% per year
      const GtC_PER_PPMV = 2.13; // approx. factor

      const atmosphereCO2Increase =
        (1 - atmosphericFraction) * currentEmissionRate;

      const calculatedCO2Concentration =
        baselineCO2Concentration * (1 - co2RemovalRate * TIME_STEP_YEARS) +
        (atmosphereCO2Increase / GtC_PER_PPMV) * TIME_STEP_YEARS;

      const calculatedTemp =
        baselineTemp +
        currentClimateSensitivity *
          Math.log2(calculatedCO2Concentration / baselineCO2Concentration);

      const calculatedTempF = celsiusToFahrenheit(calculatedTemp);

      return [
        ...currentData,
        {
          year: nextDate,
          co2Emissions: currentEmissionRate,
          co2Concentration: calculatedCO2Concentration,
          tempC: calculatedTemp,
          tempF: calculatedTempF,
        },
      ];
    });
  }

  useEffect(() => {
    emissionRateRef.current = emissionRate;
  }, [emissionRate]);

  useEffect(() => {
    climateSensitivityRef.current = climateSensitivity;
  }, [climateSensitivity]);

  // Single source of truth for the timer
  useEffect(() => {
    if (!running) {
      return;
    }

    const id = setInterval(runSimulationStep, 1000);
    timerRef.current = id;

    return () => {
      clearInterval(id);
      timerRef.current = null;
    };
  }, [running]);

  const resetSimulation = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }
    timerRef.current = null;

    setEmissionRate(EMISSION_RATE_INIT);
    setClimateSensitivity(CLIMATE_SENSITIVITY_INIT);
    setDisplaySeries({
      emissions: true,
      co2: true,
      temp: true,
    });
    setRunning(false);
    setData(initialData);
  };

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
                  min={EMISSION_MIN}
                  max={EMISSION_MAX}
                  step={0.5}
                  track="inverted"
                  aria-labelledby="input-er-slider"
                  onChangeCommitted={(_, val) =>
                    setEmissionRate(
                      Math.min(
                        Math.max(Number(val), EMISSION_MIN),
                        EMISSION_MAX
                      )
                    )
                  }
                />
              </Grid>
              <Grid>
                <Input
                  value={emissionRate}
                  onChange={handleERInputChange}
                  onBlur={handleBlur}
                  inputProps={{
                    step: 0.5,
                    min: EMISSION_MIN,
                    max: EMISSION_MAX,
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
              onChange={(e) =>
                setClimateSensitivity(Number(e.target.value))
              }
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
          <ChartView
            data={data}
            tempScaleCelsius={tempScaleCelsius}
            displaySeries={displaySeries}
          />
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
          tabIndex={-1}
          ref={(el) => {
            if (el && showDataModal) {
              el.focus();
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
