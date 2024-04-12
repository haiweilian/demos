https://juejin.cn/book/7171733571638738952/section/7174421241225281566

https://juejin.cn/book/7196627546253819916/section/7197074908004745254

https://docs.libuv.org/en/v1.x/design.html

node 执行事件循环

```c
do {
  // 使用 libuv 库中的 uv_run 函数运行事件循环，处理所有未处理的事件。
  uv_run(env->event_loop(), UV_RUN_DEFAULT);
  if (env->is_stopping()) break;

  platform->DrainTasks(isolate);

  // 检查是否有活跃的事件
  more = uv_loop_alive(env->event_loop());
  if (more && !env->is_stopping()) continue;

  if (EmitProcessBeforeExit(env).IsNothing())
    break;

  {
    HandleScope handle_scope(isolate);
    if (env->RunSnapshotSerializeCallback().IsEmpty()) {
      break;
    }
  }

  // Emit `beforeExit` if the loop became alive either after emitting
  // event, or after running some callbacks.
  // 再次检查是否还有活跃的事件
  more = uv_loop_alive(env->event_loop());
} while (more == true && !env->is_stopping()); 
```

libuv 并行处理各个阶段的任务。

```c
int uv_run(uv_loop_t* loop, uv_run_mode mode) {
    int timeout;
    int r;
    int ran_pending;
    while (r != 0 && loop->stop_flag == 0) {
        // 更新当前时间，每轮事件循环会缓存这个时间，避免过多系统调用损耗性能
        uv__update_time(loop);
        // 执行定时器回调
        uv__run_timers(loop); // setTimeout() / setInterval() 在此阶段执行
        // 执行 pending 回调
        uv__run_pending(loop);
        // 继续执行各种队列
        uv__run_idle(loop);
        uv__run_prepare(loop);
        timeout = 0;
        // 计算 Poll IO 阻塞时间
        // 如果循环是使用该UV_RUN_NOWAIT标志运行的，则超时为 0。
        // 如果循环将要停止（uv_stop()被调用），则超时为 0。
        // 如果没有活动句柄或请求，则超时为 0。
        // 如果有任何空闲句柄处于活动状态，则超时为 0。
        // 如果有任何待关闭的句柄，则超时为 0。
        // 如果上述情况都不匹配，则采用最接近的计时器的超时时间，或者如果没有活动计时器，则采用无穷大。
        timeout = uv_backend_timeout(loop);
        // Poll IO timeout是 epoll_wait 的等待时间
        uv__io_poll(loop, timeout); // IO 事件在此阶段执行
        // 继续执行各种队列
        uv__run_check(loop); // setImmediate() 在此阶段执行
        uv__run_closing_handles(loop);
        // 是否还有活跃任务，有则继续下一轮事件循环
        r = uv__loop_alive(loop);
    }
    return r;
}
```

https://juejin.cn/book/7196627546253819916/section/7197301896355250215#heading-6

process.nextTick() 并非事件循环里的内容，而是通过特定位置埋点的方式，将其执行时机一个个埋在对应的地方。

process.nextTick() 任务 队列 是由 Node.js 管理的，而微任务的任务队列则直接由 V8 提供。

process.nextTick() 执行完后，才会执行微任务队列。
