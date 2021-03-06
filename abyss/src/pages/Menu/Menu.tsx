import { Button } from "@material-ui/core";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import { PORT } from "../../config";

interface MyState {
  errors: string[];
  topTen: any;
  highScore: string;
  lastScore: string;
}
interface MyProp extends RouteComponentProps<any> {}

class Menu extends Component<MyProp, MyState> {
  constructor(props: MyProp) {
    super(props);
    this.state = {
      errors: [],
      topTen: [],
      highScore: "",
      lastScore: "",
    };
    this.logout = this.logout.bind(this);
  }

  componentDidMount() {
    this.getStats = this.getStats.bind(this);
    this.getStats();
  }

  async logout() {
    let errors: string[] = [];
    //Required to clear session
    const result = await fetch(
      `http://${window.location.hostname}:${PORT}/api/auth/logout`,
      {
        method: "POST",
      }
    );
    var body = await result.json();
    if (result.status === 200) {
      localStorage.clear();
      this.props.history.push("/");
    } else {
      errors.push(body.error);
    }

    this.setState({
      errors: errors,
    });
  }

  async getStats() {
    let errors: string[] = [];
    let topTen = this.state.topTen;
    let highScore = this.state.highScore;
    let lastScore = this.state.lastScore;
    let userStorage = localStorage.getItem("username");
    let username = userStorage ? userStorage : "";

    // Get user info
    if (username === "") {
      errors.push("Cannot retrieve information, user is not logged in.");
    }
    if (errors.length === 0) {
      const result = await fetch(
        `http://${window.location.hostname}:${PORT}/api/user/userscores`,
        {
          method: "GET",
        }
      );
      var body = await result.json();
      if (result.status === 200) {
        highScore = body.highScore;
        lastScore = body.lastScore;
      } else {
        errors.push(body.error);
      }
    }
    if (errors.length === 0) {
      // Get top ten leaderboards
      const result = await fetch(
        `http://${window.location.hostname}:${PORT}/api/topten`,
        {
          method: "GET",
        }
      );
      var body = await result.json();
      if (result.status === 200) {
        topTen = body.topten;
      } else {
        errors.push(body.error);
      }
    }

    this.setState({
      errors: errors,
      topTen: topTen,
      highScore: highScore,
      lastScore: lastScore,
    });
  }

  render() {
    // Only render when data is fetched
    if (!this.state.topTen.rows) {
      return <div />;
    }
    return (
      <div className="gradborder">
        <form className="center-screen">
          <h2>My Highscores</h2>
          <table id="mystats">
            <tbody>
              <tr>
                <th className="middle">Last Score</th>
                <th className="middle">Highscore</th>
              </tr>
              <tr>
                <td className="middle">{this.state.lastScore}</td>
                <td className="middle">{this.state.highScore}</td>
              </tr>
            </tbody>
          </table>
          <h2>Leaderboard</h2>
          <table id="leaderboard">
            <tbody>
              <tr>
                <th className="middle">User</th>
                <th className="middle">Score</th>
              </tr>
              {
                //@ts-ignore
                this.state.topTen.rows.map((item) => (
                  <tr>
                    <td className="middle">{item["username"]}</td>
                    <td className="middle">{item["highscore"]}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <h2>Menu</h2>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              this.props.history.push("/game");
            }}
          >
            Start New Game
          </Button>
          <Button
            variant="contained"
            onClick={() => this.props.history.push("/Profile")}
          >
            Update Profile
          </Button>
          <Button variant="contained" onClick={this.logout}>
            Logout
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

export default Menu;
