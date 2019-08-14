import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles } from "@material-ui/core/styles";
import Button from '@material-ui/core/Button';

import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import SendIcon from '@material-ui/icons/Send';
import StopIcon from '@material-ui/icons/Stop';

import { subscribe } from 'mqtt-react';
import store from '../../store';

import {
  handleSubscribeTopics,
  bucketCmdJogVol,
  publishMsgToTopic,
} from "../../store/reducers/mqttTopics";

import ItemListBase from "../ItemListBase";
import companyInfo from '../../companyInfo';
import {
  getTextAction,
  getSliderAction,
  getTextBoxAction,
  getButtonAction,
} from "../ItemListBase/ItemFunctions";

const KEY_BUCKET_CMD_JOG_VOL = 'bucketCmdJogVol';
const KEY_BUCKET_CMD_JOG_VEL = 'bucketCmdJogVel';

const styles = theme => ({
  slider: {
    width: 300,
    padding: '22px 0px',
  },
});

function getBucketCmdJogVolAction(cmp) {
  return <div>
    vel: {cmp.props.mqttTopics.bucketStatusJogVel}
    <Button variant="outlined" color="primary"
      onClick={() => cmp.props.bucketCmdJogVol(
        cmp.state.bucketCmdJogVol,
        cmp.state.bucketCmdJogVel)}>
      <SendIcon />
    </Button>
  </div>
}

function getItemAction(key, cmp) {
  var rt;
  switch (key) {
    default:
      break;
    case KEY_BUCKET_CMD_JOG_VOL:
      rt = getSliderAction(
        cmp.props.classes.slider,
        cmp.state.bucketCmdJogVol,
        cmp.handleBucketCmdJogVolChange, 100, 1, 1);
      break;
    case KEY_BUCKET_CMD_JOG_VEL:
      rt = getSliderAction(
        cmp.props.classes.slider,
        cmp.state.bucketCmdJogVel,
        cmp.handleBucketCmdJogVelChange, 100, 1, 1);
      break;
    case companyInfo.topics.bucket.cmd.jog.vol:
      rt = getBucketCmdJogVolAction(cmp);
      break;
    case companyInfo.topics.bucket.status.vol:
      rt = getTextAction(cmp.props.mqttTopics.bucketStatusVol);
      break;
    case companyInfo.topics.bucket.status.alarm:
      rt = getTextAction(cmp.props.mqttTopics.bucketStatusAlarm);
      break;
    case companyInfo.topics.bucket.status.mode:
      rt = getTextAction(cmp.props.mqttTopics.bucketStatusMode);
      break;
    case companyInfo.topics.bucket.cmd.stop:
      rt = getButtonAction(
        cmp.props.publishMsgToTopic,
        companyInfo.topics.bucket.cmd.stop,
        'true',
        <StopIcon />);
      break;
    case companyInfo.topics.bucket.cmd.par.jog.calibration:
      rt = getTextBoxAction(cmp.handleBucketCmdParJogCalibrationChange);
      break;
    case companyInfo.topics.bucket.cmd.par.jog.microStepPerStep:
      rt = getTextBoxAction(cmp.handleBucketCmdParJogMicroStepPerStepChange);
      break;
    case companyInfo.topics.bucket.cmd.par.vol.calibrationA:
      rt = getTextBoxAction(cmp.handleBucketCmdParVolCalibrationAChange);
      break;
    case companyInfo.topics.bucket.cmd.par.vol.calibrationB:
      rt = getTextBoxAction(cmp.handleBucketCmdParVolCalibrationBChange);
      break;
  }
  return rt;
}

