import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import { Connector } from 'mqtt-react';

import registerServiceWorker from "./registerServiceWorker";

import App from "./App";
import store from "./store";
import companyInfo from './companyInfo';

ReactDOM.render(
  <Connector mqttProps={companyInfo.brokerURL}>
    <Provider store={store}>
      <App />
    </Provider>
  </Connector >,
  document.getElementById("root")
);

registerServiceWorker();
