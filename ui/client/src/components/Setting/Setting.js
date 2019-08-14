import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Switch from "@material-ui/core/Switch";

import PaletteIcon from "@material-ui/icons/Palette";
import CompareArrowsIcon from "@material-ui/icons/CompareArrows";

import { toggleThemeMode, swapThemeColors } from "../../store/reducers/setting";

class Setting extends React.Component {
  render() {
    return (
      <List>
        <ListItem>
          <ListItemIcon>
            <PaletteIcon />
          </ListItemIcon>
          <ListItemText primary="Dark Mode" />
          <ListItemSecondaryAction>
            <Switch
              onChange={(e, checked) => this.props.toggleThemeMode(checked)}
              checked={this.props.setting.darkMode}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CompareArrowsIcon />
          </ListItemIcon>
          <ListItemText primary="Swap Colors" />
          <ListItemSecondaryAction>
            <Switch
              onChange={(e, checked) => this.props.swapThemeColors(checked)}
              checked={this.props.setting.colorsSwaped}
            />
          </ListItemSecondaryAction>
        </ListItem>

      </List>
    );
  }
}

const mapStateToProps = state => {
  return {
    setting: state.setting
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      toggleThemeMode: checked => toggleThemeMode(checked),
      swapThemeColors: checked => swapThemeColors(checked),
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Setting);
