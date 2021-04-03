import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
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
class Profile extends Component<{}, MyState> {
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
          <h2>Update Profile</h2>
          <div className="input-wrapper">
            <TextField
              disabled
              label="Username (cannot change)"
              variant="filled"
              className="textfield"
            />
          </div>
          <div className="input-wrapper">
            <TextField
              name="password"
              onChange={this.handleChange}
              label="New Password (optional)"
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
          <FormControl component="fieldset">
            <FormLabel component="legend">
              Update difficulty: (optional)
            </FormLabel>
            <RadioGroup row>
              <FormControlLabel
                name="difficulty"
                onChange={this.handleChange}
                labelPlacement="top"
                value="easy"
                control={<Radio />}
                label="Easy"
              />
              <FormControlLabel
                name="difficulty"
                onChange={this.handleChange}
                value="medium"
                control={<Radio />}
                label="Medium"
                labelPlacement="top"
              />
              <FormControlLabel
                name="difficulty"
                onChange={this.handleChange}
                labelPlacement="top"
                value="hard"
                control={<Radio />}
                label="Hard"
              />
            </RadioGroup>
          </FormControl>
          <FormControlLabel
            label="I confirm these changes: (required)"
            labelPlacement="top"
            control={
              <Checkbox
                value={this.state.checkbox === "" ? "checked" : ""}
                name="checkbox"
                color="primary"
                onChange={this.handleChange}
              />
            }
          />
          <Button variant="contained">Update Account</Button>
          <Button variant="contained">Delete Account</Button>
          <Link to="/Menu">
            <Button variant="contained">Go Back To Menu</Button>
          </Link>
        </form>
      </div>
    );
  }
}

export default Profile;
