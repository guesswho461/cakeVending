import React, { Fragment, Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";

import Header from "../Header";
import ItemPage from "../ItemPage";
import CheckoutDlg from "../CheckoutDlg";
import items from "../../items";

import {
  setOriginalRecipeStart,
  setADPageTitle
} from "../../store/reducers/pageStatus";

const tabTitle = child => {
  return <Typography variant="h4">{child}</Typography>;
};

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`
  },
  content: {
    paddingTop: "5vh",
    // paddingBottom: "15vh"
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    height: "80vh"
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
      <Fragment>
        <div className={classes.root}>
          <Header />
          <main className={classes.content}>
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={this.state.tabIdx}
              onChange={this.handleChange}
              className={classes.tabs}
            >
              <Tab label={tabTitle(<Translate value="itemPageTitle" />)} />
              {/** 0 */}
              <Tab
                label={tabTitle(<Translate value="usageGuidingPageTitle" />)}
              />
              {/** 1 */}
              <Tab label={tabTitle(<Translate value="aboutUsPageTitle" />)} />
              {/** 2 */}
            </Tabs>
            {this.state.tabIdx === 0 && (
              <Box p={3}>
                <ItemPage />
              </Box>
            )}
          </main>
          <CheckoutDlg
            item={items[0]}
            confirmAction={() => {
              this.props.setOriginalRecipeStart();
              this.props.setADPageTitle("makingText");
            }}
          />
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      setOriginalRecipeStart: () => setOriginalRecipeStart(),
      setADPageTitle: data => setADPageTitle(data)
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MainPage));
