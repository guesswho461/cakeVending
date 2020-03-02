import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles } from "@material-ui/core/styles";
import Slide from "@material-ui/core/Slide";

import MainPage from "../MainPage";
import ADPage from "../ADPage";
import AutoCloseDlg from "../AutoCloseDlg";

import {
  setHeadtingUpWarningDlgClose,
  setTakeCakeWarningDlgClose
} from "../../store/reducers/pageStatus";

const styles = theme => ({
  root: {
    flexGrow: 1
  }
});

class RootPage extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    checked: false
  };

  handleChange = () => {
    this.setState(prevState => {
      return {
        checked: !prevState.checked
      };
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Slide
          direction="right"
          in={this.props.pageStatus.selectedPage === "main"}
          mountOnEnter
          unmountOnExit
        >
          <div>
            <MainPage />
          </div>
        </Slide>
        <Slide
          direction="down"
          in={this.props.pageStatus.selectedPage === "ad"}
          mountOnEnter
          unmountOnExit
        >
          <div>
            <ADPage />
          </div>
        </Slide>
        <AutoCloseDlg
          title="heatingText"
          delay={1}
          openState={this.props.pageStatus.heatingUpWarningDlgOpen}
          closeAction={this.props.setHeadtingUpWarningDlgClose}
        />
        <AutoCloseDlg
          title="cakeTakeText"
          delay={0}
          openState={this.props.pageStatus.takeCakeWarningDlgOpen}
          closeAction={this.props.setTakeCakeWarningDlgClose}
        />
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
      setHeadtingUpWarningDlgClose: () => setHeadtingUpWarningDlgClose(),
      setTakeCakeWarningDlgClose: () => setTakeCakeWarningDlgClose()
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(RootPage));
