const sharp = require('sharp');

const OUTPUT = 'assets/splash-icon.png';

async function main() {
  await sharp('assets/logo.png')
    .resize({ width: 720 })
    .png()
    .toFile(OUTPUT);

  console.log(OUTPUT);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
