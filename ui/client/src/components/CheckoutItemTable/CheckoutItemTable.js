import React from 'react';
import { connect } from "react-redux";

import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import companyInfo from '../../companyInfo'

const styles = theme => ({
  root: {
  },
  table: {
  },
});

class CheckoutItemTable extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell align="center">口味</TableCell>
              <TableCell align="right">單價</TableCell>
              <TableCell align="right">數量</TableCell>
              <TableCell align="right">小計</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.checkoutItem.list.map(item => (
              <TableRow key={item.id}>
                <TableCell align="center">{item.title}</TableCell>
                <TableCell align="right">{companyInfo.currency}${item.rawData.unitPrice}</TableCell>
                <TableCell align="right">{item.count}{item.rawData.unit}</TableCell>
                <TableCell align="right">{companyInfo.currency}${item.subtotal}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell rowSpan={0} />
              <TableCell colSpan={2} align="right">總計</TableCell>
              <TableCell align="right">{companyInfo.currency}${this.props.checkoutItem.totalPrice}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    );
  }
};

const mapStateToProps = state => {
  return {
    checkoutItem: state.checkoutItem,
  };
};

export default connect(
  mapStateToProps,
  null
)(withStyles(styles)(CheckoutItemTable));
