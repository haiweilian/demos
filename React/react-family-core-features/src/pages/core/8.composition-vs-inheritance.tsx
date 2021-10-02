import { Fragment } from "react";

interface Props {
  header: any;
  main: any;
  footer: any;
}

function Layout(props: Props) {
  return (
    <Fragment>
      <header>{props.header}</header>
      <header>{props.main}</header>
      <header>{props.footer}</header>
    </Fragment>
  );
}

export default Layout;
