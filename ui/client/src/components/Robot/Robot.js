import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles } from "@material-ui/core/styles";
import Button from '@material-ui/core/Button';

import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import SendIcon from '@material-ui/icons/Send';

import { subscribe } from 'mqtt-react';
import store from '../../store';

import {
  handleSubscribeTopics,
  robotCmdJog,
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

const KEY_ROBOT_CMD_JOG_STEP_VEL = 'robotCmdJogStepVel';
const KEY_ROBOT_CMD_JOG_STEP_LEN = 'robotCmdJogStepLen';

const styles = theme => ({
  slider: {
    width: 300,
    padding: '22px 0px',
  },
});

function getRobotCmdJogAction(cmp, cmd) {
  return <div>
    vel: {cmp.props.mqttTopics.robotStatusJogVel}
    <Button variant="outlined" color="primary"
      onClick={() => cmp.props.robotCmdJog(cmd,
        (-cmp.state.robotCmdJogStepLen),
        cmp.state.robotCmdJogStepVel)}>
      <RemoveIcon />
    </Button>
    <Button variant="outlined" color="primary"
      onClick={() => cmp.props.robotCmdJog(cmd,
        cmp.state.robotCmdJogStepLen,
        cmp.state.robotCmdJogStepVel)}>
      <AddIcon />
    </Button>
  </div>
}

function getItemAction(key, cmp) {
  var rt;
  switch (key) {
    default:
      break;
    case KEY_ROBOT_CMD_JOG_STEP_VEL:
      rt = getSliderAction(
        cmp.props.classes.slider,
        cmp.state.robotCmdJogStepVel,
        cmp.handleRobotCmdJogStepVelChange, 1000, 1, 1);
      break;
    case KEY_ROBOT_CMD_JOG_STEP_LEN:
      rt = getSliderAction(
        cmp.props.classes.slider,
        cmp.state.robotCmdJogStepLen,
        cmp.handleRobotCmdJogStepLenChange, 100, 1, 1);
      break;
    case companyInfo.topics.robot.cmd.jog.x:
      rt = getRobotCmdJogAction(cmp, 'x');
      break;
    case companyInfo.topics.robot.cmd.jog.y:
      rt = getRobotCmdJogAction(cmp, 'y');
      break;
    case companyInfo.topics.robot.cmd.jog.z:
      rt = getRobotCmdJogAction(cmp, 'z');
      break;
    case companyInfo.topics.robot.status.vol:
      rt = getTextAction(cmp.props.mqttTopics.robotStatusVol);
      break;
    case companyInfo.topics.robot.status.alarm:
      rt = getTextAction(cmp.props.mqttTopics.robotStatusAlarm);
      break;
    case companyInfo.topics.robot.status.mode:
      rt = getTextAction(cmp.props.mqttTopics.robotStatusMode);
      break;
    case companyInfo.topics.robot.cmd.jog.fork:
      rt = getRobotCmdJogAction(cmp, 'fork');
      break;
    case companyInfo.topics.robot.cmd.stop:
    case companyInfo.topics.robot.cmd.home.x:
    case companyInfo.topics.robot.cmd.home.y:
    case companyInfo.topics.robot.cmd.home.z:
    case companyInfo.topics.robot.cmd.home.fork:
      rt = getButtonAction(
        cmp.props.publishMsgToTopic,
        key,
        'true',
        <SendIcon />);
      break;
    case companyInfo.topics.robot.cmd.par.x.stepPerMM:
      rt = getTextBoxAction(cmp.handleRobotCmdParXStepPerMMChange);
      break;
    case companyInfo.topics.robot.cmd.par.y.stepPerMM:
      rt = getTextBoxAction(cmp.handleRobotCmdParYStepPerMMChange);
      break;
    case companyInfo.topics.robot.cmd.par.z.stepPerMM:
      rt = getTextBoxAction(cmp.handleRobotCmdParZStepPerMMChange);
      break;
  }
  return rt;
}

function getItemData(key, cmp) {
  var rt;
  switch (key) {
    default:
      break;
    case KEY_ROBOT_CMD_JOG_STEP_VEL:
      rt = cmp.state.robotCmdJogStepVel;
      break;
    case KEY_ROBOT_CMD_JOG_STEP_LEN:
      rt = cmp.state.robotCmdJogStepLen;
      break;
    case companyInfo.topics.robot.cmd.home.x:
      rt = cmp.props.mqttTopics.robotStatusHomeX;
      break;
    case companyInfo.topics.robot.cmd.home.y:
      rt = cmp.props.mqttTopics.robotStatusHomeY;
      break;
    case companyInfo.topics.robot.cmd.home.z:
      rt = cmp.props.mqttTopics.robotStatusHomeZ;
      break;
    case companyInfo.topics.robot.cmd.home.fork:
      rt = cmp.props.mqttTopics.robotStatusHomeFork;
      break;
    case companyInfo.topics.robot.cmd.jog.x:
      rt = cmp.props.mqttTopics.robotStatusJogX;
      break;
    case companyInfo.topics.robot.cmd.jog.y:
      rt = cmp.props.mqttTopics.robotStatusJogY;
      break;
    case companyInfo.topics.robot.cmd.jog.z:
      rt = cmp.props.mqttTopics.robotStatusJogZ;
      break;
    case companyInfo.topics.robot.cmd.jog.fork:
      rt = cmp.props.mqttTopics.robotStatusJogFork;
      break;
    case companyInfo.topics.robot.cmd.stop:
      rt = cmp.props.mqttTopics.robotStatusStop;
      break;
    case companyInfo.topics.robot.cmd.par.x.stepPerMM:
      rt = cmp.props.mqttTopics.robotStatusParXStepPerMM;
      break;
    case companyInfo.topics.robot.cmd.par.y.stepPerMM:
      rt = cmp.props.mqttTopics.robotStatusParYStepPerMM;
      break;
    case companyInfo.topics.robot.cmd.par.z.stepPerMM:
      rt = cmp.props.mqttTopics.robotStatusParZStepPerMM;
      break;
  }
  return rt;
}

const items = [
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.robot.status.mode,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.robot.status.alarm,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'ml',
    key: companyInfo.topics.robot.status.vol,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'mm/s',
    key: KEY_ROBOT_CMD_JOG_STEP_VEL,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'mm',
    key: KEY_ROBOT_CMD_JOG_STEP_LEN,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.robot.cmd.stop,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'mm',
    key: companyInfo.topics.robot.cmd.jog.x,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'mm',
    key: companyInfo.topics.robot.cmd.jog.y,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'mm',
    key: companyInfo.topics.robot.cmd.jog.z,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'mm',
    key: companyInfo.topics.robot.cmd.jog.fork,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.robot.cmd.home.x,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.robot.cmd.home.y,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.robot.cmd.home.z,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: companyInfo.topics.robot.cmd.home.fork,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'step/mm',
    key: companyInfo.topics.robot.cmd.par.x.stepPerMM,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'step/mm',
    key: companyInfo.topics.robot.cmd.par.y.stepPerMM,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: 'step/mm',
    key: companyInfo.topics.robot.cmd.par.z.stepPerMM,
  },
];

