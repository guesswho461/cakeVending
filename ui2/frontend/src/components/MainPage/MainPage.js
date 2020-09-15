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
  setADPageTitle,
  coinValueDec,
  setPageSelected,
  setMakingProgress,
  setPressToBakeDlgClose,
} from "../../store/reducers/pageStatus";
import AboutPage from "../AboutPage";
import AutoCloseBtnDlg from "../AutoCloseBtnDlg";

import logo from "../../imgs/logo.svg";

import UIfx from "uifx";
import pop from "../../sounds/pop.flac";
import ratchet from "../../sounds/ratchet.wav";

const popSfx = new UIfx(pop);
const ratchetSfx = new UIfx(ratchet);

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    backgroundImage: `url(${logo})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  content: {
    paddingTop: "5vh",
    paddingBottom: "0.5vh",
    display: "flex",
    height: "80vh",
  },
});

class MainPage extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.tabTitle = this.tabTitle.bind(this);
  }

  state = {
    tabIdx: 0,
  };

  tabTitle(child) {
    return <Typography variant="h4">{child}</Typography>;
  }

  handleChange(event, newTabIdx) {
    this.setState({
      tabIdx: newTabIdx,
    });
    ratchetSfx.play();
  }

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
              <Tab label={this.tabTitle(<Translate value="itemPageTitle" />)} />
              {/** 0 */}
              <Tab
                label={this.tabTitle(
                  <Translate value="usageGuidingPageTitle" />
                )}
              />
              {/** 1 */}
              <Tab
                label={this.tabTitle(<Translate value="aboutUsPageTitle" />)}
              />
              {/** 2 */}
            </Tabs>
            {this.state.tabIdx === 0 && (
              <Box p={3}>
                <ItemPage />
              </Box>
            )}
            {this.state.tabIdx === 2 && (
              <Box p={3}>
                <AboutPage />
              </Box>
            )}
          </main>

          <CheckoutDlg item={items[0]} />
          <AutoCloseBtnDlg
            title="pressToBake"
            delay={3}
            openState={this.props.pageStatus.pressToBakeDlgOpen}
            closeSfx={popSfx}
            closeAction={() => {
              this.props.setPressToBakeDlgClose();
              this.props.setOriginalRecipeStart();
              this.props.setADPageTitle("makingText");
              this.props.coinValueDec(items[0].priceNum);
              this.props.setPageSelected("ad");
              this.props.setMakingProgress(0);
            }}
          />
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    pageStatus: state.pageStatus,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      setOriginalRecipeStart: () => setOriginalRecipeStart(),
      setADPageTitle: (data) => setADPageTitle(data),
      setPageSelected: (data) => setPageSelected(data),
      coinValueDec: (data) => coinValueDec(data),
      setMakingProgress: (data) => setMakingProgress(data),
      setPressToBakeDlgClose: () => setPressToBakeDlgClose(),
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MainPage));
