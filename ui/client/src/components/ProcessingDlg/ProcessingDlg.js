import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import Slide from "@material-ui/core/Slide";
import CircularProgress from "@material-ui/core/CircularProgress";

import { handleSubscribeTopics } from "../../store/reducers/mqttTopics";

import { subscribe } from "mqtt-react";
import store from "../../store";
import CountDown from "react-number-count-down";

const styles = theme => ({
  button: {
    marginRight: theme.spacing.unit
  },
  instructions: {
    // marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit
  },
  progress: {
    textAlign: "center"
  }
});

function dlgTransition(props) {
  return <Slide direction="down" {...props} />;
}

class ProcessingDlg extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <Dialog
        fullWidth={true}
        maxWidth={"lg"}
        TransitionComponent={dlgTransition}
        open={this.props.mqttTopics.processingDlgOpen}
      >
        <DialogTitle>
          {this.props.mqttTopics.recipeDone ? (
            <Typography align="center" variant="h3" gutterBottom>
              已完成, 請取餐
            </Typography>
          ) : (
            <Typography align="center" variant="h3" gutterBottom>
              製作中, 請稍待...
              {/* <CountDown
                from={3}
                to={0}
                type={"-"}
                addon={"秒後完成"}
                interval={1}
              /> */}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent className={classes.progress}>
          {this.props.mqttTopics.recipeDone ? (
            <div></div>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
      </Dialog>
    );
  }
}

const mapStateToProps = state => {
  return {
    mqttTopics: state.mqttTopics
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({}, dispatch);
};

const mqttTopicsSubscribeDispatch = function(topic, message, packet) {
  store.dispatch(handleSubscribeTopics("gate", topic, message));
};

export default subscribe({
  topic: "gate/#",
  dispatch: mqttTopicsSubscribeDispatch
})(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(ProcessingDlg))
);
