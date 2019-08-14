import React, { Fragment, Component } from "react";
import classNames from "classnames";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles } from "@material-ui/core/styles";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { logout } from "../store/reducers/authenticate";
import CheckoutDlg from '../components/CheckoutDlg';
import CouponDlg from '../components/CouponDlg';

const drawerWidth = 240;

const styles = theme => ({
  root: {
    display: "flex",
    backgroundColor: theme.palette.background.paper,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    marginTop: theme.spacing.unit * 7,
  },
  contentMiniShift: {
    marginLeft: theme.spacing.unit * 9,
    overflowX: "hidden",
  },
  contentFullShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  }
});

class MainLayout extends Component {
  state = {
    sideBarOpen: false,
    checkoutDlgOpen: false,
    couponDlgOpen: false,
  };

  handleToggleDrawer = () => {
    this.setState(prevState => {
      return { sideBarOpen: !prevState.sideBarOpen };
    });
  };

  handleCheckoutDlgOpen = () => {
    this.setState({
      checkoutDlgOpen: true
    });
  }

  handleCheckoutDlgClose = () => {
    this.setState({
      checkoutDlgOpen: false
    });
  }

  handleCouponDlgOpen = () => {
    this.setState({
      couponDlgOpen: true
    });
  }

  handleCouponDlgClose = () => {
    this.setState({
      couponDlgOpen: false
    });
  }

  render() {
    const { classes, children } = this.props;

    return (
      <Fragment>
        <div className={classes.root}>
          <Header
            logout={this.props.logout}
            handleToggleDrawer={this.handleToggleDrawer}
            handleCheckoutDlgOpen={this.handleCheckoutDlgOpen}
            handleCouponDlgOpen={this.handleCouponDlgOpen}
          />
          <main
            className={classNames(classes.content, {
              [classes.contentMiniShift]: this.props.authenticate.engineerMode,
              [classes.contentFullShift]: this.state.sideBarOpen,
            })}
          >
            {children}
          </main>
        </div>
        {this.props.authenticate.engineerMode ? (
          <Sidebar open={this.state.sideBarOpen} drawerWidth={this.handleToggleDrawer} />
        ) : (
            <div></div>
          )}
        <CheckoutDlg open={this.state.checkoutDlgOpen} handleCheckoutDlgClose={this.handleCheckoutDlgClose} />
        <CouponDlg open={this.state.couponDlgOpen} handleCouponDlgClose={this.handleCouponDlgClose} />
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    authenticate: state.authenticate
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      logout: () => logout()
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MainLayout));
