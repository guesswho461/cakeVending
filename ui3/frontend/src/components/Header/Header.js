import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate, Localize } from "react-redux-i18n";

import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";
import Box from "@material-ui/core/Box";

import logo from "../../imgs/logo.png";

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
    textAlign: "left",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    // fontWeight: "fontWeightBold",
  },
});

const getTime = () => {
  const now = new Date();
  return now.getHours() + ":" + now.getMinutes();
};

class Header extends Component {
  state = {
    localProgress: 0,
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <AppBar position="sticky" style={{ background: "#000000" }}>
          <Box display="flex" alignItems="center">
            <Box paddingLeft="10px" paddingTop="2px" width="50px">
              <img src={logo} height="60px" />
            </Box>
            <Box>
              <Toolbar>
                <Typography variant="h2" className={classes.title}>
                  <Box fontWeight="fontWeightBold">
                    <Translate value="brandName" />
                  </Box>
                </Typography>
                <Box paddingLeft="50px">
                  <Typography variant="h5">
                    {this.props.pageStatus.isDevMode ? (
                      <Translate value="devModeText" />
                    ) : (
                      <Localize value={getTime()} dateFormat="date" />
                    )}
                  </Typography>
                </Box>
              </Toolbar>
            </Box>
          </Box>
        </AppBar>
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
  return bindActionCreators({}, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Header));
