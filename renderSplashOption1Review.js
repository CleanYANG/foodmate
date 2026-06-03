const sharp = require('sharp');

const W = 1242;
const H = 2436;
const LOGO_WIDTH = 760;
const LOGO_TOP = 360;
const OUTPUT = 'assets/splash-option1-review.png';

const svg = `
<svg width="1242" height="2436" xmlns="http://www.w3.org/2000/svg">
  <text
    x="621"
    y="1710"
    text-anchor="middle"
    fill="#4A2E22"
    fill-opacity="0.52"
    font-size="46"
    font-weight="500"
    font-family="PingFang SC, Noto Sans CJK SC, Microsoft YaHei, sans-serif"
    letter-spacing="3"
  >故人具鸡黍</text>
  <text
    x="621"
    y="1788"
    text-anchor="middle"
    fill="#4A2E22"
    fill-opacity="0.46"
    font-size="34"
    font-weight="400"
    font-family="Avenir Next, Helvetica Neue, Arial, sans-serif"
    letter-spacing="1.6"
  >Save me a seat.</text>
</svg>
`;

async function main() {
  const resizedLogo = await sharp('assets/logo.png').resize({ width: LOGO_WIDTH }).png().toBuffer();

  await sharp({
    create: {
      width: W,
      height: H,
      channels: 4,
      background: { r: 250, g: 244, b: 232, alpha: 1 },
    },
  })
    .composite([
      {
        input: resizedLogo,
        left: Math.round((W - LOGO_WIDTH) / 2),
        top: LOGO_TOP,
      },
      {
        input: Buffer.from(svg),
        left: 0,
        top: 0,
      },
    ])
    .png()
    .toFile(OUTPUT);

  console.log(OUTPUT);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
