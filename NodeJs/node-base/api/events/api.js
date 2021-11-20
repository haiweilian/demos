import EventEmitter from "events";

const emitter = new EventEmitter();

emitter.on("log", (data) => {
  console.log(data);
});

emitter.emit("log", "ha ha ha ...");
