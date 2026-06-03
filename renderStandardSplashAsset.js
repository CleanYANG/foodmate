const sharp = require('sharp');

const SIZE = 1024;
const OUTPUT = 'assets/splash-standard.png';
const bg = { r: 250, g: 244, b: 232, alpha: 0 };

const svg = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <text
    x="512"
    y="818"
    text-anchor="middle"
    fill="#4A2E22"
    fill-opacity="0.52"
    font-size="38"
    font-weight="500"
    font-family="PingFang SC, Noto Sans CJK SC, Microsoft YaHei, sans-serif"
    letter-spacing="2.4"
  >故人具鸡黍</text>
  <text
    x="512"
    y="882"
    text-anchor="middle"
    fill="#4A2E22"
    fill-opacity="0.46"
    font-size="28"
    font-weight="400"
    font-family="Avenir Next, Helvetica Neue, Arial, sans-serif"
    letter-spacing="1.4"
  >Save me a seat.</text>
</svg>
`;

async function main() {
  const logo = await sharp('assets/logo.png').resize({ width: 560 }).png().toBuffer();

  await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 4,
      background: bg,
    },
  })
    .composite([
      {
        input: logo,
        left: Math.round((SIZE - 560) / 2),
        top: 118,
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
