import { createStore, applyMiddleware } from "redux";
import logger from "redux-logger";
import { composeWithDevTools } from 'redux-devtools-extension';

import rootReducer from "./reducers";

// Put the list of third part plugins in an array 
const middleWares = [
  logger,
];

export default createStore(rootReducer, applyMiddleware(...middleWares), composeWithDevTools());
