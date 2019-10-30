import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Slide from "@material-ui/core/Slide";

import { setCheckoutDlgClose } from "../../store/reducers/checkout";
import {
  handleSubscribeTopics,
  coinValueDec,
  setProcessingDlgOpen
} from "../../store/reducers/mqttTopics";
import { setOriginalRecipeStart } from "../../store/reducers/recipe";

import { subscribe } from "mqtt-react";
import store from "../../store";
import productList from "../../productList";
import companyInfo from "../../companyInfo";
import CountDown from "react-number-count-down";

const styles = theme => ({
  button: {
    marginRight: theme.spacing.unit
  },
  instructions: {
    // marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit
  }
});

function dlgTransition(props) {
  return <Slide direction="down" {...props} />;
}

class CheckoutDlg3 extends React.Component {
  startTheRecipe = () => {
    this.props.coinValueDec(productList[0].unitPrice);
    this.props.setCheckoutDlgClose();
    this.props.setOriginalRecipeStart();
    this.props.setProcessingDlgOpen();
  };

  render() {
    const { classes } = this.props;

    return (
      <Dialog
        fullWidth={true}
        maxWidth={"lg"}
        TransitionComponent={dlgTransition}
        open={this.props.checkout.checkoutDlgOpen}
        onClose={this.props.setCheckoutDlgClose}
      >
        <DialogTitle>
          <Typography align="center" variant="h3" gutterBottom>
            請開始投幣
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography align="center" variant="h4" gutterBottom>
            已付{companyInfo.currency}${this.props.mqttTopics.coinValue}, 總共
            {companyInfo.currency}${productList[0].unitPrice}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            size="large"
            className={classes.button}
            disabled={
              this.props.mqttTopics.coinValue < productList[0].unitPrice
            }
            onClick={this.startTheRecipe}
          >
            請按此按鈕立即開始製作或倒數
            {this.props.mqttTopics.coinValue < productList[0].unitPrice ? (
              "10秒後開始製作"
            ) : (
              <div>
                <CountDown
                  from={10}
                  to={0}
                  type={"-"}
                  addon={"秒後開始製作"}
                  interval={1}
                  onComplete={this.startTheRecipe}
                />
              </div>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const mapStateToProps = state => {
  return {
    checkoutItem: state.checkoutItem,
    mqttTopics: state.mqttTopics,
    checkout: state.checkout
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      setCheckoutDlgClose: () => setCheckoutDlgClose(),
      coinValueDec: data => coinValueDec(data),
      setOriginalRecipeStart: () => setOriginalRecipeStart(),
      setProcessingDlgOpen: () => setProcessingDlgOpen()
    },
    dispatch
  );
};

const bucketTopicsSubscribeDispatch = function(topic, message, packet) {
  store.dispatch(handleSubscribeTopics("coin", topic, message));
};

export default subscribe({
  topic: "coin/inc",
  dispatch: bucketTopicsSubscribeDispatch
})(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(CheckoutDlg3))
);
