import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";

import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";

import { TransitionSlideDown } from "../PageBase/PageBaseFunction";

const styles = (theme) => ({
  dlgPaper: {
    minWidth: "50vh",
    minHeight: "25vh",
    paddingTop: "5vh",
    backgroundColor: process.env.REACT_APP_LIGHT_YELLOW,
  },
  dlg: {
    width: 480,
    height: 100,
  },
});

class AutoCloseDlg extends Component {
  render() {
    const { classes, title, delay, openState, closeAction } = this.props;

    if (delay > 0) {
      setTimeout(closeAction, delay * 1000);
    }

    return (
      <Dialog
        // fullWidth={true}
        // maxWidth={"lg"}
        classes={{ paper: classes.dlgPaper }}
        TransitionComponent={TransitionSlideDown}
        open={openState}
        onClose={closeAction}
      >
        <div className={classes.dlg}>
          <DialogTitle>
            <Typography variant="h1" align="center">
              <Translate value={title} />
            </Typography>
          </DialogTitle>
        </div>
      </Dialog>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AutoCloseDlg));
