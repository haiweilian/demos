// ============= Test Cases =============
import type { Equal, Expect } from "./test-utils";

const tree1 = {
  val: 1,
  left: null,
  right: {
    val: 2,
    left: {
      val: 3,
      left: null,
      right: null,
    },
    right: null,
  },
} as const;

const tree2 = {
  val: 1,
  left: null,
  right: null,
} as const;

const tree3 = {
  val: 1,
  left: {
    val: 2,
    left: null,
    right: null,
  },
  right: null,
} as const;

const tree4 = {
  val: 1,
  left: null,
  right: {
    val: 2,
    left: null,
    right: null,
  },
} as const;

type cases = [
  Expect<Equal<InorderTraversal<null>, []>>,
  Expect<Equal<InorderTraversal<typeof tree1>, [1, 3, 2]>>,
  Expect<Equal<InorderTraversal<typeof tree2>, [1]>>,
  Expect<Equal<InorderTraversal<typeof tree3>, [2, 1]>>,
  Expect<Equal<InorderTraversal<typeof tree4>, [1, 2]>>
];

// ============= Your Code Here =============
interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

// type InorderTraversal<T extends TreeNode | null> = T extends TreeNode
//   ? T["left"] extends TreeNode
//     ? T["right"] extends TreeNode
//       ? [...InorderTraversal<T["left"]>, T["val"], ...InorderTraversal<T["right"]>]
//       : [...InorderTraversal<T["left"]>, T["val"]]
//     : T["right"] extends TreeNode
//     ? [T["val"], ...InorderTraversal<T["right"]>]
//     : [T["val"]]
//   : [];

// [T] extends [TreeNode] 避免 TreeNode | null 分布式
// https://github.com/type-challenges/type-challenges/issues/8046
type InorderTraversal<T extends TreeNode | null> = [T] extends [TreeNode]
  ? [...InorderTraversal<T["left"]>, T["val"], ...InorderTraversal<T["right"]>]
  : [];
