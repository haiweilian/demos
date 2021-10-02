const list = [
  {
    id: "1",
    name: 1,
  },
  {
    id: "2",
    name: 2,
  },
  {
    id: "3",
    name: 3,
  },
];

function Lists() {
  return (
    <ul>
      {list.map((item) => (
        <li key={item.id}>key: {item.name}</li>
      ))}
    </ul>
  );
}
export default Lists;
