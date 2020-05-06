import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { subscribe } from "mqtt-react";
import IdleTimer from "react-idle-timer";

import { withStyles } from "@material-ui/core/styles";
import Slide from "@material-ui/core/Slide";

import MainPage from "../MainPage";
import ADPage from "../ADPage";
import AutoCloseDlg from "../AutoCloseDlg";
import {
  setHeadtingUpWarningDlgClose,
  handleMQTTSubscribeTopics,
  setADPageTitle,
  setPageSelected,
  setCheckoutDlgClose,
  getVideoPlayList,
} from "../../store/reducers/pageStatus";
import store from "../../store";

const IDLE_TIME = 30; //sec.

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
});

class RootPage extends Component {
  constructor(props) {
    super(props);
    this.props.getVideoPlayList();
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
          timeout={1000 * IDLE_TIME}
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
        <AutoCloseDlg
          title="heatingText"
          delay={10} //sec.
          openState={this.props.pageStatus.heatingUpWarningDlgOpen}
          closeAction={this.props.setHeadtingUpWarningDlgClose}
        />
        <AutoCloseDlg
          title="cakeTakeText"
          delay={0}
          openState={this.props.pageStatus.takeCakeWarningDlgOpen}
        />
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
