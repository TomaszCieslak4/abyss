import { Component, Fragment } from "react";
import "../../App.css";
import {
  Button
} from "@material-ui/core";
import { ReactComponent as HealthSVG } from "../assets/heart.svg";
import { ReactComponent as AmmoSVG } from "../assets/ammo.svg";
import { ReactComponent as ScoreSVG } from "../assets/score.svg";
import { ReactComponent as KillSVG } from "../assets/players.svg";
import { PORT } from "../../config";

interface MyState {
  score: number,
  kills: number,
  health: number,
  maxHealth: number,
  ammo: number,
  maxAmmo: number,
  gameComplete: boolean,
}

class Game extends Component<{}, MyState> {
  constructor(props: any) {
    super(props);
    this.state = {
      score: 0,
      kills: 0,
      health: 100,
      maxHealth: 100,
      ammo: 100,
      maxAmmo: 100,
      gameComplete: false,
    };

    this.updateScore = this.updateScore.bind(this);
    this.updateKills = this.updateKills.bind(this);
    this.updateHealth = this.updateHealth.bind(this);
    this.updateMaxHealth = this.updateMaxHealth.bind(this);
    this.updateAmmo = this.updateAmmo.bind(this);
    this.updateMaxAmmo = this.updateMaxAmmo.bind(this);
    this.toggleGame = this.toggleGame.bind(this);
    this.leaveLobby = this.leaveLobby.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.restartMatch = this.restartMatch.bind(this);
  }
  
  updateScore(value: number) {
    this.setState({
      score: value,
    });
  }

  updateHealth(value: number) {
    this.setState({
      health: value,
    });
  }

  updateMaxHealth(value: number) {
    this.setState({
      maxHealth: value,
    });
  }

  updateAmmo(value: number) {
    this.setState({
      ammo: value,
    });
  }
  updateMaxAmmo(value: number) {
    this.setState({
      maxAmmo: value,
    });
  }

  updateKills(value: number) {
    this.setState({
      kills: value,
    });
  }

  toggleGame(on: boolean) {
    this.setState({gameComplete: on});
  }

  async uploadScore() {
    const result = await fetch(
      `http://${window.location.hostname}:${PORT}/api/auth/updatescore`,
      {
        method: "PUT",
        body: JSON.stringify({ score: this.state.score })
      }
    );
    var body = await result.json();
  }

  componentDidMount() {
    //@ts-ignore
    Module.onScoreChange = (score) => (this.updateScore(score));
    //@ts-ignore
    Module.onKillsChange = (kills) => (this.updateKills(kills));
    //@ts-ignore
    Module.onHealthChange = (health) => (this.updateHealth(health));
    //@ts-ignore
    Module.onMaxHealthChange = (health) => (this.updateMaxHealth(health));
    //@ts-ignore
    Module.onAmmoChange = (ammo) => (this.updateAmmo(ammo));
    //@ts-ignore
    Module.onMaxAmmoChange = (ammo) => (this.updateMaxAmmo(ammo));
    //@ts-ignore
    Module.onDeath = () => {
      this.uploadScore();
      this.toggleGame(true);
    };
    //@ts-ignore
    Module.start();
  }

  leaveLobby() {
    //@ts-ignore
    this.props.history.push("/menu");
  }

  restartMatch() {
    //@ts-ignore
    Module.stop();
    //@ts-ignore
    Module.start();
    this.toggleGame(false);
  }

  componentWillUnmount() {
    //@ts-ignore
    Module.stop();
  }

  handleSubmit = (e: any) => {
    e.preventDefault();
  };

  render() {
    if (this.state.gameComplete) {
      return (
        <div className="gradborder">
          <form className="center-screen" onSubmit={this.handleSubmit}>
            <p>Match Results:</p>
            <ScoreSVG />
            <p>Score: {this.state.score}</p>
            <br />
            <KillSVG />
            <p>Kills: {this.state.kills}</p>
            <br />
            <Button variant="contained" onClick={this.restartMatch}>
              New Match
            </Button>
            <Button variant="contained" onClick={this.leaveLobby}>
              Main Menu
          </Button>
          </form>
        </div>
      );
    }

    return (
      <div>
        <div>
          <Button variant="contained" onClick={this.leaveLobby}>
            Leave match
        </Button>
        </div>
        <div id="ui_game" className='ui_game'>
          <HealthSVG />
          <p> Health: {this.state.health} / {this.state.maxHealth}</p>
          <br />
          <AmmoSVG />
          <p>Ammo: {this.state.ammo} / {this.state.maxAmmo}</p>
          <br />
          <ScoreSVG />
          <p>Score: {this.state.score}</p>
          <br />
          <KillSVG />
          <p>Kills: {this.state.kills}</p>
          <br />
        </div>
      </div>
    );
  }
}
export default Game;
