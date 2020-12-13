const fs = require("fs");
const { captcha } = require("../dist");

async function main() {
  const { text, buffer } = await captcha({ size: 5 });
  fs.writeFileSync("captcha.png", buffer);
  console.log(text);
}

main();
