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
    constructor(producer) {
        this.producer = producer;
    }
    produce() {
        this.producer.produceScrew();
    }
}
class Factory {
    start() {
        const producer = new Machine();
        const screwWorkshop = new ScrewWorkshop(producer);
        screwWorkshop.produce();
    }
}
const factory = new Factory();
factory.start();
