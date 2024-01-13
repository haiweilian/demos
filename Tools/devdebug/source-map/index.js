const { SourceMapGenerator } = require("source-map");

const map = new SourceMapGenerator({
  file: "source-mapped.js",
});

map.addMapping({
  generated: {
    line: 1,
    column: 1,
  },
  source: "foo.js",
  original: {
    line: 2,
    column: 2,
  },
  name: "christopher",
});

console.log(map.toString());
