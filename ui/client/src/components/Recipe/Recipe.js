import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles } from "@material-ui/core/styles";

import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import SendIcon from '@material-ui/icons/Send';

import {
  handleRecipeStart,
} from "../../store/reducers/recipe";

import ItemListBase from "../ItemListBase";
import {
  getTextBoxAction,
  getButtonAction,
} from "../ItemListBase/ItemFunctions";

const KEY_RECIPE_START = 'recipeStart';
const KEY_RECIPE_NAME = 'recipeName';

const styles = theme => ({
});

function getItemAction(key, cmp) {
  var rt;
  switch (key) {
    default:
      break;
    case KEY_RECIPE_START:
      rt = getButtonAction(
        cmp.props.handleRecipeStart,
        key,
        cmp.state.recipeName,
        <SendIcon />);
      break;
    case KEY_RECIPE_NAME:
      rt = getTextBoxAction(cmp.handleRecipeNameChange);
      break;
  }
  return rt;
}

function getItemData(key, cmp) {
  var rt;
  switch (key) {
    default:
      break;
    case KEY_RECIPE_START:
      rt = cmp.state.recipeName;
      break;
  }
  return rt;
}

const items = [
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: KEY_RECIPE_NAME,
  },
  {
    icon: (<CompareArrowsIcon />),
    unit: '',
    key: KEY_RECIPE_START,
  },
];

class Recipe extends React.Component {
  state = {
    recipeName: 'original',
  };

  handleRecipeNameChange = (event) => {
    this.setState({ recipeName: event.target.value });
  };

  render() {
    return (
      <ItemListBase
        items={items}
        getItemData={getItemData}
        getItemAction={getItemAction}
        childCmp={this} />
    );
  }
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      handleRecipeStart: (arg1) => handleRecipeStart(arg1),
    },
    dispatch
  );
};

export default connect(
  null,
  mapDispatchToProps
)(withStyles(styles)(Recipe));
