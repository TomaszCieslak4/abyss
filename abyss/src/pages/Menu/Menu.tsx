import { Button } from "@material-ui/core";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { SERVERIP } from "../../config";

interface MyState {
  gameState: string;
  difficulty: string;
  errors: string[];
  topTen: any;
  easyScore: string;
  mediumScore: string;
  hardScore: string;
}
class Menu extends Component<{}, MyState> {
  constructor(props: any) {
    super(props);
    this.state = {
      gameState: "", //TODO: CHANGE GAME STATE DEPENDING ON WIN/LOSS/SIGNIN
      difficulty: "",
      errors: [],
      topTen: [],
      easyScore: "",
      mediumScore: "",
      hardScore: "",
    };
  }

  componentDidMount() {
    this.getStats = this.getStats.bind(this);
    this.getStats();
  }
  async getStats() {
    let errors: string[] = [];
    let difficulty = this.state.difficulty;
    let topTen = this.state.topTen;
    let easyScore = this.state.easyScore;
    let mediumScore = this.state.mediumScore;
    let hardScore = this.state.hardScore;
    let userStorage = localStorage.getItem("username");
    let username = userStorage ? userStorage : "";
    // let password = localStorage.getItem("password");

    // Get user info
    if (username === "") {
      errors.push("Cannot retrieve information, user is not logged in.");
    }
    if (errors.length === 0) {
      const result = await fetch(SERVERIP + "/api/user/userinfo", {
        method: "GET",
        headers: {
          Authorization: "Basic " + btoa(username),
        },
      });
      var body = await result.json();
      if (result.status === 200) {
        let resultDifficulty = body.difficulty;
        if (
          resultDifficulty !== "easy" &&
          resultDifficulty !== "medium" &&
          resultDifficulty !== "hard"
        ) {
          errors.push("Error obtaining user difficulty.");
        } else {
          localStorage.setItem("difficulty", resultDifficulty);
          difficulty = resultDifficulty;
          easyScore = body.easyScore;
          mediumScore = body.mediumScore;
          hardScore = body.hardScore;
        }
      } else {
        errors.push(body.error);
      }
    }
    if (errors.length === 0) {
      // Get top ten leaderboards for user's difficulty
      const result = await fetch(SERVERIP + "/api/topten", {
        method: "GET",
        headers: {
          Authorization: "Basic " + btoa(difficulty),
        },
      });
      var body = await result.json();
      if (result.status === 200) {
        topTen = body.topten;
      } else {
        errors.push(body.error);
      }
    }
    // console.log(errors, topTen, difficulty);

    this.setState({
      errors: errors,
      topTen: topTen,
      difficulty: difficulty,
      easyScore: easyScore,
      mediumScore: mediumScore,
      hardScore: hardScore,
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
          <h1>{this.state.gameState}</h1>
          <h2>My Highscores</h2>
          <table id="mystats">
            <tbody>
              <tr>
                <th className="middle">Easy</th>
                <th className="middle">Medium</th>
                <th className="middle">Hard</th>
              </tr>
              <tr>
                <td className="middle">{this.state.easyScore}</td>
                <td className="middle">{this.state.mediumScore}</td>
                <td className="middle">{this.state.hardScore}</td>
              </tr>
            </tbody>
          </table>
          <h2>{this.state.difficulty.toUpperCase()} Leaderboard</h2>
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
                    <td className="middle">{item["score"]}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <h2>Menu</h2>
          <Button variant="contained">Start New Game</Button>
          <Link to="/Profile">
            <Button variant="contained">Update Gamemode & Profile</Button>
          </Link>
          <Link to="/" onClick={() => localStorage.clear()}>
            <Button variant="contained">Logout</Button>
          </Link>
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
