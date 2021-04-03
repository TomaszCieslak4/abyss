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
import { Link } from "react-router-dom";

interface MyState {
  username: string;
  password: string;
  confirmPassword: string;
  difficulty: string;
  checkbox: string;
}
class Registration extends Component<{}, MyState> {
  constructor(props: any) {
    super(props);
    this.state = {
      username: "",
      password: "",
      confirmPassword: "",
      difficulty: "",
      checkbox: "",
    };
    this.handleChange = this.handleChange.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
  }

  // componentDidMount() {}
  // componentWillUnmount() {}

  handleChange(event: any) {
    //@ts-ignore
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  render() {
    return (
      <div className="gradborder">
        <form className="center-screen">
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
              name="confirmpassword"
              onChange={this.handleChange}
              label="Confirm Password"
              type="password"
              autoComplete="current-password"
              variant="filled"
              className="textfield"
            />
          </div>
          <FormControl component="fieldset">
            <FormLabel component="legend">
              Please select your preferred difficulty:
            </FormLabel>
            <RadioGroup row>
              <FormControlLabel
                name="difficulty"
                labelPlacement="top"
                value="easy"
                control={<Radio />}
                label="Easy"
                onChange={this.handleChange}
              />
              <FormControlLabel
                name="difficulty"
                value="medium"
                control={<Radio />}
                label="Medium"
                labelPlacement="top"
                onChange={this.handleChange}
              />
              <FormControlLabel
                name="difficulty"
                labelPlacement="top"
                value="hard"
                control={<Radio />}
                label="Hard"
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
          <Button variant="contained">Register Account</Button>
          <Link to="/">
            <Button variant="contained">Already have an account? Log In</Button>
          </Link>
        </form>
      </div>
    );
  }
}

export default Registration;
