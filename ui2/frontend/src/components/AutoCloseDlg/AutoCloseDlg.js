import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";

import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";

import { TransitionSlideDown } from "../PageBase/PageBaseFunction";

const styles = theme => ({});

class AutoCloseDlg extends Component {
  render() {
    const { classes, title, delay, openState, closeAction } = this.props;

    if (delay > 0) {
      setTimeout(closeAction, delay * 1000);
    }

    return (
      <Dialog
        // fullWidth={true}
        maxWidth={"lg"}
        TransitionComponent={TransitionSlideDown}
        open={openState}
        onClose={closeAction}
      >
        <DialogTitle>
          <Typography variant="h2" align="center">
            <Translate value={title} />
          </Typography>
        </DialogTitle>
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
