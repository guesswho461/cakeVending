import React, { Component } from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import { bindActionCreators } from "redux";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import ButtonBase from "@material-ui/core/ButtonBase";
import Typography from "@material-ui/core/Typography";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import { Translate } from "react-redux-i18n";
import "react-circular-progressbar/dist/styles.css";

import waves from "../../waves";
import codes from "../../codes";
import esvc from "../../esvc";
import unipay from "../../unipay";

import CoinPay from "../../imgs/coinPay.png";
import CardPay from "../../imgs/cardPay.png";
import CodePay from "../../imgs/codePay.png";

import UIfx from "uifx";
import pop from "../../sounds/pop.flac";

const popSfx = new UIfx(pop);

const styles = (theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    minWidth: 150,
    width: "720px",
    height: "350px",
    //width: "100%",
    backgroundColor: process.env.REACT_APP_LIGHT_YELLOW,
  },
  image: {
    position: "relative",
    width: 150,
    height: 350,
    [theme.breakpoints.down("xs")]: {
      width: "100% !important", // Overrides inline-style
      height: 100,
    },
    "&:hover, &$focusVisible": {
      zIndex: 1,
      "& $imageBackdrop": {
        opacity: 0.15,
      },
      "& $imageMarked": {
        opacity: 0,
      },
      "& $imageTitle": {
        border: "4px solid currentColor",
      },
    },
  },
  focusVisible: {},
  imageButton: {
    position: "absolute",
    paddingTop: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.common.white,
  },
  imageSrc: {
    position: "absolute",

    backgroundSize: "cover",
    backgroundPosition: "center 40%",
  },
  imageBackdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.palette.common.black,
    opacity: 0.4,
    transition: theme.transitions.create("opacity"),
  },
  imageTitle: {
    position: "relative",
    padding: `${theme.spacing(2)}px ${theme.spacing(4)}px ${
      theme.spacing(1) + 6
    }px`,
  },
  imageMarked: {
    height: 3,
    width: 20,
    backgroundColor: theme.palette.common.white,
    position: "absolute",
    bottom: -2,
    left: "calc(50% - 9px)",
    transition: theme.transitions.create("opacity"),
  },
  boxMsg: {
    backgroundColor: theme.palette.common.white,
  },
});

class PayBox extends Component {
  constructor(props) {
    super(props);
    this.setPayType = this.setPayType.bind(this);
  }

  setPayType(paytype) {
    this.props.pageStatus.actStep = 2;
    this.props.pageStatus.payType = paytype;
  }

