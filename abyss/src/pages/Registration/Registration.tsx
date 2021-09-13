import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  PropTypes,
  Radio,
  RadioGroup,
  TextField,
} from "@material-ui/core";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import { PORT } from "../../config";

interface MyState {
  username: string;
  password: string;
  confirmPassword: string;
  checkbox: string;
  errors: string[];
  success: string[];
}

interface MyProp extends RouteComponentProps<any> { }
class Registration extends Component<MyProp, MyState> {
  constructor(props: MyProp) {
    super(props);
    this.state = {
      username: "",
      password: "",
      confirmPassword: "",
      checkbox: "",
      errors: [],
      success: [],
    };
    this.handleChange = this.handleChange.bind(this);
    this.register = this.register.bind(this);
  }

  // componentDidMount() {}
  // componentWillUnmount() {}

  handleChange(event: any) {
    //@ts-ignore
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  async register() {
    let errors: string[] = [];
    let success: string[] = [];

    if (this.state.password !== this.state.confirmPassword) {
      errors.push("Passwords are not the same.");
    }
    if (this.state.username === "") {
      errors.push("Please enter a username.");
    }
    else if (
      this.state.username.length < 3 ||
      this.state.username.length > 20 ||
      this.state.username.match(/^[a-zA-Z0-9]+$/) === null
      ) {
        errors.push("Username should be between 3-20 characters or numbers.");
      }
      if (this.state.password === "") {
        errors.push("Please enter a password.");
      }
      else if (
        this.state.password.length < 8 ||
        this.state.password.match(/^[a-zA-Z0-9]+$/) === null
        ) {
          errors.push(
            "Passwords should be at least 8 characters or numbers."
            );
          }
      if (this.state.checkbox === "") {
        errors.push("Please accept the terms of service.");
      }
    if (errors.length === 0) {
      const result = await fetch(`http://${window.location.hostname}:${PORT}/api/nouser/register`, {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            btoa(
              this.state.username +
              ":" +
              this.state.password
            ),
        },
      });
      var body = await result.json();
      if (result.status === 200) {
        success.push(body.message);
        const result = await fetch(
          `http://${window.location.hostname}:${PORT}/api/auth/login`,
          {
            method: "POST",
            headers: {
              Authorization:
                "Basic " + btoa(this.state.username + ":" + this.state.password),
            },
          }
        );
        var body = await result.json();
        if (result.status === 200) {
          localStorage.setItem("username", this.state.username);
          //@ts-ignore
          this.props.history.push("/menu");
        } else {
        errors.push(body.error);
      }
      } else {
        errors.push(body.error);
      }
    }
    if (errors.length > 0 || success.length > 0) {
      this.setState({
        errors: errors,
        success: success,
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
          <h2>Sign Up</h2>
          <div className="input-wrapper">
            <TextField
              name="username"
              onChange={this.handleChange}
              label="New Username"
              type="text"
              variant="filled"
              className="textfield"
            />
          </div>
          <div className="input-wrapper">
            <TextField
              name="password"
              onChange={this.handleChange}
              label="New Password"
              type="password"
              autoComplete="current-password"
              variant="filled"
              className="textfield"
            />
          </div>
          <div className="input-wrapper">
            <TextField
              name="confirmPassword"
              onChange={this.handleChange}
              label="Confirm New Password"
              type="password"
              autoComplete="current-password"
              variant="filled"
              className="textfield"
            />
          </div>
          <FormControlLabel
            label="I will not cheat: "
            labelPlacement="start"
            control={
              <Checkbox
                name="checkbox"
                onChange={this.handleChange}
                value={this.state.checkbox === "" ? "checked" : ""}
                color="primary"
              />
            }
          />
          <Button
            type="submit"
            variant="contained"
            onClick={this.register}
            color="primary"
          >
            Register Account
          </Button>
          <Button
            variant="contained"
            onClick={() => this.props.history.push("/")}
          >
            Already have an account? Log In
          </Button>
          <div id="err">
            {this.state.errors.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>
          <div id="success">
            {this.state.success.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>
        </form>
      </div>
    );
  }
}

export default Registration;
