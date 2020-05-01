import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
// import CircularProgress from "@material-ui/core/CircularProgress";

import { setCheckoutDlgClose } from "../../store/reducers/pageStatus";
import demoCake from "../../imgs/demoCake.jpg";
import { TransitionGrow } from "../PageBase/PageBaseFunction";

const styles = (theme) => ({
  image: {
    height: 200,
  },
});

class CheckoutDlg extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes, item, confirmAction } = this.props;

    return (
      <Dialog
        // fullWidth={true}
        // maxWidth={"lg"}
        TransitionComponent={TransitionGrow}
        open={this.props.pageStatus.checkoutDlgOpen}
        onClose={this.props.setCheckoutDlgClose}
      >
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
              {/* <CircularProgress
                variant="static"
                size={50}
                thickness={15}
                value={this.props.pageStatus.coinValue * 2}
                text={this.props.pageStatus.coinValue}
              /> */}
              <CircularProgressbar
                value={this.props.pageStatus.coinValue}
                maxValue={50}
                // text={this.props.pageStatus.coinValue}
                text={"$" + `${this.props.pageStatus.coinValue}`}
                // strokeWidth={50}
                // styles={buildStyles({
                //   strokeLinecap: "butt"
                // })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            // variant="contained"
            color="primary"
            size="large"
            onClick={() => {
              this.props.setCheckoutDlgClose();
            }}
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
            }}
          >
            <Typography variant="h5">
              <Translate value="startBake" />
            </Typography>
          </Button>
        </DialogActions>
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
