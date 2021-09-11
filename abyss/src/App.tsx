import React, { Component } from "react";
import logo from "./logo.png";
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
import Game from "./pages/Game/Game";
import Profile from "./pages/Profile/Profile";

class App extends Component {
  render() {
    return (
      <div>
        <Router >
          <Switch>
            <Route path="/registration" component={Registration}></Route>
            <Route path="/profile" component={Profile}></Route>
            <Route path="/game" component={Game}></Route>
            <Route path="/menu" component={Menu}></Route>
            <Route path="/" component={Login}></Route>
          </Switch>
        </Router >
      </div>
    );
  }
}

export default App;
