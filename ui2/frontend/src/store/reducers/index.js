import { combineReducers } from "redux";
import { i18nReducer } from "react-redux-i18n";

import pageStatus from "./pageStatus";

const reducers = combineReducers({
  i18n: i18nReducer,
  pageStatus
});

export default reducers;
