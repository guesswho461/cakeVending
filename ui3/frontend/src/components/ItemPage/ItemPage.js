import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CardActionArea from "@material-ui/core/CardActionArea";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import Box from "@material-ui/core/Box";

import items from "../../items";
import { setCheckoutDlgOpen } from "../../store/reducers/pageStatus";
import { FlashTouchAppIcon } from "../PageBase/PageBaseFunction";

import UIfx from "uifx";
import pop from "../../sounds/pop.flac";

const popSfx = new UIfx(pop);

const girdCellWidth = 300;

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    display: "flex",
    justifyContent: "center",
  },
  item: {
    width: girdCellWidth,
    height: girdCellWidth,
  },
  gridTitle: {
    height: 130,
  },
  itemImg: {
    width: "100%",
    objectFit: "contain",
  },
});

class ItemPage extends Component {
  constructor(props) {
    super(props);
    this.setPayValue = this.setPayValue.bind(this);
  }

  setPayValue(payValue) {
    this.props.pageStatus.actStep = 1;
    this.props.pageStatus.payableValue = payValue;
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <GridList
          cellHeight={girdCellWidth}
          cellWidth={girdCellWidth}
          spacing={30}
        >
          {items.map((item) => (
            <GridListTile key={item.img} cols={item.featured ? 2 : 1}>
              <CardActionArea
                className={classes.item}
                onClick={() => {
                  popSfx.play();
                  //this.props.setCheckoutDlgOpen(item);
                  this.setPayValue(item.price);
                }}
                disableRipple={true}
                disableTouchRipple={true}
              >
                <img
                  src={item.img}
                  alt={<Translate value={item.title} />}
                  className={classes.itemImg}
                />
                <GridListTileBar
                  className={classes.gridTitle}
                  title={
                    <Typography variant="h2">
                      <Box
                        fontWeight="fontWeightBold"
                        display="flex"
                        alignItems="center"
                      >
                        <Box flexGrow={1}>
                          <Translate value={item.title} />
                        </Box>
                        <Box>
                          <Translate
                            value={item.priceStr}
                            style={{
                              fontSize: 50,
                            }}
                          />
                        </Box>
                      </Box>
                    </Typography>
                  }
                  subtitle={
                    <Typography variant="h4">
                      <Box
                        display="flex"
                        // justifyContent="flex-start"
                        alignItems="center"
                      >
                        <Box flexGrow={1}>
                          <Translate value={item.subtitle} />
                        </Box>
                        <Box>
                          <FlashTouchAppIcon
                            style={{
                              fontSize: 50,
                              transform: "rotate(-45deg)",
                            }}
                          />
                        </Box>
                      </Box>
                    </Typography>
                    // <Typography variant="h5">
                    //   <Translate value={item.subtitle} />
                    // </Typography>
                  }
                ></GridListTileBar>
              </CardActionArea>
              {/* // </Button> */}
            </GridListTile>
          ))}
        </GridList>
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
  return bindActionCreators(
    {
      setCheckoutDlgOpen: (data) => setCheckoutDlgOpen(data),
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ItemPage));
