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
import { SERVERIP } from "../../config";

interface MyState {
  username: string;
  password: string;
  confirmPassword: string;
  difficulty: string;
  checkbox: string;
  errors: string[];
  success: string[];
}

interface MyProp extends RouteComponentProps<any> {}
class Registration extends Component<MyProp, MyState> {
  constructor(props: MyProp) {
    super(props);
    this.state = {
      username: "",
      password: "",
      confirmPassword: "",
      difficulty: "",
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

    if (this.state.checkbox === "") {
      errors.push("Please select the terms of service.");
    }
    if (this.state.password !== this.state.confirmPassword) {
      errors.push("Passwords are not the same.");
    }
    if (
      this.state.password.length < 8 ||
      this.state.password.match(/^[a-zA-Z0-9]+$/) === null
    ) {
      errors.push(
        "Passwords should be betweeen at least 8 characters or numbers."
      );
    }
    if (
      this.state.username.length < 3 ||
      this.state.username.length > 20 ||
      this.state.username.match(/^[a-zA-Z0-9]+$/) === null
    ) {
      errors.push("Username should be between 3-20 characters or numbers.");
    }
    if (this.state.difficulty === "") {
      errors.push("Please select current skill level.");
    }
    if (this.state.username === "") {
      errors.push("Please enter a username.");
    }
    if (this.state.password === "") {
      errors.push("Please enter a password.");
    }
    if (errors.length === 0) {
      const result = await fetch(SERVERIP + "/api/nouser/register", {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            btoa(
              this.state.username +
                ":" +
                this.state.password +
                ":" +
                this.state.difficulty
            ),
        },
      });
      var body = await result.json();
      if (result.status === 200) {
        success.push(body.message);
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
          <div className="input-wrapper">
            <TextField
              name="confirmPassword"
              onChange={this.handleChange}
              label="Confirm Password"
              type="password"
              autoComplete="current-password"
              variant="filled"
              className="textfield"
            />
          </div>
          <FormControl component="fieldset">
            <FormLabel component="legend">What is you skill level?</FormLabel>
            <RadioGroup row>
              <FormControlLabel
                name="difficulty"
                labelPlacement="top"
                value="noobie"
                control={<Radio />}
                label="Noobie"
                onChange={this.handleChange}
              />
              <FormControlLabel
                name="difficulty"
                value="meh"
                control={<Radio />}
                label="Meh"
                labelPlacement="top"
                onChange={this.handleChange}
              />
              <FormControlLabel
                name="difficulty"
                labelPlacement="top"
                value="pro"
                control={<Radio />}
                label="Pro"
                onChange={this.handleChange}
              />
            </RadioGroup>
          </FormControl>
          <FormControlLabel
            label="I will not cheat: "
            labelPlacement="top"
            control={
              <Checkbox
                name="checkbox"
                onChange={this.handleChange}
                value={this.state.checkbox === "" ? "checked" : ""}
                color="primary"
              />
            }
          />
          <Button type="submit" variant="contained" onClick={this.register}>
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
