import React, { Fragment, Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles } from "@material-ui/core/styles";

import Header from "../components/Header";

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  content: {
    paddingTop: "15vh"
    // paddingBottom: "15vh"
  }
});

class Home extends Component {
  render() {
    const { classes, children } = this.props;
    return (
      <Fragment>
        <div className={classes.root}>
          <Header />
          <main className={classes.content}>{children}</main>
        </div>
      </Fragment>
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
)(withStyles(styles)(Home));
