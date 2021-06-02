import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";

import DoneIcon from "@material-ui/icons/Done";
import DoneAlllIcon from "@material-ui/icons/DoneAll";

import {
  setFirstTimeMarkToThisOrder,
  setStarRatingDlgOpen,
  setFirstTimeBuyDlgClose,
  setThankYouDlgOpen,
} from "../../store/reducers/pageStatus";

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  button: {
    disableRipple: true,
    disableFocusRipple: true,
  },
  paper: {
    padding: theme.spacing(2),
    background: "transparent",
    boxShadow: "none",
    justifyContent: "center",
    display: "flex",
  },
});

class FirstTimeBuyPage extends Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Typography variant="h2">
                <Translate value={"firstTimeBuyQ"} />
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs>
            <Paper className={classes.paper}>
              <Button
                // variant="contained"
                color="primary"
                size="large"
                className={classes.button}
                startIcon={<DoneIcon />}
                onClick={() => {
                  this.props.setFirstTimeBuyDlgClose();
                  this.props.setFirstTimeMarkToThisOrder("yes");
                  this.props.setThankYouDlgOpen();
                }}
              >
                <Typography variant="h3">
                  <Translate value={"firstTimeBuyYes"} />
                </Typography>
              </Button>
            </Paper>
          </Grid>
          <Grid item xs>
            <Paper className={classes.paper}>
              <Button
                // variant="contained"
                color="primary"
                size="large"
                className={classes.button}
                startIcon={<DoneAlllIcon />}
                onClick={() => {
                  this.props.setFirstTimeBuyDlgClose();
                  this.props.setFirstTimeMarkToThisOrder("no");
                  this.props.setStarRatingDlgOpen();
                }}
              >
                <Typography variant="h3">
                  <Translate value={"firstTimeBuyNo"} />
                </Typography>
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      setFirstTimeMarkToThisOrder: (data) => setFirstTimeMarkToThisOrder(data),
      setStarRatingDlgOpen: () => setStarRatingDlgOpen(),
      setFirstTimeBuyDlgClose: () => setFirstTimeBuyDlgClose(),
      setThankYouDlgOpen: () => setThankYouDlgOpen(),
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(FirstTimeBuyPage));
