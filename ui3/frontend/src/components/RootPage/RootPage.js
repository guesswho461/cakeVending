import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Slide from "@material-ui/core/Slide";

import Header from "../Header";
import ADPage from "../ADPage";
import StepPage from "../StepPage";
import MaintainPage from "../MaintainPage";

const styles = (theme) => ({
  root: {
    width: "720px",
    height: "1280px",
    overflow: "hidden",
    backgroundColor: process.env.REACT_APP_YELLOW,
  },
  boxMid: {
    backgroundColor: process.env.REACT_APP_LIGHT_YELLOW,
  },
  boxEnd: {
    backgroundColor: theme.palette.common.black,
  },
});

class RootPage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    this.props.pageStatus.selectedPage = "ad"; //ad maintain
    return (
      <div className={classes.root}>
        <Header />
        <Box height="650px" width="720px">
          <Slide
            direction="right"
            in={this.props.pageStatus.selectedPage !== "maintain"}
            mountOnEnter
            unmountOnExit
          >
            <div>
              <StepPage />
            </div>
          </Slide>
          <Slide
            direction="right"
            in={this.props.pageStatus.selectedPage === "maintain"}
            mountOnEnter
            unmountOnExit
          >
            <div>
              <MaintainPage />
            </div>
          </Slide>
        </Box>
        <Box height="100px" className={classes.boxMid}></Box>
        <Box>
          <ADPage />
        </Box>
        <Box height="25px" className={classes.boxEnd}></Box>
      </div>
    );
  }
}
//
//<MsgPage />

const mapStateToProps = (state) => {
  return {
    pageStatus: state.pageStatus,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(RootPage));
