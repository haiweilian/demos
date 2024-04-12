// ArrayBuffer 最底层存储二进制的类数组
const buffer = new ArrayBuffer(8);
console.log(buffer);

// TypedArray 是具体的类型视图
// Int8Array/Uint8Array 视图用来操作 buffer
const view = new Uint8Array(buffer);
view[0] = 1;
console.log(view, view[0]);

// DataView 是多种类型视图
const dview = new DataView(buffer);
dview.setUint8(0, 1);
console.log(dview, dview.getUint8(0));
