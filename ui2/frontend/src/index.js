import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { Provider } from "react-redux";
import {
  loadTranslations,
  setLocale,
  syncTranslationWithStore,
} from "react-redux-i18n";

import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

import { Connector } from "mqtt-react";

import store from "./store";
import translationsObject from "./language";

const THEME = createMuiTheme({
  typography: {
    fontFamily: `"Microsoft JhengHei", "Noto Sans TC", "Arial", sans-serif`,
  },
});

ReactDOM.render(
  <Connector mqttProps={"ws://" + window.location.hostname + ":8000"}>
    <MuiThemeProvider theme={THEME}>
      <Provider store={store}>
        <App />
      </Provider>
    </MuiThemeProvider>
  </Connector>,
  document.getElementById("root")
);

syncTranslationWithStore(store);
store.dispatch(loadTranslations(translationsObject));
store.dispatch(setLocale("tw"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
