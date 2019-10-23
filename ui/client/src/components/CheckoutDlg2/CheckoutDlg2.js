import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles } from "@material-ui/core/styles";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from "@material-ui/core/Button";
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';

import {
  checkoutStepReset
} from "../../store/reducers/checkoutStep";

import {
  checkoutItemReset
} from "../../store/reducers/checkoutItem";

import CheckoutItemTable2 from '../CheckoutItemTable2';

const styles = theme => ({
  button: {
    marginRight: theme.spacing.unit,
  },
  instructions: {
    // marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
});

function closeCheckoutDlgAndResetStep(props, resetItem) {
  props.handleCheckoutDlgClose();
  props.checkoutStepReset();
  if (resetItem === true) {
    props.checkoutItemReset();
  }
}

function dlgTransition(props) {
  return <Slide direction="down" {...props} />;
}

class CheckoutDlg2 extends React.Component {
  render() {
    const { classes, open, handleCheckoutDlgClose } = this.props;

    return (
      <Dialog
        fullWidth={true}
        maxWidth={'lg'}
        TransitionComponent={dlgTransition}
        open={open}
        onClose={handleCheckoutDlgClose}>
        <DialogTitle>
          <Typography align='center' variant="h3" gutterBottom>
            請檢查訂單內容
          </Typography>
        </DialogTitle>
        <DialogContent>
          <CheckoutItemTable2 />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="secondary"
            className={classes.button}
            disabled={this.props.checkoutItem.totalCount <= 0}
            onClick={() => closeCheckoutDlgAndResetStep(this.props, true)}>
            清除訂單
          </Button>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            disabled={
              this.props.checkoutItem.totalCount <= 0 ||
              this.props.mqttTopics.coinValue < this.props.checkoutItem.totalPrice
            }
            onClick={() => closeCheckoutDlgAndResetStep(this.props, true)}>
            下單
          </Button>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => closeCheckoutDlgAndResetStep(this.props, false)}>
            返回
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
};

const mapStateToProps = state => {
  return {
    checkoutItem: state.checkoutItem,
    mqttTopics: state.mqttTopics
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      checkoutStepReset: () => checkoutStepReset(),
      checkoutItemReset: () => checkoutItemReset(),
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(CheckoutDlg2));
