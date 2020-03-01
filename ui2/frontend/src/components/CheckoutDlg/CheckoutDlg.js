import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";

import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Slide from "@material-ui/core/Slide";
import Grid from "@material-ui/core/Grid";

import {
  setCheckoutDlgClose,
  coinValueDec
} from "../../store/reducers/pageStatus";
import demoCake from "../../imgs/demoCake.jpg";

const styles = theme => ({
  image: {
    height: 240
  }
});

// const dlgTransition = props => {
//   return <Slide direction="down" {...props} />;
// };

class CheckoutDlg extends Component {
  render() {
    const { classes, item, confirmAction } = this.props;

    return (
      <Dialog
        // fullWidth={true}
        // maxWidth={"lg"}
        // TransitionComponent={dlgTransition}
        open={this.props.pageStatus.checkoutDlgOpen}
        onClose={this.props.setCheckoutDlgClose}
      >
        <DialogTitle>
          <Typography align="center" variant="h3">
            <Translate value="plsInsertCoin" />
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} align="center">
              <img src={item.img} alt={demoCake} className={classes.image} />
            </Grid>
            <Grid item xs={12} sm container>
              <Grid item xs container direction="column" spacing={2}>
                <Grid item xs>
                  <Typography variant="h3">
                    <Translate value={item.title} />
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h6">
                    <Translate value={item.content} />
                  </Typography>
                </Grid>
              </Grid>
              <Grid item>
                <Typography variant="h4">
                  <Translate value={item.priceStr} />
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            // variant="contained"
            color="primary"
            size="large"
            onClick={this.props.setCheckoutDlgClose}
          >
            <Typography variant="h5">
              <Translate value="cancel" />
            </Typography>
          </Button>
          <Button
            // variant="contained"
            color="primary"
            size="large"
            disabled={this.props.pageStatus.coinValue < item.priceNum}
            onClick={() => {
              this.props.setCheckoutDlgClose();
              confirmAction();
              this.props.coinValueDec(item.priceNum);
            }}
          >
            <Typography variant="h5">
              <Translate value="confirm" />
            </Typography>
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const mapStateToProps = state => {
  return {
    pageStatus: state.pageStatus
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      setCheckoutDlgClose: () => setCheckoutDlgClose(),
      coinValueDec: data => coinValueDec(data)
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(CheckoutDlg));
