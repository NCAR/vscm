import React, { useState } from "react";
import Switch from "@mui/material/Switch";
import Slider from "@mui/material/Slider";
import Checkbox from "@mui/material/Checkbox";
import { withStyles } from "@mui/styles";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SkipNextIcon from "@mui/icons-material/SkipNext";

import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

const TempSwitch = withStyles({
  switchBase: {
    color: "#138785",
    "&$checked": { color: "#27baaf" },
    "&$checked + $track": { backgroundColor: "#138785" },
  },
  checked: {},
  track: {},
})(Switch);

function valuetext(value) {
  return `${value}`;
}

const Sidebar = () => {
  const [tempScale, setTempScale] = useState(false);
  const [emissionRate, setEmissionRate] = useState(10.5);
  const [climateSensitivity, setClimateSensitivity] = useState(3);

  const handleTSChange = (event) => {
    setTempScale(event.target.checked);
  };

  const handleERChange = (event, newValue) => {
    setEmissionRate(newValue);
  };

  const handleCSChange = (event) => {
    setClimateSensitivity(event.target.value);
  };

  return (
    <div id="sidebar" className="col-sm-4">
      <div className="base-panel">
        <p className="hook-text">
          <em>
            What will the temperature be in the future? Make a prediction using
            this model.
          </em>
        </p>

        <div className="sidebar-block">
          <p className="sidebar-title">Temperature scale:</p>
          <Typography component="div">
            <Grid component="label" container alignItems="center" spacing={1}>
              <Grid item>&deg;C</Grid>
              <Grid item>
                <TempSwitch
                  checked={tempScale}
                  onChange={handleTSChange}
                  value="tempScale"
                />
              </Grid>
              <Grid item>&deg;F</Grid>
            </Grid>
          </Typography>
        </div>

        <div className="sidebar-block">
          <p className="sidebar-title">Select an emissions rate:</p>
          <Typography component="div">
            <Slider
              value={emissionRate}
              getAriaValueText={valuetext}
              aria-labelledby="discrete-slider-small-steps"
              step={0.2}
              marks
              min={0}
              max={30}
              valueLabelDisplay="on"
              track="inverted"
              onChange={handleERChange}
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
            value="co2 emission rate"
            control={<Checkbox color="primary" />}
            label="CO2 Emission Rate"
          />
          <FormControlLabel
            value="co2 concentration"
            control={<Checkbox color="primary" />}
            label="CO2 Concentration"
          />
          <FormControlLabel
            value="temperature"
            control={<Checkbox color="primary" />}
            label="Temperature"
          />
        </div>

        <div className="sidebar-block">
          <p className="sidebar-title">Change climate sensitivity:</p>
          <FormControl>
            <Select
              labelId="cs-selector"
              id="cs-selector"
              value={climateSensitivity}
              onChange={handleCSChange}
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

        <div className="sidebar-buttons">
          <Button
            className="skip-button"
            variant="contained"
            color="primary"
            title="Step Forward"
          >
            <SkipNextIcon />
          </Button>

          <Button
            className="play-button"
            variant="contained"
            color="primary"
            title="Go"
          >
            <PlayArrowIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
