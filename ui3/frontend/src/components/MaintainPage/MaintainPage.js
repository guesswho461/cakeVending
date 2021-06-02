import React, { Fragment, Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";

import { withStyles } from "@material-ui/core/styles";

import Typography from "@material-ui/core/Typography";

import Box from "@material-ui/core/Box";

const styles = (theme) => ({
  root: {
    //backgroundImage: `url(${logo})`,
    //backgroundPosition: "center",
    //backgroundRepeat: "no-repeat",
    backgroundColor: process.env.REACT_APP_LIGHT_YELLOW,
    //opacity: 0.15,
    height: "650px",
    width: "720px",
  },
});

class MaintainPage extends Component {
  constructor(props) {
    super(props);
  }

  state = {};

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Box paddingLeft="120px" paddingTop="230px" width="460px">
          <Typography variant="h3">
            <Translate value={this.props.pageStatus.maintainPageTitle} />
          </Typography>
        </Box>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    pageStatus: state.pageStatus,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MaintainPage));