function getItemData(key, cmp) {
  var rt;
  switch (key) {
    default:
      break;
    case KEY_BUCKET_CMD_JOG_VEL:
      rt = cmp.state.bucketCmdJogVel;
      break;
    case KEY_BUCKET_CMD_JOG_VOL:
      rt = cmp.state.bucketCmdJogVol;
      break;
    case companyInfo.topics.bucket.cmd.jog.vol:
      rt = cmp.props.mqttTopics.bucketStatusJogVol;
      break;
    case companyInfo.topics.bucket.cmd.stop:
      rt = cmp.props.mqttTopics.bucketStatusStop;
      break;
    case companyInfo.topics.bucket.cmd.par.jog.calibration:
      rt = cmp.props.mqttTopics.bucketStatusParJogCalibration;
      break;
    case companyInfo.topics.bucket.cmd.par.jog.microStepPerStep:
      rt = cmp.props.mqttTopics.bucketStatusParJogMicroStepPerStep;
      break;
    case companyInfo.topics.bucket.cmd.par.vol.calibrationA:
      rt = cmp.props.mqttTopics.bucketStatusParVolCalibrationA;
      break;
    case companyInfo.topics.bucket.cmd.par.vol.calibrationB:
      rt = cmp.props.mqttTopics.bucketStatusParVolCalibrationB;
      break;
  }
  return rt;
}

const items = [
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.bucket.status.alarm,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'cm',
    key: companyInfo.topics.bucket.status.vol,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.bucket.status.mode,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'ml/s',
    key: KEY_BUCKET_CMD_JOG_VEL,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'ml',
    key: KEY_BUCKET_CMD_JOG_VOL,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.bucket.cmd.stop,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'ml',
    key: companyInfo.topics.bucket.cmd.jog.vol,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.bucket.cmd.par.jog.calibration,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.bucket.cmd.par.jog.microStepPerStep,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.bucket.cmd.par.vol.calibrationA,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.bucket.cmd.par.vol.calibrationB,
  },
];

class Bucket extends React.Component {
  state = {
    bucketCmdJogVol: 50,
    bucketCmdJogVel: 50,
  };

  handleBucketCmdJogVelChange = (event, value) => {
    this.setState({ bucketCmdJogVel: value });
  };

  handleBucketCmdJogVolChange = (event, value) => {
    this.setState({ bucketCmdJogVol: value });
  };

  handleBucketCmdParJogCalibrationChange = (event) => {
    this.props.publishMsgToTopic(
      companyInfo.topics.bucket.cmd.par.jog.calibration,
      event.target.value);
  };

  handleBucketCmdParJogMicroStepPerStepChange = (event) => {
    this.props.publishMsgToTopic(
      companyInfo.topics.bucket.cmd.par.jog.microStepPerStep,
      event.target.value);
  };

  handleBucketCmdParVolCalibrationAChange = (event) => {
    this.props.publishMsgToTopic(
      companyInfo.topics.bucket.cmd.par.vol.calibrationA,
      event.target.value);
  };

  handleBucketCmdParVolCalibrationBChange = (event) => {
    this.props.publishMsgToTopic(
      companyInfo.topics.bucket.cmd.par.vol.calibrationB,
      event.target.value);
  };

  render() {
    return (
      <ItemListBase
        items={items}
        getItemData={getItemData}
        getItemAction={getItemAction}
        childCmp={this} />
    );
  }
};

const mapStateToProps = state => {
  return {
    mqttTopics: state.mqttTopics,
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      handleSubscribeTopics: (root, topic, msg) =>
        handleSubscribeTopics(root, topic, msg),
      bucketCmdJogVol: (vol, vel) =>
        bucketCmdJogVol(vol, vel),
      publishMsgToTopic: (topic, msg) =>
        publishMsgToTopic(topic, msg),
    },
    dispatch
  );
};

const bucketTopicsSubscribeDispatch = function (topic, message, packet) {
  store.dispatch(handleSubscribeTopics(
    companyInfo.topics.bucket.root,
    topic,
    message));
}

export default subscribe({
  topic: 'bucket/status/#',
  dispatch: bucketTopicsSubscribeDispatch
})(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Bucket)));
