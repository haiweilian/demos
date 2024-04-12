const { Buffer } = require("node:buffer");

const buffer = Buffer.from("Hello World");
console.log(buffer);
for (const buf of buffer) {
  console.log(buf);
}

const blob = new Blob(["Hello World"]);
console.log(blob.arrayBuffer());

// 以下由 AI 解释
// 在Node.js中，Buffer.from() 方法用于创建一个新的 Buffer 实例，包含提供的字符串的字节。对于字符串 "Hello World"，它会根据当前字符编码（默认为 'utf8'）将其转换为字节序列。

// 首先，我们需要知道 "Hello World" 在 UTF-8 编码下的字节表示。每个字符都可能占用不同数量的字节，具体取决于字符的Unicode码点。对于基本的ASCII字符（比如 "Hello World" 中的所有字符），UTF-8 编码与ASCII编码是相同的，每个字符占用一个字节。

// "Hello World" 的UTF-8编码（也是ASCII编码）如下：

// H: 72 (0x48 in hex)
// e: 101 (0x65 in hex)
// l: 108 (0x6C in hex)
// l: 108 (0x6C in hex)
// o: 111 (0x6F in hex)
// : 32 (0x20 in hex)
// W: 87 (0x57 in hex)
// o: 111 (0x6F in hex)
// r: 114 (0x72 in hex)
// l: 108 (0x6C in hex)
// d: 100 (0x64 in hex)

// 所以，Buffer.from("Hello World") 在二进制中的结果会是这些字节的连续序列。如果我们把这些字节转换为二进制表示，并且为了清晰起见用空格分隔每个字节的二进制形式，那么结果如下：
// 01001000 01100101 01101100 01101100 01101111 00100000 01010111 01101111 01110010 01101100 01100100

// 或者，如果我们用十六进制表示每个字节（这是更常见的查看Buffer内容的方式），则会是：
// 48 65 6C 6C 6F 20 57 6F 72 6C 64

// 在Node.js中，你可以使用 buffer.toString('hex') 来得到这个十六进制的字符串表示：
// javascript
// const buffer = Buffer.from("Hello World");
// const hexString = buffer.toString('hex');
// console.log(hexString); // 输出: 48656c6c6f20576f726c64
// 请注意，实际的二进制表示在内存中不会包含空格或任何分隔符，它们只是为了帮助人类阅读而添加的。在内存中，这些字节是连续存储的。
