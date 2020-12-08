import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Countdown from "react-countdown";

import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";

import { TransitionSlideDown } from "../PageBase/PageBaseFunction";

const styles = (theme) => ({
  dlg: {
    backgroundColor: process.env.REACT_APP_LIGHT_YELLOW,
    padding: theme.spacing(2),
  },
});

class AutoCloseDlg extends Component {
  render() {
    const {
      classes,
      delay,
      openState,
      closeAction,
      enterSfx,
      closeSfx,
      children,
      dlgWidth,
    } = this.props;

    return (
      <div>
        <Dialog
          maxWidth={dlgWidth}
          TransitionComponent={TransitionSlideDown}
          open={openState}
          onEntering={() => {
            if (enterSfx) {
              enterSfx.play();
            }
          }}
          onExiting={() => {
            if (closeSfx) {
              closeSfx.play();
            }
          }}
          onClose={() => {
            if (closeAction) {
              closeAction();
            }
          }}
        >
          <Countdown
            date={Date.now() + delay * 1000}
            onComplete={closeAction}
            renderer={(props) => <div></div>}
          />
          <div className={classes.dlg}>{children}</div>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    pageStatus: state.pageStatus,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AutoCloseDlg));
