import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withStyles } from "@material-ui/core/styles";
import ReactPlayer from "react-player";
import Box from "@material-ui/core/Box";

import "./adpage.css";

import videoPath from "../../imgs/videoTest1.mp4";

const styles = (theme) => ({
  root: {
    backgroundColor: theme.palette.common.black,
  },
});

class ADPage extends Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Box>
          <div className="player-wrapper">
            <ReactPlayer
              className="react-player"
              url={videoPath}
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
        </Box>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ADPage));
