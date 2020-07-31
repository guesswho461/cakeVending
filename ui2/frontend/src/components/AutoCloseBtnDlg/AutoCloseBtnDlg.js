import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";
import Countdown from "react-countdown";

import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import {
  TransitionSlideDown,
  FlashTouchAppIcon,
} from "../PageBase/PageBaseFunction";

const styles = (theme) => ({
  dlgPaper: {
    minWidth: "50vh",
    minHeight: "25vh",
    // paddingTop: "5vh",
    backgroundColor: process.env.REACT_APP_LIGHT_YELLOW,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  dlg: {
    // width: 320,
    // height: 100,
  },
});

class AutoCloseBtnDlg extends Component {
  closeAction = () => {
    if (this.props.closeSfx) {
      this.props.closeSfx.play();
    }
    if (this.props.closeAction) {
      this.props.closeAction();
    }
  };

  render() {
    const {
      classes,
      title,
      delay,
      openState,
      closeAction,
      enterSfx,
      closeSfx,
    } = this.props;

    return (
      <Dialog
        TransitionComponent={TransitionSlideDown}
        open={openState}
        onEntering={() => {
          if (enterSfx) {
            enterSfx.play();
          }
        }}
      >
        <div className={classes.dlg}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={this.closeAction}
          >
            <Typography variant="h3">
              <Box display="flex" justifyContent="center" alignItems="center">
                <Translate value={title} />
                ...
                <Countdown
                  date={Date.now() + delay * 1000}
                  renderer={(props) => <div>{props.seconds}</div>}
                  onComplete={this.closeAction}
                />
                <FlashTouchAppIcon
                  style={{ fontSize: 64, transform: "rotate(-45deg)" }}
                />
              </Box>
            </Typography>
          </Button>
        </div>
      </Dialog>
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
)(withStyles(styles)(AutoCloseBtnDlg));
