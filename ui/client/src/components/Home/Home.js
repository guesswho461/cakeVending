import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { withStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Grid from '@material-ui/core/Grid';
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import Fab from '@material-ui/core/Fab';

import StarIcon from '@material-ui/icons/StarBorder';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

import {
  checkoutItemInc,
  checkoutItemDec
} from "../../store/reducers/checkoutItem";

import productList from '../../productList';
import companyInfo from '../../companyInfo'

const styles = ({
  cardPricing: {
    display: 'inline-block',
  },
  cardActions: {
    justifyContent: "flex-end",
  },
});

const Home = props => {
  const { classes } = props;
  return (
    <div>
      <Typography
        variant="h2"
        align="center"
        style={{ marginTop: 12 }}
        gutterBottom>
        今天想吃哪種口味呢？
      </Typography>
      <Grid container spacing={40} alignItems="flex-end">
        {productList.map(product => (
          <Grid item key={product.title} xs={12} sm={product.title === 'Enterprise' ? 12 : 6} md={4}>
            <Card>
              <CardHeader
                title={product.title}
                titleTypographyProps={{ align: 'center' }}
                action={product.favorite === 'yes' ? <StarIcon /> : null} />
              <CardMedia
                component="img"
                title={product.title}
                alt={product.title}
                image={product.img} />
              <CardContent>
                <Typography
                  variant="h3"
                  color="textPrimary"
                  className={classes.cardPricing}
                  gutterBottom>
                  {companyInfo.currency}${product.unitPrice}
                </Typography>
                <Typography
                  variant="h6"
                  color="textSecondary"
                  className={classes.cardPricing}
                  gutterBottom>
                  /{product.unit}
                </Typography>
                {product.description.map(line => (
                  <Typography variant="subtitle1" align="left" key={line} gutterBottom>
                    {line}
                  </Typography>
                ))}
              </CardContent>
              <CardActions className={classes.cardActions}>
                <Fab size="small" color="primary" aria-label="Add" onClick={() => props.checkoutItemInc(product)}>
                  {/* <Fab size="small" color="primary" aria-label="Add"> */}
                  <AddIcon />
                </Fab>
                <Fab size="small" color="primary" aria-label="Remove" onClick={() => props.checkoutItemDec(product)}>
                  {/* <Fab size="small" color="primary" aria-label="Remove"> */}
                  <RemoveIcon />
                </Fab>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div >
  );
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      checkoutItemInc: (data) => checkoutItemInc(data),
      checkoutItemDec: (data) => checkoutItemDec(data)
    },
    dispatch
  );
};

export default connect(
  null,
  mapDispatchToProps
)(withStyles(styles)(Home));
