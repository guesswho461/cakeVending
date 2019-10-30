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
import Snackbar from "@material-ui/core/Snackbar";

import StarIcon from "@material-ui/icons/StarBorder";

import { setOriginalRecipeStart } from "../../store/reducers/recipe";
import { coinValueDec } from "../../store/reducers/mqttTopics";

import productList from "../../productList";
import companyInfo from "../../companyInfo";

const styles = theme => ({
  cardPricing: {
    display: "inline-block"
  }
});

class Home2 extends React.Component {
  state = {
    moneyNotEnoughNotify: false
  };

  openMoneyNotEnoughNotify = () => {
    this.setState({
      moneyNotEnoughNotify: true
    });
  };

  closeMoneyNotEnoughNotify = () => {
    this.setState({
      moneyNotEnoughNotify: false
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Snackbar
          anchorOrigin={{
            vertical: "top",
            horizontal: "center"
          }}
          open={this.state.moneyNotEnoughNotify}
          autoHideDuration={2000}
          onClose={this.closeMoneyNotEnoughNotify}
          ContentProps={{
            "aria-describedby": "message-id"
          }}
          message={<Typography variant="h3">糟糕！錢好像不夠！</Typography>}
        />
        <Card>
          <CardActionArea
            onClick={() => {
              if (this.props.mqttTopics.coinValue >= productList[0].unitPrice) {
                this.props.coinValueDec(productList[0].unitPrice);
                this.props.setOriginalRecipeStart();
              } else {
                this.openMoneyNotEnoughNotify();
              }
            }}
          >
            <CardHeader
              title={"老闆, 給我一份" + productList[0].title}
              titleTypographyProps={{ align: "center" }}
              action={productList[0].favorite === "yes" ? <StarIcon /> : null}
            />
            <CardMedia
              component="img"
              title={productList[0].title}
              alt={productList[0].title}
              image={productList[0].img}
            />
            <CardContent>
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
  return {
    mqttTopics: state.mqttTopics
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      setOriginalRecipeStart: () => setOriginalRecipeStart(),
      coinValueDec: (data) => coinValueDec(data)
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Home2));
