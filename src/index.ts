import { randomBytes } from "crypto";
import { PNG } from "pngjs";
import { WIDTH, HEIGHT, FONTS, LETTERS, SW } from "./constants";
import * as effects from "./effects";

export interface Options {
  length?: number;
  useLine?: boolean;
  useBlur?: boolean;
  useHollow?: boolean;
  dots?: number;
  fgColor?: number[]
  bgColor?: number[]
}

const defaultOptions: Options = {
  length: 5,
  useLine: true,
  useBlur: false,
  useHollow: false,
  dots: 100,
};

export interface CaptchaData {
  text: string;
  buffer: Buffer;
}

export async function captcha(options = defaultOptions): Promise<CaptchaData> {
  options = { ...defaultOptions, ...options };
  const { text, image } = await createImage(options);
  const buffer = await makepng(image, options.fgColor, options.bgColor);
  return { text: text.toString(), buffer };
}

export function randomColor(start = 10, end = 200, opacity = 255) {
  const red = randomInt(start, end);
  const green = randomInt(start, end);
  const blue = randomInt(start, end);
  return [red, green, blue, opacity];
}

async function makepng(image: Buffer, fgColor = randomColor(), bgColor = [0, 0, 0, 0]): Promise<Buffer> {
  const data = Buffer.alloc(4 * WIDTH * HEIGHT);
  const color  = (value = 255, gray) => Math.floor(gray * value / 255);
  for (let i = 0; i < image.length; i++) {
    const gray = 255 - image[i];
    if (gray === 0) {
      data[4 * i + 0] = bgColor[0] || 0;
      data[4 * i + 1] = bgColor[1] || 0;
      data[4 * i + 2] = bgColor[2] || 0;
      data[4 * i + 3] = bgColor[3] || 0;
    } else {
      data[4 * i + 0] = color(fgColor[0], gray);
      data[4 * i + 1] = color(fgColor[1], gray);
      data[4 * i + 2] = color(fgColor[2], gray);
      data[4 * i + 3] = color(fgColor[3], gray);
    }
  }
  const png = new PNG({
    width: WIDTH,
    height: HEIGHT,
    bitDepth: 8,
    colorType: 6,
  });
  png.data = data;
  return new Promise((resolve, reject)  => {
    png.pack();
    const chunks = [];
    png.on("data", (chunk) => chunks.push(chunk));
    png.on("error", err => {
      reject(err);
    });
    png.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });
}

async function createImage(options: Options) {
  const { length: size } = options;
  const rb = await urandom(size + 200 + 100 * 4 + 1 + 1);
  const text = Buffer.alloc(size);
  const swr = Buffer.alloc(200);
  const dr = Buffer.alloc(100 * 4);
  let s1: number;
  let s2: number;

  rb.copy(text, 0, 0, size);
  rb.copy(swr, 0, size, size + 200);
  rb.copy(dr, 0, size + 200, size + 200 + 100 * 4);
  s1 = rb.readUInt8(size + 200 + 100 * 4);
  s2 = rb.readUInt8(size + 200 + 100 * 4 + 1);

  const image = Buffer.alloc(200 * 70).fill(0xff);

  s1 &= 0x7f;
  s2 &= 0x3f;

  let p = 30;

  for (let n = 0; n < size; n++) {
    text[n] %= LETTERS.length - 1;
    p = letter(text[n], p, image, swr, s1, s2);
    text[n] = LETTERS.charCodeAt(text[n]);
  }

  effects.line(image, swr, s1);
  effects.dots(image, dr, options.dots);
  if (options.useBlur) effects.blur(image);
  if (options.useHollow) effects.hollow(image);

  return { image, text };
}

function urandom(size: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    randomBytes(size, (err, buf) => {
      err ? reject(err) : resolve(buf);
    });
  });
}

function letter(n: number, pos: number, image: Buffer, swr: Buffer, s1: number, s2: number) {
  const l = image.length;
  const t = FONTS[n];
  let r = 200 * 16 + pos;
  let i = r;
  let sk1 = s1 + pos;
  let sk2 = s2 + pos;
  let mpos = pos;
  let row = 0;

  for (let j = 0, k = t.length; j < k; j++) {
    const p = t[j];
    if (p === -101) continue;

    if (p < 0) {
      if (p === -100) {
        r += 200;
        i = r;
        sk1 = s1 + pos;
        row++;
        continue;
      }
      i += -p;
      continue;
    }

    if (sk1 >= 200) sk1 = sk1 % 200;
    const skew = Math.floor(SW[sk1] / 16);
    sk1 += (swr[pos + i - r] & 0x1) + 1;

    if (sk2 >= 200) sk2 %= 200;
    const skewh = Math.floor(SW[sk2] / 70);
    sk2 += swr[row] & 0x1;

    const x = i + skew * 200 + skewh;
    mpos = Math.max(mpos, pos + i - r);

    if (x - l < 70 * 200) image[x] = p << 4;
    i++;
  }

  return mpos;
}


function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
