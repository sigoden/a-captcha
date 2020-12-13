# captchajs

A Lightweight Pure JavaScript Captcha for Node.js. Inspired By [trek-captcha](https://github.com/trekjs/captcha).

## Installation

```
$ npm install captchajs --save
```

## Examples

```js
const fs = require('fs')
const { captcha } = require('captchajs')

async function main() {
  const { text, buffer } = await captcha()
  fs.writeFileSync('captcha.png', buffer);
  console.log(text);
}

main()
```