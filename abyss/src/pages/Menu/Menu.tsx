import { Button } from "@material-ui/core";
import React, { Component } from "react";
import { Link } from "react-router-dom";

class Menu extends Component {
  render() {
    return (
      <div className="gradborder">
        <form className="center-screen">
          <h1>DID YOU WIN OR LOOSE?</h1>
          <h2>My Highscores</h2>
          <h2>Leaderboard</h2>
          <h2>Menu</h2>
          <Button variant="contained">Start New Game</Button>
          <Link to="/Registration">
            <Button variant="contained">Update Gamemode & Profile</Button>
          </Link>
          <Link to="/">
            <Button variant="contained">Logout</Button>
          </Link>
        </form>
      </div>
    );
  }
}

export default Menu;
