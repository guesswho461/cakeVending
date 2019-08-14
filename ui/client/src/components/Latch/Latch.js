import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles } from "@material-ui/core/styles";

import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import SendIcon from '@material-ui/icons/Send';

import { subscribe } from 'mqtt-react';
import store from '../../store';

import {
  handleSubscribeTopics,
  publishMsgToTopic,
} from "../../store/reducers/mqttTopics";

import ItemListBase from "../ItemListBase";
import companyInfo from '../../companyInfo';
import {
  getTextAction,
  getButtonAction,
  getTextBoxAction,
  getSwitchAction,
  getTextBoxAndButtonAction,
} from "../ItemListBase/ItemFunctions";

const styles = theme => ({
});

function getItemAction(key, cmp) {
  var rt;
  switch (key) {
    default:
      break;
    case companyInfo.topics.latch.status.alarm:
      rt = getTextAction(cmp.props.mqttTopics.latchStatusAlarm);
      break;
    case companyInfo.topics.latch.status.bagCnt:
      rt = getTextAction(cmp.props.mqttTopics.latchStatusBagCnt);
      break;
    case companyInfo.topics.latch.cmd.openDoor:
      rt = getSwitchAction(
        cmp.handleSwitchChange,
        cmp.props.mqttTopics.latchStatusOpenDoor,
        key);
      break;
    case companyInfo.topics.latch.cmd.vibration:
      rt = getSwitchAction(
        cmp.handleSwitchChange,
        cmp.props.mqttTopics.latchStatusVibration,
        key);
      break;
    case companyInfo.topics.latch.cmd.openGate:
      rt = getSwitchAction(
        cmp.handleSwitchChange,
        cmp.props.mqttTopics.latchStatusOpenGate,
        key);
      break;
    case companyInfo.topics.latch.cmd.openFan:
      rt = getSwitchAction(
        cmp.handleSwitchChange,
        cmp.props.mqttTopics.latchStatusOpenFan,
        key);
      break;
    case companyInfo.topics.latch.cmd.rArm.pos:
      rt = getTextBoxAndButtonAction(
        cmp.handleLatchCmdRArmPosChange,
        cmp.props.publishMsgToTopic,
        key,
        cmp.state.latchCmdRArmPos,
        <SendIcon />);
      break;
    case companyInfo.topics.latch.cmd.rArm.home:
      rt = getButtonAction(
        cmp.props.publishMsgToTopic,
        key,
        'true',
        <SendIcon />);
      break;
    case companyInfo.topics.latch.cmd.rArm.len:
      rt = getTextBoxAndButtonAction(
        cmp.handleLatchCmdRArmLenChange,
        cmp.props.publishMsgToTopic,
        key,
        cmp.state.latchCmdRArmLen,
        <SendIcon />);
      break;
    case companyInfo.topics.latch.cmd.rArm.suck:
      rt = getSwitchAction(
        cmp.handleSwitchChange,
        cmp.props.mqttTopics.latchStatusRArmSuck,
        key);
      break;
    case companyInfo.topics.latch.cmd.lArm.pos:
      rt = getTextBoxAndButtonAction(
        cmp.handleLatchCmdLArmPosChange,
        cmp.props.publishMsgToTopic,
        key,
        cmp.state.latchCmdLArmPos,
        <SendIcon />);
      break;
    case companyInfo.topics.latch.cmd.lArm.home:
      rt = getButtonAction(
        cmp.props.publishMsgToTopic,
        key,
        'true',
        <SendIcon />);
      break;
    case companyInfo.topics.latch.cmd.lArm.len:
      rt = getTextBoxAndButtonAction(
        cmp.handleLatchCmdLArmLenChange,
        cmp.props.publishMsgToTopic,
        key,
        cmp.state.latchCmdLArmLen,
        <SendIcon />);
      break;
    case companyInfo.topics.latch.cmd.lArm.suck:
      rt = getSwitchAction(
        cmp.handleSwitchChange,
        cmp.props.mqttTopics.latchStatusLArmSuck,
        key);
      break;
    case companyInfo.topics.latch.cmd.par.rArm.pitch:
      rt = getTextBoxAction(cmp.handleLatchCmdParRArmPitchChange);
      break;
    case companyInfo.topics.latch.cmd.par.lArm.pitch:
      rt = getTextBoxAction(cmp.handleLatchCmdParLArmPitchChange);
      break;
  }
  return rt;
}

