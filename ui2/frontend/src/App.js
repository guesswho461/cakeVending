import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import "./App.css";

import HomeLayout from "./layouts/Home";
import EmptyLayout from "./layouts/Empty";
import RootPage from "./components/RootPage";

const NotFound = () => {
  return <div>NotFound</div>;
};

const RootRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(matchProps) => (
        <HomeLayout>
          <Component {...matchProps} />
        </HomeLayout>
      )}
    />
  );
};

const EmptyRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(matchProps) => (
        <EmptyLayout>
          <Component {...matchProps} />
        </EmptyLayout>
      )}
    />
  );
};

class App extends Component {
  handleContextMenu = (event) => {
    event.preventDefault();
  };

  componentDidMount() {
    document.addEventListener("contextmenu", this.handleContextMenu);
  }

  render() {
    return (
      <Router>
        <Switch>
          <RootRoute exact path="/" component={RootPage} />
          <EmptyRoute component={NotFound} />
        </Switch>
      </Router>
    );
  }
}

export default App;
