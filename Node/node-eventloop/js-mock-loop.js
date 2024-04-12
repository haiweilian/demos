class EventSystem {
  constructor() {
    // 需要处理的任务队列
    this.queue = [];
    // 标记是否需要退出事件循环
    this.stop = 0;
    // 有任务时调用该函数"唤醒" await
    this.wakeup = null;
  }
  // 没有任务时，事件循环的进入"阻塞"状态
  wait() {
    return new Promise((resolve) => {
      // 记录 resolve，可能在睡眠期间有任务到来，则需要提前唤醒
      this.wakeup = () => {
        this.wakeup = null;
        resolve();
      };
    });
  }
  // 停止事件循环，如果正在"阻塞"，则"唤醒它"
  setStop() {
    this.stop = 1;
    this.wakeup && this.wakeup();
  }
  // 生产任务
  enQueue(func) {
    this.queue.push(func);
    this.wakeup && this.wakeup();
  }

  // 处理任务队列
  handleTask() {
    if (this.queue.length === 0) {
      return;
    }
    // 本轮事件循环的回调中加入的任务，下一轮事件循环再处理，防止其他任务没有机会处理
    const queue = this.queue;
    this.queue = [];
    while (queue.length) {
      const func = queue.shift();
      func();
    }
  }

  // 事件循环的实现
  async run() {
    // 如果 stop 等于 1 则退出事件循环
    while (this.stop === 0) {
      // 处理任务，可能没有任务需要处理
      this.handleTask();
      // 处理任务过程中如果设置了 stop 标记则退出事件循环
      if (this.stop === 1) {
        break;
      }
      // 没有任务了，进入睡眠
      if (this.queue.length === 0) {
        await this.wait();
      }
    }
    // 退出前可能还有任务没处理，处理完再退出
    this.handleTask();
  }
}

// 新建一个事件循环系统
const eventSystem = new EventSystem();

// 启动前生成的任务
eventSystem.enQueue(() => {
  console.log("1");
});

// 模拟定时生成一个任务
setTimeout(() => {
  eventSystem.enQueue(() => {
    console.log("3");
    eventSystem.setStop();
  });
}, 1000);

// 启动事件循环
eventSystem.run();

// 启动后生成的任务
eventSystem.enQueue(() => {
  console.log("2");
});
