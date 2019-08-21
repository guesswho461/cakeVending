import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import setting from "./setting";
import authenticate from "./authenticate";
import checkoutItem from "./checkoutItem";
import checkoutStep from "./checkoutStep";
import mqttTopics from "./mqttTopics";
import recipe from "./recipe";
import uiInfo from "./uiInfo";

const reducers = combineReducers({
  setting,
  authenticate,
  checkoutItem,
  checkoutStep,
  mqttTopics,
  recipe,
  uiInfo,
  form: formReducer
});

export default reducers;
