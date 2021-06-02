import React, { Fragment, Component } from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";

import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";

import "./calculationbox.css";

const pay = 0;
const styles = (theme) => ({
  root: {
    display: "flex",
    backgroundColor: process.env.REACT_APP_LIGHT_YELLOW,
  },
});

class CalculationBox extends Component {
  constructor(props) {
    super(props);
    this.setActiveDIS = this.setActiveDIS.bind(this);
    this.setActiveTotal = this.setActiveTotal.bind(this);
  }

  state = {
    totalPay: 0,
    discountValue: 0,
  };

  setActiveDIS(newDIS) {
    this.setState({
      discountValue: newDIS,
    });
  }

  setActiveTotal(newTotal) {
    this.setState({
      totalPay: newTotal,
    });
  }

  tick() {
    if (this.state.discountValue !== this.props.pageStatus.discountValue) {
      this.setActiveDIS(this.props.pageStatus.discountValue);
    }
    this.setActiveTotal(
      this.props.pageStatus.payableValue -
        this.props.pageStatus.discountValue -
        this.props.pageStatus.coinValue -
        this.props.pageStatus.paidValue
    );
  }

  componentDidMount() {
    setInterval(() => this.tick(), 100);
  }

  render() {
    const { classes, item, bakeAction } = this.props;

    return (
      <Fragment>
        <Box height="350px" width="160px">
          <Box display="flex">
            <Typography variant="h5">
              <Translate value={"payableAmount"} />
            </Typography>
            <Box className="divcss5-right">
              <Typography variant="h5">
                {this.props.pageStatus.payableValue}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Box display="flex">
            <Typography variant="h5">
              <Translate value={"discountAmount"} />
            </Typography>
            <Box className="divcss5-right">
              <Typography variant="h5">{this.state.discountValue}</Typography>
            </Box>
          </Box>
          <Divider />
          <Box display="flex">
            <Typography variant="h5">
              <Translate value={"balanceAmount"} />
            </Typography>
            <Box className="divcss5-right">
              <Typography variant="h5">{this.state.totalPay}</Typography>
            </Box>
          </Box>
        </Box>
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
  return bindActionCreators({}, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(CalculationBox));
