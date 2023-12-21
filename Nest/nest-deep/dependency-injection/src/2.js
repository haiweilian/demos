"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Machine {
    autoProduceScrew() {
        console.log('机器生产一个螺丝');
    }
    produceScrew() {
        this.autoProduceScrew();
    }
}
class Worker {
    manualProduceScrew() {
        console.log('工人生产一个螺丝');
    }
    produceScrew() {
        this.manualProduceScrew();
    }
}
class ScrewWorkshop {
    constructor() {
        this.producer = new Worker();
    }
    produce() {
        this.producer.produceScrew();
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
