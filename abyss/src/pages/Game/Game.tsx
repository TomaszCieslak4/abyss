/* eslint-disable */
import { Component } from "react";
import "../../App.css";
import { PORT } from "../../config";

class Game extends Component {
  constructor(props: any) {
    super(props);
    // Test();
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
    return (<canvas
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
    );
  }
}
export default Game;
