import React from "react";
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/lab/Slider';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Switch from "@material-ui/core/Switch";

export function getTextAction(data) {
  return <div>
    <Typography variant="h5" gutterBottom>
      {data}
    </Typography>
  </div>
}

export function getSliderAction(style, data, changeFn, max, min, step) {
  return <Slider
    classes={{ container: style }}
    value={data}
    onChange={changeFn}
    max={max}
    min={min}
    step={step}
  />;
}

export function getTextBoxAction(changeFn) {
  return <div>
    <TextField
      onChange={changeFn}
    />
  </div>
}

export function getButtonAction(onClickFn, arg1, arg2, icon) {
  return <div>
    <Button variant="outlined" color="primary"
      onClick={() => onClickFn(arg1, arg2)}>
      {icon}
    </Button>
  </div>
}

export function getSwitchAction(onChangeFn, checkVar, topic) {
  return <div>
    <Switch
      onChange={(e, checked) => onChangeFn(checked, topic)}
      checked={checkVar}
    />
  </div>
}

export function getTextBoxAndButtonAction(changeFn, onClickFn, arg1, arg2, icon) {
  return <div>
    <TextField
      onChange={changeFn}
    />
    <Button variant="outlined" color="primary"
      onClick={() => onClickFn(arg1, arg2)}>
      {icon}
    </Button>
  </div>
}
