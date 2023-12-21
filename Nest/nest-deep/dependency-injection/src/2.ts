export {}

// 定义一个生产者接口
interface Producer {
  produceScrew: () => void
}

// 实现了接口的机器
class Machine implements Producer {
  autoProduceScrew(){
    console.log('机器生产一个螺丝')
  }

  produceScrew(){
    this.autoProduceScrew()
  }
}

// 实现了接口的工人
class Worker implements Producer {
  manualProduceScrew(){
    console.log('工人生产一个螺丝')
  }

  produceScrew(){
    this.manualProduceScrew()
  }
}

class ScrewWorkshop {
  // 依赖生产者接口,可以随意切换啦！！！
  // private producer: Producer = new Machine()
  private producer: Producer = new Worker()

  produce(){
    this.producer.produceScrew()
  }
}

class Factory {
  start(){
    const screwWorkshop = new ScrewWorkshop()
    screwWorkshop.produce()
  }
}

const factory = new Factory()
// 工厂开工啦！！！
factory.start()
