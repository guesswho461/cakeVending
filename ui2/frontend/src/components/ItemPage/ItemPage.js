import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";

import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CardActionArea from "@material-ui/core/CardActionArea";
import Paper from "@material-ui/core/Paper";
import FormLabel from "@material-ui/core/FormLabel";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import ListSubheader from "@material-ui/core/ListSubheader";
import IconButton from "@material-ui/core/IconButton";
import InfoIcon from "@material-ui/icons/Info";
import tileData from "./tileData";

import demoCake from "../../imgs/demoCake.jpg";

const styles = theme => ({
  root: {
    flexGrow: 1,
    display: "flex",
    justifyContent: "center"
  },
  item: {},
  itemImage: {},
  gridList: {
    width: "100vh"
    // height: "80vh"
  },
  icon: {
    color: "rgba(255, 255, 255, 0.54)"
  }
});

class ItemPage extends Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <GridList cellHeight={180} className={classes.gridList}>
          {/* <GridListTile key="Subheader" cols={2} style={{ height: "auto" }}>
            <ListSubheader component="div">December</ListSubheader>
          </GridListTile> */}
          {tileData.map(tile => (
            <GridListTile key={tile.img}>
              <img src={tile.img} alt={tile.title} />
              <GridListTileBar
                title={tile.title}
                subtitle={
                  <span>
                    <Translate value="cakeUnit" /> {tile.price}
                  </span>
                }
                actionIcon={
                  <IconButton
                    aria-label={`info about ${tile.title}`}
                    className={classes.icon}
                  >
                    <InfoIcon />
                  </IconButton>
                }
              />
            </GridListTile>
          ))}
        </GridList>
        {/* <Grid item xs={12}>
          <Paper className={classes.control}>
            <Grid container>
              <Grid item>
                <FormLabel>
                  <Translate value="originalFlavorTitle" />
                </FormLabel>
                {demoCake}
              </Grid>
            </Grid>
          </Paper>
        </Grid> */}
        {/* <Card className={classes.item}>
          <CardActionArea>
            <CardHeader
              title={
                <Typography variant="h2">
                  <Translate value="originalFlavorTitle" />
                </Typography>
              }
            />
            <CardMedia
              component="img"
              image={demoCake}
              className={classes.itemImage}
            />
            <CardContent className={classes.content}>
              <Typography variant="h6">
                <Translate value="originalFlavorContent" />
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card> */}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({}, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ItemPage));
