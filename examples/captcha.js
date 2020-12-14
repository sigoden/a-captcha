const fs = require("fs");
const path = require("path");
const { captcha } = require("../dist");

async function main() {
  const { text, buffer } = await captcha({ length: 5 });
  fs.writeFileSync(path.resolve(__dirname, "captcha.png"), buffer);
  console.log(text);
}

main();
