import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import companyInfo from "../../companyInfo";

import { getVersion } from "../../store/reducers/uiInfo";

const styles = theme => ({
  footer: {
    marginTop: theme.spacing.unit * 4,
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: `${theme.spacing.unit * 2}px 0`,
    textAlign: "center"
  },
  footerLogo: {
    margin: "auto",
    display: "block",
    width: 32,
    height: 32
  },
  footerQRCode: {
    margin: "auto",
    display: "block",
    width: 128,
    height: 128
  }
});

class Footer extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.footer}>
        <Grid container spacing={32} justify="space-evenly">
          {companyInfo.footers.map(footer => (
            <Grid item xs key={footer.title}>
              <Typography variant="h6" color="textPrimary" gutterBottom>
                {footer.logo.map(item => (
                  <img
                    src={item}
                    title={footer.title}
                    className={classes.footerLogo}
                    alt={footer.title}
                    key={item}
                  />
                ))}
              </Typography>
              {footer.qrCode.map(item => (
                <img
                  src={item}
                  title={footer.title}
                  className={classes.footerQRCode}
                  alt={footer.description}
                  key={item}
                />
              ))}
            </Grid>
          ))}
        </Grid>
        <Typography variant="h6" color="textPrimary" gutterBottom>
          {this.props.version}
        </Typography>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    version: state.version
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      getVersion: () => getVersion()
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Footer));
