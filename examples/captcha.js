const { captcha } = require("../dist");
const fs = require("fs");
const path = require("path");

async function main() {
  const {text, buffer} = await captcha();
  fs.writeFileSync(path.resolve(__dirname, "captcha.png"), buffer);
  console.log(text);
}

main();
