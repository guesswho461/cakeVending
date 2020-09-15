import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import "./aboutpage.css";

import {} from "../../store/reducers/pageStatus";

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
});

class AboutPage extends Component {
  constructor(props) {
    super(props);
  }

  state = {};

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <div className="text">
          <Typography variant="h2" align="center">
            {/* <Translate value={"about"} /> */}
            {process.env.REACT_APP_VERSION}
          </Typography>
        </div>
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
)(withStyles(styles)(AboutPage));
