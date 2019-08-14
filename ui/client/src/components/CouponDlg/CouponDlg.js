import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles } from "@material-ui/core/styles";
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import Typography from '@material-ui/core/Typography';

import QRReader from "react-qr-scanner";

import {
  login,
  logout,
  resetLoginOK
} from "../../store/reducers/authenticate";

const styles = theme => ({
  dlgContent: {
    margin: 'auto',
  },
});

function dlgTransition(props) {
  return <Slide direction="down" {...props} />;
}

const defaultScanResult = "請掃描優惠碼";

class CouponDlg extends React.Component {
  state = {
    delay: 100,
    scanResult: defaultScanResult,
  }

  handleScan = (data) => {
    if (data) {
      this.setState({
        scanResult: data
      })
      this.props.login(data);
    } else {
      this.setState({
        scanResult: defaultScanResult
      })
    }
  }

  handleError = (err) => {
    console.error(err)
  }

  render() {
    const { classes, open, handleCouponDlgClose } = this.props;

    const previewStyle = {
      width: 320,
      height: 240,
    }

    if (this.props.authenticate.loginOK) {
      handleCouponDlgClose();
      this.props.resetLoginOK();
      //TODO
      //pop a confirm dialog?
      //confirm login OK or something else?
    }

    return (
      <Dialog
        fullWidth={true}
        // maxWidth={'md'}
        TransitionComponent={dlgTransition}
        open={open}
        onClose={handleCouponDlgClose}>
        <DialogTitle>
          <Typography align='center' variant="h3" gutterBottom>
            {this.state.scanResult}
          </Typography>
        </DialogTitle>
        <DialogContent className={classes.dlgContent}>
          <QRReader
            delay={this.state.delay}
            style={previewStyle}
            onError={this.handleError}
            onScan={this.handleScan} />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={handleCouponDlgClose}>
            取消
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
};

const mapStateToProps = state => {
  return {
    authenticate: state.authenticate,
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      login: (data) => login(data),
      logout: () => logout(),
      resetLoginOK: () => resetLoginOK(),
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(CouponDlg));
