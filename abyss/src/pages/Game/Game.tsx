import { Button, TextField } from "@material-ui/core";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import "../../App.css";
import { PORT } from "../../config";

interface MyState {
  username: string;
  password: string;
  errors: string[];
}
interface MyProp extends RouteComponentProps<any> {}

class Game extends Component<MyProp, MyState> {
  constructor(props: MyProp) {
    super(props);
    // this.state = {
    //   username: "",
    //   password: "",
    //   errors: [],
    // };
    // this.handleChange = this.handleChange.bind(this);
    // this.login = this.login.bind(this);
  }

  handleChange(event: any) {
    //@ts-ignore
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  handleSubmit = (e: any) => {
    e.preventDefault();
  };

  render() {
    return <div>TEST</div>;

    //     <style>
    //     *{
    //         padding: 0;
    //         margin: 0;
    //         box-sizing: border-box;
    //     }
    //     canvas{
    //         border:none; background: black;
    //         width: 100%;
    //         height: 100%;
    //     }
    // </style>
    // <canvas id="canvas" oncontextmenu="event.preventDefault()" tabindex=-1></canvas>
    // {{{ SCRIPT }}}
  }
}
export default Game;
