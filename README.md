# a-captcha

A Lightweight Pure JavaScript Captcha for Node.js. Inspired By [trek-captcha](https://github.com/trekjs/captcha).

## Installation

```
$ npm install a-captcha --save
```

## Examples

![captcha](https://github.com/sigoden/a-captcha/raw/master/examples/captcha.png)

```js
const fs = require("fs");
const { captcha } = require("a-captcha");

async function main() {
  const { text, buffer } = await captcha({ length: 5 });
  fs.writeFileSync("captcha.png", buffer);
  console.log(text);
}

main();
```