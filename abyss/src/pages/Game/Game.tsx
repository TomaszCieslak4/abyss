/* eslint-disable */
import { Component } from "react";
import "../../App.css";
import { PORT } from "../../config";

interface MyState {
  health: number,
  score: number,
  ammo: number,
}

class Game extends Component<{}, MyState> {
  constructor(props: any) {
    super(props);
    this.state = {
      health: 0,
      score: 0,
      ammo: 0,
    };
    this.updateScore = this.updateScore.bind(this);
    this.updateHealth = this.updateHealth.bind(this);
    this.updateAmmo = this.updateAmmo.bind(this);
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

  updateAmmo(value: number) {
    this.setState({
      ammo: value,
    });
  }

  componentDidMount() {
    //@ts-ignore
    Module.start();
  }

  componentWillUnmount() {
    //@ts-ignore
    Module.stop();
  }

  render() {
    return (
      <div>

        <canvas
          id="canvas"
          onContextMenu={event => event.preventDefault()}
          tabIndex={-1}
          style={{
            border: "none",
            background: "black",
            width: "100%",
            height: "100%",
            padding: "0",
            margin: "0",
            boxSizing: "border-box",
          }}>
        </canvas>
      </div>
    );
  }
}
export default Game;