function getItemData(key, cmp) {
  var rt;
  switch (key) {
    default:
      break;
    case companyInfo.topics.latch.cmd.rArm.pos:
      rt = cmp.props.mqttTopics.latchStatusRArmPos;
      break;
    case companyInfo.topics.latch.cmd.rArm.home:
      rt = cmp.props.mqttTopics.latchStatusRArmHome;
      break;
    case companyInfo.topics.latch.cmd.rArm.len:
      rt = cmp.props.mqttTopics.latchStatusRArmLen;
      break;
    case companyInfo.topics.latch.cmd.lArm.pos:
      rt = cmp.props.mqttTopics.latchStatusLArmPos;
      break;
    case companyInfo.topics.latch.cmd.lArm.home:
      rt = cmp.props.mqttTopics.latchStatusLArmHome;
      break;
    case companyInfo.topics.latch.cmd.lArm.len:
      rt = cmp.props.mqttTopics.latchStatusLArmLen;
      break;
    case companyInfo.topics.latch.cmd.par.rArm.pitch:
      rt = cmp.props.mqttTopics.latchStatusParRArmPitch;
      break;
    case companyInfo.topics.latch.cmd.par.lArm.pitch:
      rt = cmp.props.mqttTopics.latchStatusParLArmPitch;
      break;
  }
  return rt;
}

const items = [
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.latch.status.alarm,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.latch.status.bagCnt,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.latch.cmd.openDoor,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.latch.cmd.vibration,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.latch.cmd.openGate,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.latch.cmd.openFan,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'deg.',
    key: companyInfo.topics.latch.cmd.rArm.pos,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.latch.cmd.rArm.home,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'mm',
    key: companyInfo.topics.latch.cmd.rArm.len,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.latch.cmd.rArm.suck,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'deg.',
    key: companyInfo.topics.latch.cmd.lArm.pos,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.latch.cmd.lArm.home,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'mm',
    key: companyInfo.topics.latch.cmd.lArm.len,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.latch.cmd.lArm.suck,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'mm/rev.',
    key: companyInfo.topics.latch.cmd.par.rArm.pitch,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'mm/rev.',
    key: companyInfo.topics.latch.cmd.par.lArm.pitch,
  },
];

class Latch extends React.Component {
  state = {
    latchCmdRArmPos: 0,
    latchCmdRArmLen: 0,
    latchCmdLArmPos: 0,
    latchCmdLArmLen: 0,
  };

  handleSwitchChange = (checked, topic) => {
    if (checked === false)
      this.props.publishMsgToTopic(topic, 'false');
    else
      this.props.publishMsgToTopic(topic, 'true');
  };

  handleLatchCmdRArmPosChange = (event) => {
    this.setState({ latchCmdRArmPos: event.target.value });
  };

  handleLatchCmdRArmLenChange = (event) => {
    this.setState({ latchCmdRArmLen: event.target.value });
  };

  handleLatchCmdLArmPosChange = (event) => {
    this.setState({ latchCmdLArmPos: event.target.value });
  };

  handleLatchCmdLArmLenChange = (event) => {
    this.setState({ latchCmdLArmLen: event.target.value });
  };

  handleLatchCmdParRArmPitchChange = (event) => {
    this.props.publishMsgToTopic(
      companyInfo.topics.latch.cmd.par.rArm.pitch,
      event.target.value);
  };

  handleLatchCmdParLArmPitchChange = (event) => {
    this.props.publishMsgToTopic(
      companyInfo.topics.latch.cmd.par.lArm.pitch,
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
      publishMsgToTopic: (topic, msg) =>
        publishMsgToTopic(topic, msg),
    },
    dispatch
  );
};

const latchTopicsSubscribeDispatch = function (topic, message, packet) {
  store.dispatch(handleSubscribeTopics(
    companyInfo.topics.latch.root,
    topic,
    message));
}

export default subscribe({
  topic: 'latch/status/#',
  dispatch: latchTopicsSubscribeDispatch
})(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Latch)));
