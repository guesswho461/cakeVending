import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";

import ItemPage from "../ItemPage";
import CheckoutDlg from "../CheckoutDlg";
import items from "../../items";

import { setOriginalRecipeStart } from "../../store/reducers/pageStatus";

const tabTitle = child => {
  return <Typography variant="h4">{child}</Typography>;
};

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    height: "80vh"
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`
  }
});

class MainPage extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    tabIdx: 0
  };

  handleChange = (event, newTabIdx) => {
    this.setState({
      tabIdx: newTabIdx
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={this.state.tabIdx}
          onChange={this.handleChange}
          className={classes.tabs}
        >
          <Tab label={tabTitle(<Translate value="itemPageTitle" />)} />
          {/** 0 */}
          <Tab label={tabTitle(<Translate value="usageGuidingPageTitle" />)} />
          {/** 1 */}
          <Tab label={tabTitle(<Translate value="aboutUsPageTitle" />)} />
          {/** 2 */}
        </Tabs>
        {this.state.tabIdx === 0 && (
          <Box p={3}>
            <ItemPage />
          </Box>
        )}
        <CheckoutDlg
          item={items[0]}
          confirmAction={this.props.setOriginalRecipeStart}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      setOriginalRecipeStart: () => setOriginalRecipeStart
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MainPage));
