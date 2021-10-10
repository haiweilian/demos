export type name = "vuex-namespace";

type VuexOptions<M, N> = {
  namespace?: N;
  mutations?: M;
};

// namespace + 函数名 拼接成标识
type Action<M, N> = N extends string ? `${N}/${keyof M & string}` : keyof M;

type Store<M, N> = {
  dispatch(action: Action<M, N>): void;
};

declare function Vuex<M, N>(options: VuexOptions<M, N>): Store<M, N>;

// 类型的反向推导，所以在调用的时候不用传入 M, N Vuex<M, N>()
const store = Vuex({
  namespace: "card",
  mutations: {
    add() {},
    remove() {},
  },
});

store.dispatch("card/add");
store.dispatch("card/remove");
