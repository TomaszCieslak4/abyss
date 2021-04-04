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
import { SERVERIP } from "../../config";

interface MyState {
  username: string;
  newPassword: string;
  newConfirmPassword: string;
  currentPassword: string;
  difficulty: string;
  checkbox: string;
  errors: string[];
  success: string[];
}
class Profile extends Component<{}, MyState> {
  constructor(props: any) {
    super(props);
    this.state = {
      username: "",
      newPassword: "",
      newConfirmPassword: "",
      currentPassword: "",
      difficulty: "",
      checkbox: "",
      errors: [],
      success: [],
    };
    this.handleChange = this.handleChange.bind(this);
    this.updateAccount = this.updateAccount.bind(this);
    this.deleteAccount = this.deleteAccount.bind(this);
  }

  componentDidMount() {
    this.displayFields = this.displayFields.bind(this);
    this.displayFields();
  }

  handleChange(event: any) {
    //@ts-ignore
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  async displayFields() {
    let errors: string[] = [];
    let userStorage = localStorage.getItem("username");
    let username = userStorage ? userStorage : "";
    let difficultyStorage = localStorage.getItem("difficulty");
    let difficulty = difficultyStorage ? difficultyStorage : "";
    if (username === "" || difficulty === "") {
      errors.push("Error displaying user information, please login.");
    }

    this.setState({
      errors: errors,
      username: username,
      difficulty: difficulty,
    });
  }

  async updateAccount() {
    let errors: string[] = [];
    let success: string[] = [];

    if (this.state.checkbox === "") {
      errors.push("Please accept the changes.");
    }
    if (this.state.newPassword !== this.state.newConfirmPassword) {
      errors.push("New passwords are not the same.");
    }
    if (this.state.currentPassword.length === 0) {
      errors.push("Enter password to update account.");
    }
    if (
      this.state.newPassword.length > 0 &&
      (this.state.newPassword.length < 8 ||
        this.state.newPassword.match(/^[a-zA-Z0-9]+$/) === null)
    ) {
      errors.push(
        "Passwords should be betweeen at least 8 characters or numbers."
      );
    }
    if (this.state.difficulty === "") {
      errors.push("Please select preferred difficulty.");
    }
    if (errors.length === 0) {
      if (localStorage.getItem("difficulty") !== this.state.difficulty) {
        const result = await fetch(SERVERIP + "/api/auth/updatedifficulty", {
          method: "PUT",
          headers: {
            Authorization:
              "Basic " +
              btoa(
                this.state.username +
                  ":" +
                  this.state.currentPassword +
                  ":" +
                  this.state.difficulty
              ),
          },
        });
        var body = await result.json();
        if (result.status === 200) {
          success.push(body.message);
          localStorage.setItem("difficulty", this.state.difficulty);
        } else {
          errors.push(body.error);
        }
      }
      if (this.state.newPassword.length === 0) {
        errors.push("Password not changed."); // Not actually an error but a response to client
      } else if (errors.length === 0) {
        const result = await fetch(SERVERIP + "/api/auth/updatepassword", {
          method: "PUT",
          headers: {
            Authorization:
              "Basic " +
              btoa(
                this.state.username +
                  ":" +
                  this.state.currentPassword +
                  ":" +
                  this.state.newPassword
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
    }
    if (errors.length > 0 || success.length > 0) {
      this.setState({
        errors: errors,
        success: success,
      });
    }
  }
  async deleteAccount() {
    let errors: string[] = [];

    if (this.state.checkbox === "") {
      errors.push("Please accept the changes.");
    }
    if (this.state.username === "") {
      errors.push("Error displaying user information, please login.");
    }
    if (this.state.currentPassword === "") {
      errors.push("Please enter a password.");
    }
    if (errors.length === 0) {
      const result = await fetch(SERVERIP + "/api/auth/delete", {
        method: "DELETE",
        headers: {
          Authorization:
            "Basic " +
            btoa(this.state.username + ":" + this.state.currentPassword),
        },
      });
      var body = await result.json();
      if (result.status === 200) {
        localStorage.clear();
        //@ts-ignore
        this.props.history.push("/");
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
          <h2>Update Profile</h2>
          <div className="input-wrapper">
            <TextField
              disabled
              label="Username (cannot change)"
              variant="filled"
              className="textfield"
              value={this.state.username}
            />
          </div>
          <div className="input-wrapper">
            <TextField
              name="newPassword"
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
              name="newConfirmPassword"
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
                checked={this.state.difficulty === "easy" ? true : false}
              />
              <FormControlLabel
                name="difficulty"
                onChange={this.handleChange}
                value="medium"
                control={<Radio />}
                label="Medium"
                labelPlacement="top"
                checked={this.state.difficulty === "medium" ? true : false}
              />
              <FormControlLabel
                name="difficulty"
                onChange={this.handleChange}
                labelPlacement="top"
                value="hard"
                control={<Radio />}
                label="Hard"
                checked={this.state.difficulty === "hard" ? true : false}
              />
            </RadioGroup>
          </FormControl>
          <div className="input-wrapper">
            <TextField
              name="currentPassword"
              onChange={this.handleChange}
              label="Existing Password"
              type="password"
              autoComplete="current-password"
              variant="filled"
              className="textfield"
            />
          </div>
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
          <Button
            variant="contained"
            type="submit"
            onClick={this.updateAccount}
          >
            Update Account
          </Button>
          <Button variant="contained" onClick={this.deleteAccount}>
            Delete Account
          </Button>
          <Link to="/Menu">
            <Button variant="contained">Go Back To Menu</Button>
          </Link>
          <div id="success">
            {this.state.success.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>
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

export default Profile;
