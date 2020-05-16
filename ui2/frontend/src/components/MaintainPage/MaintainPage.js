import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import {} from "../../store/reducers/pageStatus";

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  box: {
    height: "100vh",
    display: "flex",
    // flexDirection: "column",
    justifyContent: "center",
    // alignItems: "center",
    paddingTop: "10vh",
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
        <Box className={classes.box}>
          <Typography variant="h2">
            <Box fontWeight="fontWeightBold">
              <Translate value="maintainMsg" />
            </Box>
          </Typography>
        </Box>
      </div>
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
)(withStyles(styles)(MaintainPage));