class Robot extends React.Component {
  state = {
    robotCmdJogStepLen: 50,
    robotCmdJogStepVel: 50,
  };

  handleRobotCmdJogStepLenChange = (event, value) => {
    this.setState({ robotCmdJogStepLen: value });
  };

  handleRobotCmdJogStepVelChange = (event, value) => {
    this.setState({ robotCmdJogStepVel: value });
  };

  handleRobotCmdParXStepPerMMChange = (event) => {
    this.props.publishMsgToTopic(
      companyInfo.topics.robot.cmd.par.x.stepPerMM,
      event.target.value);
  };

  handleRobotCmdParYStepPerMMChange = (event) => {
    this.props.publishMsgToTopic(
      companyInfo.topics.robot.cmd.par.y.stepPerMM,
      event.target.value);
  };

  handleRobotCmdParZStepPerMMChange = (event) => {
    this.props.publishMsgToTopic(
      companyInfo.topics.robot.cmd.par.z.stepPerMM,
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
      robotCmdJog: (dir, len, vel) =>
        robotCmdJog(dir, len, vel),
      publishMsgToTopic: (topic, msg) =>
        publishMsgToTopic(topic, msg),
    },
    dispatch
  );
};

const robotTopicsSubscribeDispatch = function (topic, message, packet) {
  store.dispatch(handleSubscribeTopics(
    companyInfo.topics.robot.root,
    topic,
    message));
}

export default subscribe({
  topic: 'robot/status/#',
  dispatch: robotTopicsSubscribeDispatch
})(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Robot)));
