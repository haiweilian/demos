interface FooProp {
  name: string
}

function AnotherComponent(prop: FooProp) {
  return prop.name
}

function ComponentFoo(prop: FooProp) {
  return <AnotherComponent name={prop.name}></AnotherComponent>
}
