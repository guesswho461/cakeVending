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
} from "../ItemListBase/ItemFunctions";

const styles = theme => ({
});

function getItemAction(key, cmp) {
  var rt;
  switch (key) {
    default:
      break;
    case companyInfo.topics.oven.status.alarm:
      rt = getTextAction(cmp.props.mqttTopics.ovenStatusAlarm);
      break;
    case companyInfo.topics.oven.cmd.tempature:
      rt = getTextBoxAction(cmp.handleOvenCmdTempatureChange);
      break;
    case companyInfo.topics.oven.cmd.flip:
      rt = getSwitchAction(
        cmp.handleSwitchChange,
        cmp.props.mqttTopics.ovenStatusFlip,
        key);
      break;
    case companyInfo.topics.oven.cmd.open:
      rt = getSwitchAction(
        cmp.handleSwitchChange,
        cmp.props.mqttTopics.ovenStatusOpen,
        key);
      break;
    case companyInfo.topics.oven.cmd.stop:
    case companyInfo.topics.oven.cmd.home.flip:
    case companyInfo.topics.oven.cmd.home.open:
      rt = getButtonAction(
        cmp.props.publishMsgToTopic,
        key,
        'true',
        <SendIcon />);
      break;
    case companyInfo.topics.oven.cmd.par.flip.gearRatio:
      rt = getTextBoxAction(cmp.handleOvenCmdParFlipGRChange);
      break;
    case companyInfo.topics.oven.cmd.par.open.gearRatio:
      rt = getTextBoxAction(cmp.handleOvenCmdParOpenGRChange);
      break;
  }
  return rt;
}

function getItemData(key, cmp) {
  var rt;
  switch (key) {
    default:
      break;
    case companyInfo.topics.oven.cmd.tempature:
      rt = cmp.props.mqttTopics.ovenStatusTempature;
      break;
    case companyInfo.topics.oven.cmd.stop:
      rt = cmp.props.mqttTopics.ovenStatusStop;
      break;
    case companyInfo.topics.oven.cmd.home.flip:
      rt = cmp.props.mqttTopics.ovenStatusHomeFlip;
      break;
    case companyInfo.topics.oven.cmd.home.open:
      rt = cmp.props.mqttTopics.ovenStatusHomeOpen;
      break;
    case companyInfo.topics.oven.cmd.par.flip.gearRatio:
      rt = cmp.props.mqttTopics.ovenStatusParFlipGearRatio;
      break;
    case companyInfo.topics.oven.cmd.par.open.gearRatio:
      rt = cmp.props.mqttTopics.ovenStatusParOpenGearRatio;
      break;
  }
  return rt;
}

const items = [
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.oven.status.alarm,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.oven.cmd.tempature,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.oven.cmd.flip,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.oven.cmd.open,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.oven.cmd.stop,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.oven.cmd.home.flip,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.oven.cmd.home.open,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.oven.cmd.par.flip.gearRatio,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.oven.cmd.par.open.gearRatio,
  },
];

class Oven extends React.Component {
  state = {
  };

  handleOvenCmdTempatureChange = (event) => {
    this.props.publishMsgToTopic(
      companyInfo.topics.oven.cmd.tempature,
      event.target.value);
  };

  handleOvenCmdParFlipGRChange = (event) => {
    this.props.publishMsgToTopic(
      companyInfo.topics.oven.cmd.par.flip.gearRatio,
      event.target.value);
  };

  handleOvenCmdParOpenGRChange = (event) => {
    this.props.publishMsgToTopic(
      companyInfo.topics.oven.cmd.par.open.gearRatio,
      event.target.value);
  };

  handleSwitchChange = (checked, topic) => {
    if (checked === false)
      this.props.publishMsgToTopic(topic, 'false');
    else
      this.props.publishMsgToTopic(topic, 'true');
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

const ovenTopicsSubscribeDispatch = function (topic, message, packet) {
  store.dispatch(handleSubscribeTopics(
    companyInfo.topics.oven.root,
    topic,
    message));
}

export default subscribe({
  topic: 'oven/status/#',
  dispatch: ovenTopicsSubscribeDispatch
})(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Oven)));
