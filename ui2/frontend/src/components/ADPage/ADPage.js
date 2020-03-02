import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";
import "../../../node_modules/video-react/dist/video-react.css";
import { Player, ControlBar, Shortcut } from "video-react";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";

import {
  setPageSelected,
  setHeadtingUpWarningDlgOpen,
  setTakeCakeWarningDlgOpen
} from "../../store/reducers/pageStatus";

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  progressBar: {
    width: "100%"
  }
});

class ADPage extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    tabIdx: 0
  };

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
              // this.props.setTakeCakeWarningDlgOpen();
            }
          }}
        >
          <Grid
            container
            spacing={2}
            direction="row"
            justify="space-around"
            alignItems="stretch"
          >
            <Grid item xs={12}>
              <LinearProgress
                className={classes.progressBar}
                variant="determinate"
                value={"50%"}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h2" align="center">
                <Translate value={this.props.pageStatus.adPageTitle} />
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <div align="center">
                <Player
                  fluid={false}
                  height={550}
                  autoPlay
                  playsInline
                  aspectRatio="auto"
                  src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
                >
                  <ControlBar disableCompletely={true} />
                  <Shortcut clickable={false} />
                </Player>
              </div>
            </Grid>
          </Grid>
        </Button>
      </div>
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
      setPageSelected: data => setPageSelected(data),
      setHeadtingUpWarningDlgOpen: () => setHeadtingUpWarningDlgOpen(),
      setTakeCakeWarningDlgOpen: () => setTakeCakeWarningDlgOpen()
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ADPage));
