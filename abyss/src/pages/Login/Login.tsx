import { Button, TextField } from "@material-ui/core";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../../App.css";

interface MyState {
  username: string;
  password: string;
  errors: string[];
}
class Login extends Component<{}, MyState> {
  constructor(props: any) {
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

  // componentDidMount() {
  //   this.setState({
  //     username: "",
  //     password: "",
  //     confirmPassword: "",
  //     difficulty: "",
  //     checkbox: "",
  //   });
  // }

  async login() {
    let errors: string[] = [];

    if (this.state.username === "") {
      errors.push("Please enter a username.");
    }
    if (this.state.password === "") {
      errors.push("Please enter a password.");
    }
    if (errors.length === 0) {
      try {
        const result = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            Authorization:
              "Basic " + btoa(this.state.username + ":" + this.state.password),
          },
        });
        console.log(result);
      } catch (error) {
        console.log(
          "fail " + error.status + " " + JSON.stringify(error.responseJSON)
        );
        errors.push(error.responseJSON.error);
      }
    }

    this.setState({
      errors: errors,
    });
  }

  render() {
    return (
      <div className="gradborder">
        <form className="center-screen">
          <h2>Log In</h2>
          <div className="input-wrapper">
            <TextField
              name="username"
              onChange={this.handleChange}
              label="Username"
              type="text"
              variant="filled"
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
          <Button variant="contained">Log in</Button>
          <Link to="/Registration">
            <Button variant="contained">Don't have an account? Register</Button>
          </Link>
        </form>
      </div>
    );
  }
}
export default Login;
