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
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Slide from '@material-ui/core/Slide';

import {
  checkoutStepInc,
  checkoutStepDec,
  checkoutStepReset
} from "../../store/reducers/checkoutStep";

import {
  checkoutItemReset
} from "../../store/reducers/checkoutItem";

import CheckoutItemTable from '../CheckoutItemTable';
import Payment from '../Payment';

const styles = theme => ({
  button: {
    marginRight: theme.spacing.unit,
  },
  instructions: {
    // marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
});

const checkoutSteps = [
  {
    abstract: '請檢查訂單內容',
    title: '檢查',
    content: (<CheckoutItemTable />),
  },
  {
    abstract: '請選擇付款方式',
    title: '付款',
    content: (<Payment />),
  },
  {
    abstract: '付款完成, 下單開始製作',
    title: '下單',
    content: '',
  },
];

const checkoutDone = {
  abstract: '完成',
  title: '完成',
  content: (<Typography variant="h5" gutterBottom>完成</Typography>),
};

function getCheckoutStepAbstract(step) {
  if (step < checkoutSteps.length) {
    return checkoutSteps[step].abstract;
  }
  else {
    return checkoutDone.abstract;
  }
}

function getCheckoutStepContent(step) {
  if (step < checkoutSteps.length) {
    return checkoutSteps[step].content;
  }
  else {
    return (checkoutDone.content);
  }
}

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

class CheckoutDlg extends React.Component {
  render() {
    const { classes, open, handleCheckoutDlgClose } = this.props;

    return (
      <Dialog
        fullWidth={true}
        // maxWidth={'lg'}
        TransitionComponent={dlgTransition}
        open={open}
        onClose={handleCheckoutDlgClose}>
        <DialogTitle>
          <Typography align='center' variant="h3" gutterBottom>
            {getCheckoutStepAbstract(this.props.checkoutStep.activeStep)}
          </Typography>
          <Stepper activeStep={this.props.checkoutStep.activeStep}>
            {checkoutSteps.map(step => {
              return (
                <Step key={step.title}>
                  <StepLabel>{step.title}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </DialogTitle>
        <DialogContent>
          {getCheckoutStepContent(this.props.checkoutStep.activeStep)}
        </DialogContent>
        <DialogActions>
          <div>
            {this.props.checkoutStep.activeStep === checkoutSteps.length ? (
              <div>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={() => closeCheckoutDlgAndResetStep(this.props, true)}>
                  完成
                </Button>
              </div>
            ) : (
                <div>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    disabled={this.props.checkoutStep.activeStep !== 1}
                    onClick={this.props.checkoutStepDec}>
                    上一步
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    disabled={this.props.checkoutItem.totalCount <= 0}
                    onClick={this.props.checkoutStepInc}>
                    下一步
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    disabled={this.props.checkoutStep.activeStep === 2}
                    onClick={() => closeCheckoutDlgAndResetStep(this.props, false)}>
                    取消
                  </Button>
                </div>
              )}
          </div>
        </DialogActions>
      </Dialog>
    );
  }
};

const mapStateToProps = state => {
  return {
    checkoutStep: state.checkoutStep,
    checkoutItem: state.checkoutItem,
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      checkoutStepInc: () => checkoutStepInc(),
      checkoutStepDec: () => checkoutStepDec(),
      checkoutStepReset: () => checkoutStepReset(),
      checkoutItemReset: () => checkoutItemReset(),
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(CheckoutDlg));
