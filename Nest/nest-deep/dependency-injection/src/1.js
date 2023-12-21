"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Machine {
    autoProduceScrew() {
        console.log('机器生产一个螺丝');
    }
}
class Worker {
    manualProduceScrew() {
        console.log('工人生产一个螺丝');
    }
}
class ScrewWorkshop {
    constructor() {
        this.machine = new Machine();
    }
    produce() {
        this.machine.autoProduceScrew();
    }
}
class Factory {
    start() {
        const screwWorkshop = new ScrewWorkshop();
        screwWorkshop.produce();
    }
}
const factory = new Factory();
factory.start();
