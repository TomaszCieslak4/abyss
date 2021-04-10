import { Button, TextField } from "@material-ui/core";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import "../../App.css";
import { PORT } from "../../config";

interface MyState {
  username: string;
  password: string;
  errors: string[];
}
interface MyProp extends RouteComponentProps<any> { }

class Login extends Component<MyProp, MyState> {
  constructor(props: MyProp) {
    super(props);
    this.state = {
      username: "",
      password: "",
      errors: [],
    };
    this.handleChange = this.handleChange.bind(this);
    this.login = this.login.bind(this);
  }

  handleChange(event: any) {
    //@ts-ignore
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  async login() {
    let errors: string[] = [];

    if (this.state.username === "") {
      errors.push("Please enter a username.");
    }
    if (this.state.password === "") {
      errors.push("Please enter a password.");
    }
    if (errors.length === 0) {
      const result = await fetch(`http://${window.location.hostname}:${PORT}/api/auth/login`, {
        method: "POST",
        headers: {
          Authorization:
            "Basic " + btoa(this.state.username + ":" + this.state.password),
        },
      });
      var body = await result.json();
      if (result.status === 200) {
        localStorage.setItem("username", this.state.username);
        //@ts-ignore
        this.props.history.push("/menu");
      } else {
        errors.push(body.error);
      }
    }
    if (errors.length > 0) {
      this.setState({
        errors: errors,
      });
    }
  }
  handleSubmit = (e: any) => {
    e.preventDefault();
  };

  render() {
    return (
      <div className="gradborder">
        <form className="center-screen" onSubmit={this.handleSubmit}>
          <h2>Log In</h2>
          <div className="input-wrapper">
            <TextField
              name="username"
              onChange={this.handleChange}
              label="Username"
              type="text"
              variant="outlined"
              className="textfield"
            />
          </div>
          <div className="input-wrapper">
            <TextField
              name="password"
              onChange={this.handleChange}
              label="Password"
              type="password"
              autoComplete="current-password"
              variant="filled"
              className="textfield"
            />
          </div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={this.login}
          >
            Log in
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={() => this.props.history.push("/Registration")}
          >
            Don't have an account? Register
          </Button>
          <div id="err">
            {this.state.errors.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>
        </form>
      </div>
    );
  }
}
export default Login;
