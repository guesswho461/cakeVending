import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";

import HomeLayout from "./layouts/Home";
import EmptyLayout from "./layouts/Empty";
import MainPage from "./components/MainPage";
import ADPage from "./components/ADPage";

const NotFound = () => {
  return <div>NotFound</div>;
};

const HomeRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={matchProps => (
        <HomeLayout>
          <Component {...matchProps} />
        </HomeLayout>
      )}
    />
  );
};

const ADRoute = ({ component: Component, ...rest }) => {
  return (
    <Route {...rest} render={matchProps => <Component {...matchProps} />} />
  );
};

const EmptyRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={matchProps => (
        <EmptyLayout>
          <Component {...matchProps} />
        </EmptyLayout>
      )}
    />
  );
};

class App extends Component {
  handleContextMenu = event => {
    event.preventDefault();
  };

  componentDidMount() {
    document.addEventListener("contextmenu", this.handleContextMenu);
  }

  render() {
    return (
      <Router>
        <Switch>
          <ADRoute exact path="/" component={ADPage} />
          <HomeRoute exact path="/home" component={MainPage} />
          <EmptyRoute component={NotFound} />
        </Switch>
      </Router>
    );
  }
}

export default App;
