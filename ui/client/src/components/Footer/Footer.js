import React from "react";
import { connect } from "react-redux";

import { withStyles } from "@material-ui/core/styles";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import companyInfo from '../../companyInfo';

const styles = theme => ({
  footer: {
    marginTop: theme.spacing.unit * 8,
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: `${theme.spacing.unit * 6}px 0`,
    textAlign: 'center',
  },
  footerLogo: {
    margin: 'auto',
    display: 'block',
    width: 32,
    height: 32,
  },
  footerQRCode: {
    margin: 'auto',
    display: 'block',
    width: 128,
    height: 128,
  },
});

const Footer = props => {
  const { classes } = props;
  return (
    <div className={classes.footer}>
      <Grid container spacing={32} justify="space-evenly">
        {companyInfo.footers.map(footer => (
          <Grid item xs key={footer.title}>
            <Typography variant="h6" color="textPrimary" gutterBottom>
              {footer.logo.map(item => (
                <img src={item}
                  title={footer.title}
                  className={classes.footerLogo}
                  alt={footer.title}
                  key={item} />
              ))}
            </Typography>
            {footer.qrCode.map(item => (
              <img src={item}
                title={footer.title}
                className={classes.footerQRCode}
                alt={footer.description}
                key={item} />
            ))}
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default connect(
  null,
  null
)(withStyles(styles)(Footer));
