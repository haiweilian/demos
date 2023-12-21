export {}

// 机器
class Machine {
  autoProduceScrew(){
    console.log('机器生产一个螺丝')
  }
}

// 工人
class Worker {
  manualProduceScrew(){
    console.log('工人生产一个螺丝')
  }
}

// 螺丝生产车间
class ScrewWorkshop {
  // private worker: Worker = new Worker()

  // produce(){
  //   this.worker.manualProduceScrew()
  // }

  // 改为一个机器实例
  private machine: Machine = new Machine()

  produce(){
    this.machine.autoProduceScrew()
  }
}

// 工厂
class Factory {
  start(){
    const screwWorkshop = new ScrewWorkshop()
    screwWorkshop.produce()
  }
}

const factory = new Factory()
// 工厂开工啦！！！
factory.start()
