import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";

import { withStyles } from "@material-ui/core/styles";
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import Setting from "../Setting";
import QRCodeGen from "../QRCodeGen";
import Robot from "../Robot";
import Bucket from "../Bucket";
import Oven from "../Oven";
import Latch from '../Latch';
import Recipe from '../Recipe';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
});

class EngineerMode extends React.Component {
  state = {
    tabIdx: 0,
  }

  handleChange = (event, newTabIdx) => {
    this.setState({
      tabIdx: newTabIdx,
    })
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        {this.props.authenticate.engineerMode ? (
          <div className={classes.root}>
            <AppBar position="static">
              <Tabs scrollButtons="auto" variant="scrollable" value={this.state.tabIdx} onChange={this.handleChange}>
                <Tab label="Robot" />{/** 0 */}
                <Tab label="Oven" />{/** 1 */}
                <Tab label="Latch" />{/** 2 */}
                <Tab label="Bucket" />{/** 3 */}
                <Tab label="QR code gen" />{/** 4 */}
                <Tab label="Setting" />/{/** 5 */}
                <Tab label="Log" />{/** 6  */}
                <Tab label="Recipe" />{/** 7  */}
                </Tabs>
            </AppBar>
            {this.state.tabIdx === 0 && <Robot />}
            {this.state.tabIdx === 1 && <Oven />}
            {this.state.tabIdx === 2 && <Latch />}
            {this.state.tabIdx === 3 && <Bucket />}
            {this.state.tabIdx === 4 && <QRCodeGen />}
            {this.state.tabIdx === 5 && <Setting />}
            {this.state.tabIdx === 7 && <Recipe />}
            </div>
        ) : (
            <Redirect to="/home" />
          )}
      </div>
    );
  }
};

const mapStateToProps = state => {
  return {
    authenticate: state.authenticate
  };
};

export default connect(
  mapStateToProps,
  null
)(withStyles(styles)(EngineerMode));
