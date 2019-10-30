import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from "react-router-dom";
import { connect } from "react-redux";

import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiThemeProvider } from "@material-ui/core/styles";

import MainLayout from "./layouts/MainLayout";
import EmptyLayout from "./layouts/EmptyLayout";

// import Home from "./components/Home";
import EngineerMode from "./components/EngineerMode";
import Footer from "./components/Footer";
// import Home2 from "./components/Home2";
import Home3 from "./components/Home3";

const DashboardRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={matchProps => (
        <MainLayout>
          <Component {...matchProps} />
          <Footer />
        </MainLayout >
      )}
    />
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
  render() {
    return (
      <MuiThemeProvider theme={this.props.setting.theme}>
        <CssBaseline />
        <div style={{ height: "100vh" }}>
          <Router>
            <Switch>
              <DashboardRoute path="/home" component={Home3} />
              <DashboardRoute exact path="/" component={Home3} />
              <DashboardRoute path="/engineerMode" component={EngineerMode} />
              <Redirect to="/home" />
            </Switch>
          </Router>
        </div>
      </MuiThemeProvider>
    );
  }
}

App.propTypes = {};

const mapStateToProps = state => {
  return {
    setting: state.setting,
    authenticate: state.authenticate
  };
};

export default connect(
  mapStateToProps,
  null
)(App);
