import React, { Component } from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import { bindActionCreators } from "redux";

import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import { Button } from "@material-ui/core";

import UIfx from "uifx";
import pop from "../../sounds/pop.flac";

const popSfx = new UIfx(pop);

const styles = (theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
});

class ReceiptPage extends Component {
  constructor(props) {
    super(props);
    this.setRecptType = this.setRecptType.bind(this);
  }

  setRecptType(recptType) {
    this.props.pageStatus.actStep = 4;
    this.props.pageStatus.recptType = recptType;
  }

  render() {
    const { classes, item, bakeAction } = this.props;

    return (
      <Box>
        <Box>
          <Button
            variant="contained"
            color="primary"
            className={classes.margin}
            style={{ width: "355px" }}
            onClick={() => {
              popSfx.play();
              this.setRecptType(1);
            }}
          >
            <Typography variant="h4">{"列印發票"}</Typography>
          </Button>
        </Box>
        <Box display="flex">
          <Box display="flex">
            <Button
              variant="contained"
              className={classes.margin}
              style={{ width: "170px" }}
              onClick={() => {
                popSfx.play();
                this.setRecptType(2);
              }}
            >
              <Typography variant="h4">{"愛心碼"}</Typography>
            </Button>
          </Box>
          <Box display="flex">
            <Button
              variant="contained"
              className={classes.margin}
              style={{ width: "170px" }}
              onClick={() => {
                popSfx.play();
                this.setRecptType(3);
              }}
            >
              <Typography variant="h4">{"雲端發票"}</Typography>
            </Button>
          </Box>
        </Box>
      </Box>
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
)(withStyles(styles)(ReceiptPage));
