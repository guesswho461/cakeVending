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

import items from "../../items";
import { setCheckoutDlgOpen } from "../../store/reducers/pageStatus";

const girdCellHeight = 320;

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    display: "flex",
    justifyContent: "center",
  },
  item: {
    height: girdCellHeight,
  },
  gridList: {
    width: "100vh",
  },
  gridTitle: {
    height: 128,
  },
});

class ItemPage extends Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <GridList cellHeight={girdCellHeight} className={classes.gridList}>
          {items.map((item) => (
            <GridListTile key={item.img}>
              <CardActionArea
                className={classes.item}
                onClick={() => {
                  this.props.setCheckoutDlgOpen();
                }}
                disableRipple={true}
                disableTouchRipple={true}
              >
                <img src={item.img} alt={<Translate value={item.title} />} />
                <GridListTileBar
                  className={classes.gridTitle}
                  title={
                    <Typography variant="h3">
                      <Translate value={item.title} />
                    </Typography>
                  }
                  subtitle={
                    <Typography variant="h5">
                      <Translate value={item.subtitle} />
                    </Typography>
                  }
                />
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
      setCheckoutDlgOpen: () => setCheckoutDlgOpen(),
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ItemPage));
