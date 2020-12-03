import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import IdleTimer from "react-idle-timer";

import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";

import { TransitionSlideDown } from "../PageBase/PageBaseFunction";

const styles = (theme) => ({
  dlg: {
    backgroundColor: process.env.REACT_APP_LIGHT_YELLOW,
    padding: theme.spacing(2),
  },
});

class IdleAutoCloseDlg extends Component {
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
        <IdleTimer
          ref={(ref) => {
            this.idleTimer = ref;
          }}
          element={document}
          onIdle={closeAction}
          debounce={250}
          timeout={1000 * delay}
          startOnMount={false}
        />
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
)(withStyles(styles)(IdleAutoCloseDlg));
