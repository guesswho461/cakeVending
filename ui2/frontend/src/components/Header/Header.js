import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate, Localize } from "react-redux-i18n";

import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  title: {
    flexGrow: 1,
    textAlign: "left",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  }
});

class Header extends Component {
  state = {
    localProgress: 0
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <AppBar position="sticky">
          <Toolbar>
            <Typography variant="h2" className={classes.title}>
              <Translate value="brandName" />
            </Typography>
            <Typography variant="h4">
              <Localize value={Date()} dateFormat="date" />
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({}, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Header));
