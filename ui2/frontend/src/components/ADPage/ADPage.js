import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";
import ReactPlayer from "react-player";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";

import {
  setPageSelected,
  setHeadtingUpWarningDlgOpen,
  setMakingProgress,
} from "../../store/reducers/pageStatus";
import { TransitionSlideDown } from "../PageBase/PageBaseFunction";

const BorderLinearProgress = withStyles({
  root: {
    height: 20,
    // backgroundColor: lighten('#ff6c5c', 0.5),
  },
  // bar: {
  //   borderRadius: 20,
  //   backgroundColor: '#ff6c5c',
  // },
})(LinearProgress);

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  button: {
    "&$buttonDisabled": {
      color: theme.palette.grey[900],
    },
    flexGrow: 1,
  },
  buttonDisabled: {},
});

const TOTAL_MAKING_TIME = 0.5; //mins
const MAX_MAKING_PROGRESS = 95;
const MAKING_PROGRESS_STEP = 1;
const MAKING_TICK_TIME =
  (TOTAL_MAKING_TIME * 60 * 1000) /
  (MAX_MAKING_PROGRESS / MAKING_PROGRESS_STEP);

class ADPage extends Component {
  constructor(props) {
    super(props);
    this.makingTimeTick = this.makingTimeTick.bind(this);
  }

  state = {
    progress: 0,
  };

  makingProgressInc(prev, stepSize) {
    if (prev < MAX_MAKING_PROGRESS) {
      return prev + stepSize;
    } else {
      return MAX_MAKING_PROGRESS;
    }
  }

  makingTimeTick() {
    this.props.setMakingProgress(
      this.makingProgressInc(
        this.props.pageStatus.makingProgress,
        MAKING_PROGRESS_STEP
      )
    );
  }

  componentDidMount() {
    if (this.props.pageStatus.checkoutDone) {
      this.makingTimerID = setInterval(this.makingTimeTick, MAKING_TICK_TIME);
    }
  }

  componentDidUpdate() {
    if (this.props.pageStatus.makingProgress >= MAX_MAKING_PROGRESS) {
      clearInterval(this.makingTimerID);
    }
  }

  componentWillUnmount() {
    clearInterval(this.makingTimerID);
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Button
          onClick={() => {
            if (this.props.pageStatus.ovenIsReady) {
              this.props.setPageSelected("main");
            } else {
              this.props.setHeadtingUpWarningDlgOpen();
            }
          }}
          disabled={this.props.pageStatus.checkoutDone}
          classes={{ root: classes.button, disabled: classes.buttonDisabled }}
        >
          <Grid
            container
            spacing={2}
            // direction="row"
            // justify="space-between"
            // alignItems="center"
          >
            <Grid item xs={12}>
              {this.props.pageStatus.showRecipeProgress ? (
                <BorderLinearProgress
                  variant="determinate"
                  value={this.props.pageStatus.makingProgress}
                />
              ) : (
                ""
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h2" align="center">
                <Translate value={this.props.pageStatus.adPageTitle} />
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <div align="center">
                <ReactPlayer
                  url="https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
                  // url={this.props.pageStatus.videoPlayList}
                  // url={[
                  //   "https://www.youtube.com/watch?v=ysz5S6PUM-U",
                  //   "https://www.youtube.com/watch?v=d46Azg3Pm4c",
                  // ]}
                  playing={true}
                  loop={true}
                  // controls={false}
                  volume={0}
                  muted={true}
                  playsinline={true}
                  width="80%"
                  height="80%"
                />
              </div>
            </Grid>
          </Grid>
        </Button>
      </div>
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
      setPageSelected: (data) => setPageSelected(data),
      setHeadtingUpWarningDlgOpen: () => setHeadtingUpWarningDlgOpen(),
      setMakingProgress: (data) => setMakingProgress(data),
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ADPage));
