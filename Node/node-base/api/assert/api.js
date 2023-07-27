// 对比值
import assert from "assert";

// 深度值对比
assert.deepEqual([1, 2], [1, 2]);

assert.deepEqual(1, 1);

assert.deepEqual({ a: 1 }, { a: 1 });

// 不相等
assert.notDeepEqual(1, 2);
assert.notDeepEqual({}, {}); // error
