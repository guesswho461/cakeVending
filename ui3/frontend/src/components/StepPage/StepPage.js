import React, { Fragment, Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";

import { withStyles } from "@material-ui/core/styles";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

import Typography from "@material-ui/core/Typography";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";

import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";

import MainPage from "../MainPage";
import PayBox from "../PayBox";
import CalculationBox from "../CalculationBox";
import ReceiptPage from "../ReceiptPage";

import "./stepage.css";

import {
  setOriginalRecipeStart,
  setADPageTitle,
  coinValueDec,
  setPageSelected,
  setMakingProgress,
  setPressToBakeDlgClose,
  setFirstTimeBuyDlgOpen,
  openQRcodeScan,
  closeQRcodeScan,
} from "../../store/reducers/pageStatus";

import logo from "../../imgs/logo.svg";
import cook from "../../imgs/cooking.gif";

import UIfx from "uifx";
import pop from "../../sounds/pop.flac";
import ratchet from "../../sounds/ratchet.wav";

import logo2 from "../../imgs/logo2.png";

const popSfx = new UIfx(pop);
const ratchetSfx = new UIfx(ratchet);

popSfx.play();
const styles = (theme) => ({
  root: {
    backgroundColor: process.env.REACT_APP_YELLOW,
    height: "650px",
    width: "720px",
  },
  boxMid: {
    //backgroundImage: `url(${logo})`,
    //backgroundPosition: "center",
    //backgroundRepeat: "no-repeat",
    backgroundColor: process.env.REACT_APP_LIGHT_YELLOW,
  },
  boxEnd: {
    backgroundColor: process.env.REACT_APP_LIGHT_YELLOW,
  },
  boxMsg: {
    backgroundColor: theme.palette.common.white,
  },
  fontColor: {
    color: process.env.REACT_APP_LIGHT_BLUE,
  },

  button: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
});

function getSteps() {
  return [
    "selectSize",
    "selectPay",
    "deduction",
    "startMaking",
    "finishAndTake",
  ]; //"receipt",
}

function getStepContent(step) {
  switch (step) {
    case 0:
      return <Translate value={"plsSelectSize"} />;
    case 1:
      return <Translate value={"plsSelectPay"} />;
    case 2:
      return <Translate value={"plsPay"} />;
    case 6:
      return <Translate value={"plsReceipt"} />;
    case 3:
      return <Translate value={"plsWait"} />;
    case 4:
      return <Translate value={"completeBake"} />;
    default:
      return <Translate value={"Unknown step"} />;
  }
}

let strPayType = "coinPay";
let strPayable = "largeCakeTitle";

const steps = getSteps();

class StepPage extends Component {
  constructor(props) {
    super(props);
    this.handleNext = this.handleNext.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.addDiscount = this.addDiscount.bind(this);
    this.payAll = this.payAll.bind(this);
    this.payCoin = this.payCoin.bind(this);
  }

  state = {
    actStep: 0,
    totalPay: 0,
  };

  setActiveStep(newStep) {
    this.setState({
      actStep: newStep,
    });
  }
  setActiveTotal(newTotal) {
    this.setState({
      totalPay: newTotal,
    });
  }

  tick() {
    if (this.state.actStep !== this.props.pageStatus.actStep) {
      this.setActiveStep(this.props.pageStatus.actStep);
    }
    this.setActiveTotal(
      this.props.pageStatus.payableValue -
        this.props.pageStatus.discountValue -
        this.props.pageStatus.coinValue -
        this.props.pageStatus.paidValue
    );

    if (this.state.totalPay === 0 && this.props.pageStatus.actStep < 3) {
      this.props.pageStatus.actStep = 3;
      this.props.closeQRcodeScan();
    }
  }

  componentDidMount() {
    setInterval(() => this.tick(), 100);
  }

  handleNext() {
    if (this.state.actStep === steps.length - 1) this.handleReset();
    else {
      this.setActiveStep(this.state.actStep + 1);
      this.props.pageStatus.actStep++;
    }
  }

  handleBack() {
    this.setActiveStep(this.state.actStep - 1);
    this.props.pageStatus.actStep--;
    if (this.props.pageStatus.actStep == 0) this.props.closeQRcodeScan();
  }

  handleReset() {
    this.setActiveStep(0);
    this.props.pageStatus.actStep = 0;
    this.props.pageStatus.discountValue = 0;
    this.props.pageStatus.coinValue = 0;
    this.props.pageStatus.paidValue = 0;
    this.props.pageStatus.payType = 0;
  }

  addDiscount() {
    if (this.state.totalPay !== 0)
      this.props.pageStatus.discountValue =
        this.props.pageStatus.discountValue + 10;
  }

  payAll() {
    if (this.state.totalPay !== 0)
      this.props.pageStatus.paidValue = this.state.totalPay;
  }

  payCoin() {
    if (this.state.totalPay !== 0)
      this.props.pageStatus.coinValue = this.props.pageStatus.coinValue + 10;
  }

  getBuyContent(step) {
    switch (step) {
      case 1:
      case 2:
      case 6:
      case 3:
        return <Translate value={"order"} />;
      case 4:
        return <Translate value={"thanksforbuy"} />;
      default:
        return "";
    }
  }

  getPayable(step) {
    if (this.props.pageStatus.payableValue === 40)
      strPayable = "largeCakeTitle";
    else strPayable = "smallCakeTitle";

    switch (step) {
      case 1:
      case 2:
      case 6:
      case 3:
        return <Translate value={strPayable} />;
      default:
        return "";
    }
  }

  getPayType(step) {
    if (
      this.props.pageStatus.payType >= 1 &&
      this.props.pageStatus.payType <= 3
    )
      strPayType = "wavePay";
    else if (this.props.pageStatus.payType === 4) strPayType = "barcodePay";
    else if (this.props.pageStatus.payType === 5) strPayType = "coinPay";
    else strPayType = "";

    switch (step) {
      case 2:
      case 6:
        return <Translate value={strPayType} />;
      default:
        return "";
    }
  }
  render() {
    const { classes } = this.props;
    return (
      <Fragment>
        <div className={classes.root}>
          <Stepper activeStep={this.state.actStep}>
            {steps.map((label, index) => {
              const stepProps = {};
              const labelProps = {};

              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>
                    <Translate value={label} />
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
          <div>
            <div>
              <Box display="flex" paddingLeft="30px">
                <Typography className={classes.instructions} variant="h5">
                  {getStepContent(this.state.actStep)}
                </Typography>

                <Box paddingLeft="260px">
                  <Typography className={classes.instructions} variant="h6">
                    {this.getBuyContent(this.state.actStep)}
                    {this.getPayable(this.state.actStep)}
                    {(this.state.actStep === 2 || this.state.actStep === 6) && (
                      <Translate value={"-"} />
                    )}

                    {this.getPayType(this.state.actStep)}
                    {this.state.actStep === 6 && <Translate value={"paid"} />}
                  </Typography>
                </Box>
              </Box>
              <Box className={classes.boxMid} height="550px" width="720px">
                {this.state.actStep === 0 && (
                  <Box>
                    <MainPage />
                  </Box>
                )}

                {this.state.actStep === 1 && (
                  <Box paddingLeft="30px" paddingTop="30px">
                    <Box>
                      <PayBox />
                    </Box>
                    <Box display="flex">
                      <Box paddingTop="50px" width="350px">
                        <div>
                          <Button
                            variant="contained"
                            style={{ width: "350px" }}
                            onClick={() => {
                              this.addDiscount();
                            }}
                          >
                            <Typography variant="h4">
                              <Translate value={"plsScanDiscount"} />
                            </Typography>
                          </Button>
                        </div>
                      </Box>
                      <Box paddingLeft="130px" paddingTop="20px">
                        <CalculationBox />
                      </Box>
                    </Box>
                  </Box>
                )}

                {this.state.actStep === 2 &&
                  this.props.pageStatus.payType >= 1 &&
                  this.props.pageStatus.payType <= 3 && (
                    <Box paddingLeft="50px" paddingTop="30px">
                      <Box width="720px" height="350px">
                        <Typography className={classes.fontColor} variant="h4">
                          <Translate value={"balanceAmount"} />
                          {this.state.totalPay}
                        </Typography>
                        <Box paddingTop="10px">
                          <Typography
                            className={classes.fontColor}
                            variant="h4"
                          >
                            {this.props.pageStatus.payType === 2 && (
                              <Translate value={"esvcPay"} />
                            )}
                            {this.props.pageStatus.payType === 3 && (
                              <Translate value={"uniPay"} />
                            )}
                            <Translate value={"plsWave"} />
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          style={{ width: "300px" }}
                          onClick={this.payAll}
                        >
                          <Typography variant="h4">{"扣款"}</Typography>
                        </Button>
                      </Box>
                      <Box paddingLeft="480px" paddingTop="20px">
                        <CalculationBox />
                      </Box>
                    </Box>
                  )}
                {this.state.actStep === 2 &&
                  this.props.pageStatus.payType === 4 && (
                    <Box paddingLeft="50px" paddingTop="30px">
                      <Box width="720px" height="350px">
                        <Typography className={classes.fontColor} variant="h4">
                          <Translate value={"balanceAmount"} />
                          {this.state.totalPay}
                        </Typography>
                        <Typography className={classes.fontColor} variant="h4">
                          <Translate value={"plsScanBarcode"} />
                        </Typography>
                        <Button
                          variant="contained"
                          style={{ width: "300px" }}
                          onClick={this.payAll}
                        >
                          <Typography variant="h4">{"扣款"}</Typography>
                        </Button>
                      </Box>
                      <Box paddingLeft="480px" paddingTop="20px">
                        <CalculationBox />
                      </Box>
                    </Box>
                  )}
                {this.state.actStep === 2 &&
                  this.props.pageStatus.payType === 5 && (
                    <Box paddingLeft="50px" paddingTop="30px">
                      <Box width="720px" height="350px">
                        <Typography className={classes.fontColor} variant="h4">
                          <Translate value={"balanceAmount"} />
                          {this.state.totalPay}
                        </Typography>
                        <Typography className={classes.fontColor} variant="h4">
                          <Translate value={"plsCoin"} />
                        </Typography>
                        <Button
                          variant="contained"
                          style={{ width: "300px" }}
                          onClick={this.payCoin}
                        >
                          <Typography variant="h4">{"扣款"}</Typography>
                        </Button>
                        <Box paddingLeft="250px" paddingTop="20px">
                          <Grid item xs={4} align="center">
                            <CircularProgressbar
                              value={this.props.pageStatus.coinValue}
                              maxValue={this.props.pageStatus.payableValue}
                              text={"$" + `${this.props.pageStatus.coinValue}`}
                              // strokeWidth={50}
                              styles={buildStyles({
                                strokeLinecap: "butt",
                                textSize: "30px",
                                pathTransitionDuration: 0.5,
                                pathColor: process.env.REACT_APP_LIGHT_BLUE,
                                textColor: process.env.REACT_APP_LIGHT_BLUE,
                                trailColor: process.env.REACT_APP_LIGHT_YELLOW,
                              })}
                            />
                          </Grid>
                        </Box>
                      </Box>

                      <Box paddingLeft="480px" paddingTop="20px">
                        <CalculationBox />
                      </Box>
                    </Box>
                  )}
                {this.state.actStep === 6 && (
                  <Box paddingLeft="160px" paddingTop="100px">
                    <ReceiptPage />
                  </Box>
                )}
                {this.state.actStep === 3 && (
                  <Box paddingTop="15px">
                    <Box>
                      <Typography
                        className={classes.fontColor}
                        align="center"
                        variant="h2"
                      >
                        <Translate value={"makingText"} />
                      </Typography>
                    </Box>
                    <Box paddingLeft="160px" paddingTop="30px" display="flex">
                      <div className="abgne-progress">
                        <CircularProgressbar
                          value="60"
                          maxValue="90"
                          // strokeWidth={50}

                          styles={buildStyles({
                            strokeLinecap: "butt",
                            textSize: "20px",
                            pathTransitionDuration: 0.5,
                            pathColor: process.env.REACT_APP_LIGHT_BLUE,
                            trailColor: process.env.REACT_APP_LIGHT_YELLOW,
                          })}
                        ></CircularProgressbar>
                      </div>
                      <div className="abgne-img">
                        <Box paddingLeft="160px" paddingTop="145px">
                          <img src={cook} />
                        </Box>
                      </div>
                    </Box>
                  </Box>
                )}

                {this.state.actStep === 4 && (
                  <Box height="200px" width="350px">
                    <div className="buttonBase">
                      <Box paddingLeft="370px" paddingTop="135px">
                        <Button style={{ width: "330px" }}>
                          <Typography variant="h1">
                            <Translate value={"cakeTakeText"} />
                          </Typography>
                        </Button>
                      </Box>
                    </div>
                    <div className="abgne-progress">
                      <Box paddingLeft="15px" paddingTop="45px">
                        <img src={logo2} height="590px" />
                      </Box>
                    </div>
                  </Box>
                )}
              </Box>

              <Box className={classes.boxEnd} paddingLeft="500px">
                <Button
                  disabled={
                    this.state.actStep === 0 ||
                    this.state.actStep >= 3 ||
                    this.props.pageStatus.coinValue > 0
                  }
                  variant="outlined"
                  size="large"
                  style={{ width: "100px" }}
                  onClick={() => {
                    this.handleBack();
                  }}
                  className={classes.button}
                >
                  <Typography variant="h5">Back</Typography>
                </Button>

                <Button
                  disabled={this.state.actStep <= 2}
                  variant="contained"
                  color="primary"
                  size="large"
                  style={{ width: "100px" }}
                  onClick={() => this.handleNext()}
                  className={classes.button}
                >
                  <Typography variant="h5">
                    {this.state.actStep === steps.length - 1
                      ? "Finish"
                      : "Next"}
                  </Typography>
                </Button>
              </Box>
            </div>
          </div>
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
      openQRcodeScan: () => openQRcodeScan(),
      closeQRcodeScan: () => closeQRcodeScan(),
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(StepPage));
