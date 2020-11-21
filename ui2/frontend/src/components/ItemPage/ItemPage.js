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

const girdCellWidth = 480;

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
    height: 200,
  },
  itemImg: {
    width: "100%",
    objectFit: "contain",
  },
});

class ItemPage extends Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <GridList cellHeight={girdCellWidth} cellWidth={girdCellWidth}>
          {items.map((item) => (
            <GridListTile key={item.img}>
              <CardActionArea
                className={classes.item}
                onClick={() => {
                  popSfx.play();
                  this.props.setCheckoutDlgOpen(item);
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
                    <Typography variant="h1">
                      <Box fontWeight="fontWeightBold">
                        <Translate value={item.title} />
                      </Box>
                    </Typography>
                  }
                  subtitle={
                    <Typography variant="h5">
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
                              fontSize: 48,
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
  return {};
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
