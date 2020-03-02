import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";
import CountDown from "react-number-count-down";

import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";

import { DlgTransitionDown } from "../PageBase/PageBaseFunction";

const styles = theme => ({});

class AutoCloseDlg extends Component {
  render() {
    const { classes, title, delay, openState, closeAction } = this.props;

    return (
      <Dialog
        // fullWidth={true}
        maxWidth={"lg"}
        TransitionComponent={DlgTransitionDown}
        open={openState}
        onClose={closeAction}
      >
        <DialogTitle>
          <Typography variant="h2" align="center">
            <Translate value={title} />
          </Typography>
        </DialogTitle>
        {delay > 0 ? (
          <CountDown
            from={delay}
            to={0}
            type={"-"}
            interval={1}
            onComplete={closeAction}
          />
        ) : (
          <div></div>
        )}
      </Dialog>
    );
  }
}

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({}, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AutoCloseDlg));
