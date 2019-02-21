import { Component } from "react";

declare module "react-loading-overlay" {
  export default class _default extends Component {
    static defaultProps: {
      classNamePrefix: string;
      fadeSpeed: number;
      styles: {};
    };
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: any): void;
    forceUpdate(callback: any): void;
    render(): any;
    setState(partialState: any, callback: any): void;
  }
}
