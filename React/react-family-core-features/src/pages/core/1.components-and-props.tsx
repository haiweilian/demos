interface Props {
  name: string;
}

function Welcome(props: Props) {
  return <div>Hello {props.name}</div>;
}

export default Welcome;
