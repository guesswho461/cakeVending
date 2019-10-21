import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles } from "@material-ui/core/styles";
import Button from '@material-ui/core/Button';

import linepayIcon from './../../imgs/linepay.png'
import contactlessIcon from './../../imgs/contactless_symb_pos.png'
import coinInsertIcon from './../../imgs/insert-icon-20.jpg'

const styles = theme => ({
  paymentButton: {
    width: 150,
    height: 150,
  },
  paymentIcon: {
    width: '100%',
  },
});

const payments = [
  {
    icon: [linepayIcon],
    title: 'LINE pay',
    width: '100%',
  },
  {
    icon: [contactlessIcon],
    title: 'VISA Paywave',
    width: '100%',
  },
  {
    icon: [coinInsertIcon],
    title: 'VISA Paywave',
    width: '100%',
  },
];

class Payment extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      payments.map(payment => (
        <Button color="primary" className={classes.paymentButton}>
          <img
            className={classes.paymentIcon}
            title={payment.title}
            alt={payment.title}
            src={payment.icon} />
        </Button>
      ))
    );
  }
};

const mapStateToProps = state => {
  return {
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Payment));