  render() {
    const { classes, item, bakeAction } = this.props;

    return (
      <div className={classes.root}>
        <Box display="flex" height="350px" width="150px">
          <Box flexGrow={1}>
            <ButtonBase
              focusRipple
              key={"wavePay"}
              className={classes.image}
              focusVisibleClassName={classes.focusVisible}
              onClick={() => {
                popSfx.play();
                this.setPayType(1);
              }}
            >
              <Box height="350px">
                <Box
                  display="flex"
                  flexWrap="wrap"
                  justifyContent="space-around"
                  paddingLeft="20px"
                  paddingTop="20px"
                  alignItems="center"
                  width="70%"
                >
                  <GridList
                    cellHeight={40}
                    className={classes.gridList}
                    cols={2}
                  >
                    {waves.map((items) => (
                      <GridListTile key={items.img} cols={items.cols}>
                        <img src={items.img} alt={items.title} />
                      </GridListTile>
                    ))}
                  </GridList>
                </Box>

                <Box paddingTop="100px">
                  <img
                    src={CardPay}
                    alt={<Translate value={"wavePay"} />}
                    className={classes.itemImg}
                    width="80px"
                    height="80px"
                  />
                </Box>
              </Box>
              <span className={classes.imageBackdrop} />
              <span className={classes.imageButton}>
                <Typography variant="h4" className={classes.imageTitle}>
                  <Translate value={"wavePay"} />
                  <span className={classes.imageMarked} />
                </Typography>
              </span>
            </ButtonBase>
          </Box>

          <Box flexGrow={1} paddingLeft="20px">
            <Box>
              <ButtonBase
                focusRipple
                key={"wavePay"}
                className={classes.image}
                focusVisibleClassName={classes.focusVisible}
                style={{ height: "170px" }}
                onClick={() => {
                  popSfx.play();
                  this.setPayType(2);
                }}
              >
                <Box height="170px">
                  <Box
                    display="flex"
                    flexWrap="wrap"
                    justifyContent="space-around"
                    paddingLeft="20px"
                    paddingTop="20px"
                    alignItems="center"
                    width="75%"
                  >
                    <GridList
                      cellHeight={40}
                      className={classes.gridList}
                      cols={2}
                    >
                      {esvc.map((items) => (
                        <GridListTile key={items.img} cols={items.cols}>
                          <img src={items.img} alt={items.title} />
                        </GridListTile>
                      ))}
                    </GridList>
                  </Box>
                </Box>
                <span className={classes.imageBackdrop} />
                <span className={classes.imageButton}>
                  <Typography variant="h5" className={classes.imageTitle}>
                    <Translate value={"esvcPay"} />
                    <span className={classes.imageMarked} />
                  </Typography>
                </span>
              </ButtonBase>
            </Box>
            <Box paddingTop="10px">
              <ButtonBase
                focusRipple
                key={"wavePay"}
                className={classes.image}
                focusVisibleClassName={classes.focusVisible}
                style={{ height: "170px" }}
                onClick={() => {
                  popSfx.play();
                  this.setPayType(3);
                }}
              >
                <Box height="170px">
                  <Box
                    display="flex"
                    flexWrap="wrap"
                    justifyContent="space-around"
                    paddingLeft="30px"
                    paddingTop="20px"
                    alignItems="center"
                    width="60%"
                  >
                    <GridList
                      cellHeight={40}
                      className={classes.gridList}
                      cols={1}
                    >
                      {unipay.map((items) => (
                        <GridListTile key={items.img} cols={items.cols}>
                          <img src={items.img} alt={items.title} />
                        </GridListTile>
                      ))}
                    </GridList>
                  </Box>
                </Box>
                <span className={classes.imageBackdrop} />
                <span className={classes.imageButton}>
                  <Typography variant="h5" className={classes.imageTitle}>
                    <Translate value={"uniPay"} />
                    <span className={classes.imageMarked} />
                  </Typography>
                </span>
              </ButtonBase>
            </Box>
          </Box>
          <Box paddingLeft="20px">
            <ButtonBase
              focusRipple
              key={"barcodePay"}
              className={classes.image}
              focusVisibleClassName={classes.focusVisible}
              onClick={() => {
                popSfx.play();
                this.setPayType(4);
              }}
            >
              <Box height="350px">
                <Box
                  display="flex"
                  flexWrap="wrap"
                  justifyContent="space-around"
                  paddingLeft="30px"
                  paddingTop="20px"
                  alignItems="center"
                  width="65%"
                >
                  <GridList
                    cellHeight={40}
                    className={classes.gridList}
                    cols={2}
                  >
                    {codes.map((items) => (
                      <GridListTile key={items.img} cols={items.cols}>
                        <img src={items.img} alt={items.title} />
                      </GridListTile>
                    ))}
                  </GridList>
                </Box>

                <Box paddingTop="100px">
                  <img
                    src={CodePay}
                    alt={<Translate value={"barcodePay"} />}
                    className={classes.itemImg}
                    width="80px"
                    height="80px"
                  />
                </Box>
              </Box>
              <span className={classes.imageBackdrop} />
              <span className={classes.imageButton}>
                <Typography variant="h4" className={classes.imageTitle}>
                  <Translate value={"barcodePay"} />
                  <span className={classes.imageMarked} />
                </Typography>
              </span>
            </ButtonBase>
          </Box>

          <Box paddingLeft="20px">
            <ButtonBase
              focusRipple
              key={"coinPay"}
              className={classes.image}
              focusVisibleClassName={classes.focusVisible}
              onClick={() => {
                popSfx.play();
                this.setPayType(5);
              }}
            >
              <Box>
                <Box paddingLeft="30px">
                  <Grid item xs={9} align="center">
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
                <Box paddingTop="130px">
                  <img
                    src={CoinPay}
                    alt={<Translate value={"coinPay"} />}
                    className={classes.itemImg}
                    width="80px"
                    height="80px"
                  />
                </Box>
              </Box>
              <span className={classes.imageBackdrop} />
              <span className={classes.imageButton}>
                <Typography variant="h4" className={classes.imageTitle}>
                  <Translate value={"coinPay"} />
                  <span className={classes.imageMarked} />
                </Typography>
              </span>
            </ButtonBase>
          </Box>
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
)(withStyles(styles)(PayBox));
