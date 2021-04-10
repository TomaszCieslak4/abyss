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
import { RouteComponentProps } from "react-router-dom";
import "../../App.css";
import { SERVERIP } from "../../config";

interface MyState {
  username: string;
  newPassword: string;
  currentPassword: string;
  checkbox: string;
  errors: string[];
  success: string[];
}
interface MyProp extends RouteComponentProps<any> {}

class Profile extends Component<MyProp, MyState> {
  constructor(props: MyProp) {
    super(props);
    this.state = {
      username: "",
      newPassword: "",
      currentPassword: "",
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
    let userStorage = localStorage.getItem("username");
    let username = userStorage ? userStorage : "";

    this.setState({
      username: username,
    });
  }

  async updateAccount() {
    let errors: string[] = [];
    let success: string[] = [];

    if (this.state.checkbox === "") {
      errors.push("Please accept the changes.");
    }
    if (this.state.currentPassword.length === 0) {
      errors.push("Enter password to change account details.");
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
    if (errors.length === 0) {
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
          <div className="input-wrapper"></div>
          <FormControl component="fieldset"></FormControl>
          <div className="input-wrapper">
            <TextField
              name="currentPassword"
              onChange={this.handleChange}
              label="Existing Password (required)"
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
            color="primary"
          >
            Update Account
          </Button>
          <Button variant="contained" onClick={this.deleteAccount}>
            Delete Account
          </Button>
          <Button
            variant="contained"
            onClick={() => this.props.history.push("/Menu")}
          >
            Go Back To Menu
          </Button>
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
