function moduleLib(options) {
  console.log(options);
}

moduleLib.version = "1.0.0";
moduleLib.doSomething = function () {
  console.log("moduleLib do something");
};

export default moduleLib;
