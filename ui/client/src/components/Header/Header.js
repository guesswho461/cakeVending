import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Badge from "@material-ui/core/Badge";

import MenuIcon from "@material-ui/icons/Menu";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import GiftIcon from "@material-ui/icons/CardGiftcard";
import EjectIcon from "@material-ui/icons/Eject";

import companyInfo from '../../companyInfo';

import { logout } from "../../store/reducers/authenticate";

const styles = ({
  toolbarRoot: {
    paddingRight: 24
  },
  menuButton: {
    marginLeft: 12,
  },
  title: {
    flexGrow: 1,
    marginTop: 12,
    marginLeft: 12,
  }
});

class Header extends React.Component {
  render() {
    const {
      classes,
      handleToggleDrawer,
      handleCheckoutDlgOpen,
      handleCouponDlgOpen,
    } = this.props;

    return (
      <AppBar position="fixed" >
        <Toolbar disableGutters={true} classes={{ root: classes.toolbarRoot }}>
          {this.props.authenticate.engineerMode ? (
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={handleToggleDrawer}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
          ) : (
              <div></div>
            )}
          < Typography variant="h5" color="inherit"
            noWrap className={classes.title} gutterBottom>
            {companyInfo.title}
          </Typography>
          <IconButton color="inherit" onClick={handleCheckoutDlgOpen}>
            <Badge badgeContent={this.props.checkoutItem.totalCount} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={handleCouponDlgOpen}>
            <GiftIcon />
          </IconButton>
          {this.props.authenticate.engineerMode ? (
            <IconButton color="inherit" onClick={this.props.logout}>
              <EjectIcon />
            </IconButton>
          ) : (
              <div></div>
            )}
        </Toolbar>
      </AppBar >
    );
  }
};

const mapStateToProps = state => {
  return {
    checkoutItem: state.checkoutItem,
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
)(withStyles(styles)(Header));