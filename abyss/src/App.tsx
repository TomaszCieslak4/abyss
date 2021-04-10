import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useHistory,
} from "react-router-dom";
import Login from "./pages/Login/Login";
import Registration from "./pages/Registration/Registration";
import Menu from "./pages/Menu/Menu";
import Profile from "./pages/Profile/Profile";

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/registration" component={Registration}></Route>
            <Route path="/profile" component={Profile}></Route>
            <Route path="/menu" component={Menu}></Route>
            <Route path="/" component={Login}></Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
