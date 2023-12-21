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
  private producer: Producer

  // 通过构造函数注入
  constructor(producer: Producer) {
    this.producer = producer
  }

  produce(){
    this.producer.produceScrew()
  }
}

class Factory {
  start(){
    // 在 Factory 类中控制 producer 的实现，控制反转啦！！！
    // const producer: Producer = new Worker()
    const producer: Producer = new Machine()

    // 通过构造函数注入依赖
    const screwWorkshop = new ScrewWorkshop(producer)
    screwWorkshop.produce()
  }
}

const factory = new Factory()
// 工厂开工啦！！！
factory.start()

// 与 Nest 类比：
// Provider & Worker/Machine：真正提供具体功能实现的低层类。
// Controller & ScrewWorkshop：调用低层类来为用户提供服务的高层类。
// Nest框架本身 & Factory：控制反转容器，对高层类和低层类统一管理，控制相关类的新建与注入，解藕了类之间的依赖。
