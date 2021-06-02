import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";

import PayBox from "../PayBox";

import {
  setCheckoutDlgClose,
  setPressToBakeDlgOpen,
} from "../../store/reducers/pageStatus";
import {
  TransitionGrow,
  FlashMonetizationOnIcon,
  BounceInLeftDoubleArrownIcon,
} from "../PageBase/PageBaseFunction";

const styles = (theme) => ({
  image: {
    height: 400,
  },
  dlg: {
    backgroundColor: process.env.REACT_APP_LIGHT_YELLOW,
    width: 560,
    height: 700,
  },
});

class CheckoutDlg extends Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    if (this.props.pageStatus.pressToBakeDlgOpen === false) {
      if (this.props.pageStatus.coinValue >= this.props.item.price) {
        this.props.setCheckoutDlgClose();
        // this.props.setPressToBakeDlgOpen();
        if (this.props.bakeAction) {
          this.props.bakeAction();
        }
      }
    }
  }

  render() {
    const { classes, item, bakeAction } = this.props;

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
            <Box display="flex" justifyContent="center" alignItems="center">
              <Typography variant="h4" align="center">
                <Translate value="plsInsertCoin" />
              </Typography>
              <FlashMonetizationOnIcon
                style={{
                  fontSize: 48,
                }}
              />
              <BounceInLeftDoubleArrownIcon
                style={{
                  fontSize: 48,
                }}
              />
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Box height="500px">
              <Box paddingLeft="10px" height="420px">
                <PayBox />
              </Box>
              <Box>
                <Grid
                  container
                  //spacing={1}
                  direction="row"
                  justify="space-between"
                  alignItems="center"
                >
                  <Grid item xs>
                    <Typography variant="h4">
                      <Translate value={item.title} />
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="h4">
                      <Translate value={item.priceStr} />
                    </Typography>
                  </Grid>
                </Grid>
                <Grid
                  container
                  direction="row"
                  justify="center"
                  alignItems="center"
                >
                  <Grid item xs>
                    <Typography variant="h6">
                      <Translate value={item.content} />
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
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
      setPressToBakeDlgOpen: () => setPressToBakeDlgOpen(),
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(CheckoutDlg));
