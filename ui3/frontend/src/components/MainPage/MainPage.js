import React, { Fragment, Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import ItemPage from "../ItemPage";

import {
  setOriginalRecipeStart,
  setADPageTitle,
  coinValueDec,
  setPageSelected,
  setMakingProgress,
  setPressToBakeDlgClose,
  setFirstTimeBuyDlgOpen,
} from "../../store/reducers/pageStatus";

import UIfx from "uifx";
import pop from "../../sounds/pop.flac";
import ratchet from "../../sounds/ratchet.wav";

const ratchetSfx = new UIfx(ratchet);

const styles = (theme) => ({
  root: {
    width: "720px",
    height: "870px",
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  content: {
    flexGrow: 1,
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
          <Box paddingLeft="20px" paddingTop="40px">
            <ItemPage />
          </Box>
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
      setOriginalRecipeStart: (data) => setOriginalRecipeStart(data),
      setADPageTitle: (data) => setADPageTitle(data),
      setPageSelected: (data) => setPageSelected(data),
      coinValueDec: (data) => coinValueDec(data),
      setMakingProgress: (data) => setMakingProgress(data),
      setPressToBakeDlgClose: () => setPressToBakeDlgClose(),
      setFirstTimeBuyDlgOpen: () => setFirstTimeBuyDlgOpen(),
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MainPage));
