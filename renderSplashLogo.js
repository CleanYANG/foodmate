const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outputPath = path.join(__dirname, 'assets', 'splash-icon.png');

const color = '#4A2E22';
const accentColor = '#E2B441';
const background = '#FAF4E8';

const svg = `
<svg width="1242" height="2436" viewBox="0 0 1242 2436" xmlns="http://www.w3.org/2000/svg">
  <rect width="1242" height="2436" fill="${background}" />
  <g transform="translate(0 170)">
    <g transform="translate(131 260) scale(3.05)">
      <line x1="82" y1="32" x2="152" y2="98" stroke="${color}" stroke-width="7" stroke-linecap="round"/>
      <line x1="66" y1="46" x2="141" y2="109" stroke="${color}" stroke-width="7" stroke-linecap="round"/>
      <path d="M237 33L197 74" stroke="${color}" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M194 77L174 99" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M203 84L183 106" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M212 91L192 112" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M173 99C180 91 188 89 195 94C201 98 201 106 195 113L187 122" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M108 118C143 138 180 138 214 118" stroke="${color}" stroke-width="7" stroke-linecap="round" fill="none"/>
      <ellipse cx="160" cy="97" rx="6.5" ry="5.5" fill="${accentColor}" />
      <text x="160" y="204" text-anchor="middle" fill="${color}" font-size="46" font-weight="600"
        font-family="'PingFang SC','Noto Sans CJK SC','Microsoft YaHei','Heiti SC','Arial Unicode MS',sans-serif"
        letter-spacing="1.2">饭搭子</text>
      <text x="160" y="252" text-anchor="middle" fill="${color}" fill-opacity="0.8" font-size="18" font-weight="400"
        font-family="'Avenir Next','Helvetica Neue',Arial,sans-serif" letter-spacing="4.5">fooMate</text>
    </g>
    <g transform="translate(621 1648)">
      <text text-anchor="middle" fill="${color}" fill-opacity="0.52" font-size="48" font-weight="500"
        font-family="'PingFang SC','Noto Sans CJK SC','Microsoft YaHei','Heiti SC','Arial Unicode MS',sans-serif"
        letter-spacing="3">故人具鸡黍</text>
      <text y="84" text-anchor="middle" fill="${color}" fill-opacity="0.48" font-size="34" font-weight="400"
        font-family="'Avenir Next','Helvetica Neue',Arial,sans-serif" letter-spacing="2">Save me a seat.</text>
    </g>
  </g>
</svg>
`;

async function main() {
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  const stats = fs.statSync(outputPath);
  console.log(JSON.stringify({ outputPath, size: stats.size }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
