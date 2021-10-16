// '(add 2 (subtract 4 2))'
function tokenizer(input) {
  console.log(input);
  let current = 0;
  let tokens = [];
  while (current < input.length) {
    let char = input[current];

    // 左括号
    if (char === '(') {
      tokens.push({
        type: 'paren',
        value: '(',
      });
      current++;
      continue;
    }

    // 右括号
    if (char === ')') {
      tokens.push({
        type: 'paren',
        value: ')',
      });
      current++;
      continue;
    }

    // 空格跳过
    let WHITESPACE = /\s/;
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }

    // 数字
    let NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      let value = '';

      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({
        type: 'number',
        value,
      });

      continue;
    }

    // 字符串
    if (char === '"') {
      let value = '';
      // 跳过当前
      char = input[++current];

      while (char !== '"') {
        value += char;
        char = input[++current];
      }

      char = input[++current];

      tokens.push({
        type: 'string',
        value,
      });

      continue;
    }

    // 函数名
    let LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {
      let value = '';

      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({
        type: 'name',
        value,
      });

      continue;
    }
  }

  return tokens;
}

function parser(tokens) {
  let current = 0;

  function walk() {
    let token = tokens[current]

    // 数字
    if(token.type === 'number') {
      current ++ ;
      return {
        type: 'NumberLiteral',
        value: token.value
      }
    }

    // 字符串
    if(token.type === 'string') {
      current ++ ;
      return {
        type: 'StringLiteral',
        value: token.value
      }
    }

    // 函数调用
    if(token.type === 'paren' && token.value === '(') {
      // 跳过括号
      token = tokens[++current]
      // 函数名
      let node = {
        type: 'CallExpression',
        name: token.value,
        params: []
      }
      token = tokens[++current]

      // ) 扩展之前的是参数
      while(token.type !== 'paren' || (token.type === 'paren' && token.value !== ')')) {
        node.params.push(walk())
        token = tokens[current]
      }

      // 跳过闭括号
      current ++

      return node
    }
  }

  let ast = {
    type: 'Program',
    body: []
  }

  while(current < tokens.length) {
    ast.body.push(walk())
  }

  return ast
}

function traverser(ast, visitor) {
  function traverseArray(array, parent) {
    array.forEach(child => {
      traverseNode(child, parent)
    })
  }

  function traverseNode(node, parent) {
    let methods = visitor[node.type]

    if(methods && methods.enter) {
      methods.enter(node, parent)
    }

    switch(node.type) {
      case 'Program':
        traverseArray(node.body, node)
        break;
      case 'CallExpression':
        traverseArray(node.params, node)
        break;
      case 'NumberLiteral':
      case 'StringLiteral':
        break;
    }

    if(methods && methods.exit) {
      methods.exit(node, parent)
    }
  }

  traverseNode(ast, null)
}

function transformer(ast) {
  let newAst = {
    type: 'Program',
    body: []
  }

  ast._context = newAst.body

  traverser(ast, {
    NumberLiteral: {
      enter(node,  parent) {
        parent._context.push({
          type: 'NumberLiteral',
          value: node.value
        })
      }
    },

    StringLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'StringLiteral',
          value: node.value
        })
      }
    },

    CallExpression: {
      enter(node, parent) {
        let expression = {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: node.name
          },
          arguments: []
        }

        node._context = expression.arguments;

        if(parent.type !== 'CallExpression') {
          expression = {
            type: 'ExpressionStatement',
            expression
          }
        }

        parent._context.push(expression)
      }
    }
  })

  return newAst
}

function codeGenerator(node) {
  switch(node.type) {
    case 'Program':
      return node.body.map(codeGenerator).join('\n');

    case 'ExpressionStatement':
      return codeGenerator(node.expression) + ';'

    case 'CallExpression':
      return codeGenerator(node.callee) + '(' + node.arguments.map(codeGenerator).join(', ') + ')'

    case 'Identifier':
      return node.name

    case 'NumberLiteral':
      return node.value

    case 'StringLiteral':
      return '"' + node.value + '"'
  }
}

function compiler(input) {
  let tokens = tokenizer(input);
  console.log(tokens);
  let ast = parser(tokens)
  console.log(ast);
  let newAst = transformer(ast);
  console.log(newAst);
  let output = codeGenerator(newAst);
  console.log(output);
}

compiler('(add 2 (subtract 4 2))(add 2 (subtract 4 2))');
