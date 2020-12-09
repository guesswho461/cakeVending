import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Translate } from "react-redux-i18n";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";

import SendIcon from "@material-ui/icons/Send";
import CloseIcon from "@material-ui/icons/Close";

import {
  setStarRatingDlgClose,
  setStarToThisOrder,
  setThankYouDlgOpen,
} from "../../store/reducers/pageStatus";

import "./starratingpage.css";

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  button: {
    disableRipple: true,
    disableFocusRipple: true,
  },
  paper: {
    padding: theme.spacing(2),
    background: "transparent",
    boxShadow: "none",
    justifyContent: "center",
    display: "flex",
  },
});

function StarIcon(props) {
  const { fill = "none" } = props;
  return (
    <svg
      class="w-6 h-6"
      fill={fill}
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      ></path>
    </svg>
  );
}

function RatingIcon(props) {
  const {
    index,
    rating,
    hoverRating,
    onMouseEnter,
    onMouseLeave,
    onSaveRating,
  } = props;
  const fill = React.useMemo(() => {
    if (hoverRating >= index) {
      return process.env.REACT_APP_LIGHT_BLUE;
    } else if (!hoverRating && rating >= index) {
      return process.env.REACT_APP_LIGHT_BLUE;
    }
    return "#eeeeee";
  }, [rating, hoverRating, index]);
  return (
    <div
      onMouseEnter={() => onMouseEnter(index)}
      onMouseLeave={() => onMouseLeave()}
      onClick={() => onSaveRating(index)}
    >
      <StarIcon fill={fill} />
    </div>
  );
}

class StarRatingPage extends Component {
  constructor(props) {
    super(props);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onSaveRating = this.onSaveRating.bind(this);
  }

  state = {
    rating: 0,
    hoverRating: 0,
  };

  onMouseEnter(index) {
    this.setState({
      hoverRating: index,
    });
  }

  onMouseLeave() {
    this.setState({
      hoverRating: 0,
    });
  }

  onSaveRating(index) {
    this.setState({
      rating: index,
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Typography variant="h2">
                <Translate value={"giveStarQ"} />
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              {/* <div className="box flex"> */}
              {[1, 2, 3, 4, 5].map((index) => {
                return (
                  <RatingIcon
                    index={index}
                    rating={this.state.rating}
                    hoverRating={this.state.hoverRating}
                    onMouseEnter={this.onMouseEnter}
                    onMouseLeave={this.onMouseLeave}
                    onSaveRating={this.onSaveRating}
                  />
                );
              })}
              {/* </div> */}
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper}>
              <Button
                // variant="contained"
                color="primary"
                size="large"
                className={classes.button}
                startIcon={<SendIcon />}
                onClick={() => {
                  this.props.setStarRatingDlgClose();
                  this.props.setStarToThisOrder(this.state.rating);
                  this.props.setThankYouDlgOpen();
                }}
              >
                <Typography variant="h3">
                  <Translate value={"submit"} />
                </Typography>
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper}>
              <Button
                // variant="contained"
                // color="primary"
                size="large"
                className={classes.button}
                startIcon={<CloseIcon />}
                onClick={() => {
                  this.props.setStarRatingDlgClose();
                }}
              >
                <Typography variant="h3">
                  <Translate value={"cancel"} />
                </Typography>
              </Button>
            </Paper>
          </Grid>
        </Grid>
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
      setStarRatingDlgClose: () => setStarRatingDlgClose(),
      setStarToThisOrder: (data) => setStarToThisOrder(data),
      setThankYouDlgOpen: () => setThankYouDlgOpen(),
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(StarRatingPage));
