import React, { Fragment, Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

// import logo from "../logo.svg";
import logo from "./BNTa.svg";

import { withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: process.env.REACT_APP_LIGHT_YELLOW,
    backgroundImage: `url(${logo})`,
    // backgroundPosition: "60vh 20vh",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    // opacity: 0.5,
  },
  content: {
    // backgroundColor: "rgba(0, 0, 0, 0.3)",
    // paddingTop: "5vh",
    // paddingBottom: "15vh"
  },
});

class Home extends Component {
  render() {
    const { classes, children } = this.props;
    return (
      <Fragment>
        <div
          className={classes.root}
          // style={{ backgroundImage: `url(${logo})` }}
        >
          <main className={classes.content}>{children}</main>
        </div>
      </Fragment>
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
)(withStyles(styles)(Home));
