import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate, Localize } from "react-redux-i18n";

import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";
import Box from "@material-ui/core/Box";

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

class Header extends Component {
  state = {
    localProgress: 0,
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <AppBar position="sticky" style={{ background: "#000000" }}>
          <Box p={2}>
            <Toolbar>
              <Typography variant="h2" className={classes.title}>
                <Box fontWeight="fontWeightBold">
                  <Translate value="brandName" />
                </Box>
              </Typography>
              <Typography variant="h4">
                {this.props.pageStatus.isDevMode ? (
                  <Translate value="devModeText" />
                ) : (
                  <Localize value={Date()} dateFormat="date" />
                )}
              </Typography>
            </Toolbar>
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
