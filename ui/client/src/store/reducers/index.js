import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import setting from "./setting";
import authenticate from "./authenticate";
import checkoutItem from "./checkoutItem";
import checkoutStep from "./checkoutStep";
import mqttTopics from "./mqttTopics";
import recipe from "./recipe";
import uiInfo from "./uiInfo";
import checkout from "./checkout";

const reducers = combineReducers({
  setting,
  authenticate,
  checkoutItem,
  checkoutStep,
  mqttTopics,
  recipe,
  uiInfo,
  checkout,
  form: formReducer
});

export default reducers;
