import React from "react";
import { connect } from "react-redux";

import { withStyles } from "@material-ui/core/styles";
import TextField from '@material-ui/core/TextField';

import QRCode from 'react-qr-code';

const styles = theme => ({
  QRCodeImg: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing.unit * 4,
  },
  textField: {
    paddingRight: theme.spacing.unit,
  },
});

class QRCodeGen extends React.Component {
  state = {
    text: 'test',
  }

  handleTextChange = (event) => {
    this.setState({
      text: event.target.value,
    })
  };

  render() {
    const { classes } = this.props;

    return (
      <div>
        <TextField
          id="standard-name"
          label="content"
          className={classes.textField}
          value={this.state.text}
          onChange={this.handleTextChange}
          margin="normal"
          fullWidth
        />
        <div className={classes.QRCodeImg}>
          <QRCode value={this.state.text} />
        </div>
      </div>
    );
  }
};

export default connect(
  null,
  null,
)(withStyles(styles)(QRCodeGen));
