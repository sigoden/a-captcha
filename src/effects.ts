export function line(image: Buffer, sw: number[], swr: Buffer, s1: number) {
  for (let x = 0, sk1 = s1; x < 199; x++) {
    if (sk1 >= 200) sk1 %= 200;
    const skew = Math.floor(sw[sk1] / 16);
    sk1 += (swr[x] & 0x3) + 1;
    const i = 200 * (45 + skew) + x;
    image[i + 0] = 0;
    image[i + 1] = 0;
    image[i + 200] = 0;
    image[i + 201] = 0;
  }
}

export function dots(image: Buffer, dr: Buffer, dots: number) {
  for (let n = 0; n < dots; n++) {
    const v = dr.readUInt32BE(n);
    const i = v % (200 * 67);

    image[i + 0] = 0xff;
    image[i + 1] = 0xff;
    image[i + 2] = 0xff;
    image[i + 200] = 0xff;
    image[i + 201] = 0xff;
    image[i + 202] = 0xff;
  }
}

export function blur(image: Buffer) {
  for (let i = 0, y = 0; y < 68; y++) {
    for (let x = 0; x < 198; x++) {
      const c11 = image[i + 0];
      const c12 = image[i + 1];
      const c21 = image[i + 200];
      const c22 = image[i + 201];
      image[i++] = Math.floor((c11 + c12 + c21 + c22) / 4);
    }
  }
}

export function hollow(image: Buffer) {
  const om = Buffer.alloc(70 * 200).fill(0xff);
  let i = 0;
  let o = 0;

  for (let y = 0; y < 70; y++) {
    for (let x = 4; x < 200 - 4; x++) {
      if (image[i] > 0xf0 && image[i + 1] < 0xf0) {
        om[o] = 0;
        om[o + 1] = 0;
      } else if (image[i] < 0xf0 && image[i + 1] > 0xf0) {
        om[o] = 0;
        om[o + 1] = 0;
      }

      i++;
      o++;
    }
  }

  om.copy(image);
}
