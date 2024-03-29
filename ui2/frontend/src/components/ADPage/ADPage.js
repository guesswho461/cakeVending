import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";
import ReactPlayer from "react-player";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import LinearProgress from "@material-ui/core/LinearProgress";
import CardActionArea from "@material-ui/core/CardActionArea";
import Box from "@material-ui/core/Box";

import "./adpage.css";

import {
  setPageSelected,
  setHeadtingUpWarningDlgOpen,
  setMakingProgress,
  getNextVideoURL,
  setHeadtingUpWarningDlgClose,
} from "../../store/reducers/pageStatus";
import {
  FlashTouchAppIcon,
  GetFromBackend,
} from "../PageBase/PageBaseFunction";

import UIfx from "uifx";
import pop from "../../sounds/pop.flac";
const popSfx = new UIfx(pop);

const BorderLinearProgress = withStyles({
  root: {
    height: 20,
    backgroundColor: process.env.REACT_APP_YELLOW,
  },
  bar: {
    borderRadius: 20,
    backgroundColor: process.env.REACT_APP_LIGHT_BLUE,
  },
})(LinearProgress);

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    height: "100vh",
    backgroundColor: process.env.REACT_APP_YELLOW,
  },
});

const TOTAL_MAKING_TIME = process.env.REACT_APP_ETA; //mins
const MAX_MAKING_PROGRESS = 95;
const MAKING_PROGRESS_STEP = 1;
const MAKING_TICK_TIME =
  (TOTAL_MAKING_TIME * 60 * 1000) /
  (MAX_MAKING_PROGRESS / MAKING_PROGRESS_STEP);

class ADPage extends Component {
  constructor(props) {
    super(props);
    this.makingTimeTick = this.makingTimeTick.bind(this);
    this.getMakingCountDown = this.getMakingCountDown.bind(this);
    // this.secToMinAndSec = this.secToMinAndSec.bind(this);
  }

  state = {};

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

  secToMinAndSec(timeInSec) {
    let date = new Date(null);
    date.setSeconds(timeInSec);
    return date.getUTCMinutes() + ":" + date.getUTCSeconds();
  }

  getMakingCountDown() {
    return this.secToMinAndSec(
      TOTAL_MAKING_TIME * 60 -
        (this.props.pageStatus.makingProgress * MAKING_TICK_TIME) / 1000
    );
  }

  toAppendTheTitle() {
    if (this.props.pageStatus.checkoutDone) {
      if (this.props.pageStatus.makingProgress < 100) {
        return (
          <Box display="flex" justifyContent="center" alignItems="center">
            <Translate value={"andAbout"} />
            {this.getMakingCountDown()}
            <Translate value={"toDone"} />
          </Box>
        );
      } else {
        return null;
      }
    } else {
      if (this.props.pageStatus.takeCakeWarningDlgOpen === false) {
        return (
          <FlashTouchAppIcon
            style={{ fontSize: 64, transform: "rotate(-45deg)" }}
          />
        );
      } else {
        return null;
      }
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <CardActionArea
        disableRipple={true}
        disableTouchRipple={true}
        onClick={() => {
          GetFromBackend("/oven/status/ready", (data) => {
            if (data) {
              popSfx.play();
              this.props.setPageSelected("main");
            } else {
              this.props.setHeadtingUpWarningDlgOpen();
              setTimeout(
                this.props.setHeadtingUpWarningDlgClose,
                process.env.REACT_APP_HEATING_UP_WARNING_DELAY * 1000
              );
            }
          });
        }}
        disabled={this.props.pageStatus.checkoutDone}
      >
        <div className={classes.root}>
          <BorderLinearProgress
            variant="determinate"
            value={this.props.pageStatus.makingProgress}
          />
          <Typography variant="h2" align="center">
            <Box display="flex" justifyContent="center" alignItems="center">
              <Translate value={this.props.pageStatus.adPageTitle} />
              {this.toAppendTheTitle()}
            </Box>
          </Typography>
          <div className="player-wrapper">
            <ReactPlayer
              className="react-player"
              url={this.props.pageStatus.video.url}
              width="100%"
              height="100%"
              playing={true}
              volume={1}
              muted={true}
              playsinline={false}
              controls={false}
              // onEnded={this.props.getNextVideoURL}
              loop={true}
            />
          </div>
        </div>
      </CardActionArea>
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
      getNextVideoURL: () => getNextVideoURL(),
      setHeadtingUpWarningDlgClose: () => setHeadtingUpWarningDlgClose(),
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ADPage));
