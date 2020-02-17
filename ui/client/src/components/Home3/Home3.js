import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CardActionArea from "@material-ui/core/CardActionArea";

import StarIcon from "@material-ui/icons/StarBorder";

import { setCheckoutDlgOpen } from "../../store/reducers/checkout";

import productList from "../../productList";
import companyInfo from "../../companyInfo";

const styles = theme => ({
  cardPricing: {
    display: "inline-block"
  },
  cardImg: {
    display: "flex"
  }
});

class Home3 extends React.Component {
  state = {};

  render() {
    const { classes } = this.props;
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Card>
          <CardActionArea
            onClick={() => {
              this.props.setCheckoutDlgOpen();
            }}
          >
            <CardHeader
              title={productList[0].title}
              titleTypographyProps={{ align: "center" }}
              action={productList[0].favorite === "yes" ? <StarIcon /> : null}
            />
            <CardMedia
              component="img"
              title={productList[0].title}
              alt={productList[0].title}
              image={productList[0].img}
              className={classes.cardImg}
            />
            <CardContent className={classes.content}>
              <Typography
                variant="h3"
                color="textPrimary"
                className={classes.cardPricing}
                gutterBottom
              >
                {companyInfo.currency}${productList[0].unitPrice}
              </Typography>
              <Typography
                variant="h6"
                color="textSecondary"
                className={classes.cardPricing}
                gutterBottom
              >
                /{productList[0].unit}
              </Typography>
              {productList[0].description.map(line => (
                <Typography
                  variant="subtitle1"
                  align="left"
                  key={line}
                  gutterBottom
                >
                  {line}
                </Typography>
              ))}
            </CardContent>
          </CardActionArea>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      setCheckoutDlgOpen: () => setCheckoutDlgOpen()
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Home3));
