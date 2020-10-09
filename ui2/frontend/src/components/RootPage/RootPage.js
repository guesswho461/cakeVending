import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { subscribe } from "mqtt-react";
import IdleTimer from "react-idle-timer";

import { withStyles } from "@material-ui/core/styles";
import Slide from "@material-ui/core/Slide";

import MainPage from "../MainPage";
import ADPage from "../ADPage";
import MsgBox from "../MsgBox";
import MaintainPage from "../MaintainPage";

import {
  setHeadtingUpWarningDlgClose,
  handleMQTTSubscribeTopics,
  setADPageTitle,
  setPageSelected,
  setCheckoutDlgClose,
  getVideoPlayList,
  getDevMode,
  isAllOpModesAreCorrect,
} from "../../store/reducers/pageStatus";
import store from "../../store";

import UIfx from "uifx";
import ding from "../../sounds/ding.wav";
const dingSfx = new UIfx(ding);

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
});

class RootPage extends Component {
  constructor(props) {
    super(props);
    this.props.getVideoPlayList();
    this.props.getDevMode();
    this.props.isAllOpModesAreCorrect();
    this.idleTimer = null;
    this.onIdle = this.onIdle.bind(this);
  }

  onIdle(e) {
    if (this.props.pageStatus.selectedPage === "main") {
      if (this.props.pageStatus.checkoutDlgOpen) {
        if (this.props.pageStatus.coinValue <= 0) {
          this.props.setCheckoutDlgClose();
        }
      } else {
        this.props.setPageSelected("ad");
      }
    }
    this.idleTimer.reset();
  }

  state = {};

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <IdleTimer
          ref={(ref) => {
            this.idleTimer = ref;
          }}
          element={document}
          onIdle={this.onIdle}
          debounce={250}
          timeout={1000 * process.env.REACT_APP_IDLE_TIME}
        />
        <Slide
          direction="right"
          in={this.props.pageStatus.selectedPage === "main"}
          mountOnEnter
          unmountOnExit
        >
          <div>
            <MainPage />
          </div>
        </Slide>
        <Slide
          direction="down"
          in={this.props.pageStatus.selectedPage === "ad"}
          mountOnEnter
          unmountOnExit
        >
          <div>
            <ADPage />
          </div>
        </Slide>
        <MsgBox
          title="heatingText"
          openState={this.props.pageStatus.heatingUpWarningDlgOpen}
          sfx={dingSfx}
        />
        <MsgBox
          title="cakeTakeText"
          openState={this.props.pageStatus.takeCakeWarningDlgOpen}
          sfx={dingSfx}
        />
        <Slide
          direction="down"
          in={this.props.pageStatus.selectedPage === "maintain"}
          mountOnEnter
          unmountOnExit
        >
          <div>
            <MaintainPage />
          </div>
        </Slide>
      </div>
    );
  }
}

const mqttTopicsSubscribeDispatch = function (topic, message, packet) {
  store.dispatch(handleMQTTSubscribeTopics(topic, message));
};

const mapStateToProps = (state) => {
  return {
    pageStatus: state.pageStatus,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      setHeadtingUpWarningDlgClose: () => setHeadtingUpWarningDlgClose(),
      setADPageTitle: (data) => setADPageTitle(data),
      setPageSelected: (data) => setPageSelected(data),
      setCheckoutDlgClose: () => setCheckoutDlgClose(),
      getVideoPlayList: () => getVideoPlayList(),
      getDevMode: () => getDevMode(),
      isAllOpModesAreCorrect: () => isAllOpModesAreCorrect(),
    },
    dispatch
  );
};

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(withStyles(styles)(RootPage));

export default subscribe({
  topic: "#",
  dispatch: mqttTopicsSubscribeDispatch,
})(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(RootPage)));
