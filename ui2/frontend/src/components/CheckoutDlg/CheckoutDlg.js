import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Countdown from "react-countdown";

import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import { setCheckoutDlgClose } from "../../store/reducers/pageStatus";
import demoCake from "../../imgs/demoCake.jpg";
import { TransitionGrow } from "../PageBase/PageBaseFunction";

const styles = (theme) => ({
  image: {
    height: 200,
  },
  dlg: {
    backgroundColor: process.env.REACT_APP_LIGHT_YELLOW,
  },
});

class CheckoutDlg extends Component {
  constructor(props) {
    super(props);
  }

  startTheRecipe = () => {
    this.props.setCheckoutDlgClose();
    this.props.confirmAction();
  };

  render() {
    const { classes, item, confirmAction } = this.props;

    return (
      <Dialog
        // fullWidth={true}
        // maxWidth={"lg"}
        TransitionComponent={TransitionGrow}
        open={this.props.pageStatus.checkoutDlgOpen}
        onClose={() => {
          if (this.props.pageStatus.coinValue <= 0) {
            this.props.setCheckoutDlgClose();
          }
        }}
      >
        <div className={classes.dlg}>
          <DialogTitle>
            <Typography variant="h3" align="center">
              {this.props.pageStatus.coinValue < item.priceNum ? (
                <Translate value="plsInsertCoin" />
              ) : (
                <Translate value="plsPressSart" />
              )}
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            <Grid
              container
              spacing={2}
              direction="row"
              justify="space-between"
              alignItems="flex-start"
            >
              <Grid item xs={12} align="center">
                <img src={item.img} alt={demoCake} className={classes.image} />
              </Grid>
              <Grid item xs={10}>
                <Typography variant="h4">
                  <Translate value={item.title} />
                </Typography>
              </Grid>
              <Grid item xs>
                <Typography variant="h5">
                  <Translate value={item.priceStr} />
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography variant="h6">
                  <Translate value={item.content} />
                </Typography>
              </Grid>
              <Grid item xs>
                <CircularProgressbar
                  value={this.props.pageStatus.coinValue}
                  maxValue={process.env.REACT_APP_PIECE_PER_PRICE}
                  text={"$" + `${this.props.pageStatus.coinValue}`}
                  // strokeWidth={50}
                  styles={buildStyles({
                    strokeLinecap: "butt",
                    textSize: "28px",
                    pathTransitionDuration: 0.5,
                    pathColor: process.env.REACT_APP_LIGHT_BLUE,
                    textColor: process.env.REACT_APP_LIGHT_BLUE,
                    trailColor: process.env.REACT_APP_LIGHT_YELLOW,
                  })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              // variant="contained"
              color="primary"
              size="large"
              disabled={this.props.pageStatus.coinValue > 0}
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
              onClick={this.startTheRecipe}
            >
              <Typography variant="h5">
                <Translate value="startBake" />
              </Typography>
              {this.props.pageStatus.coinValue < item.priceNum ? (
                ""
              ) : (
                <Countdown
                  date={Date.now() + 10000}
                  renderer={(props) => <div>({props.seconds})</div>}
                  onComplete={this.startTheRecipe}
                />
              )}
            </Button>
          </DialogActions>
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
  return bindActionCreators(
    {
      setCheckoutDlgClose: () => setCheckoutDlgClose(),
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(CheckoutDlg));
