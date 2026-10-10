import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateIcons() {
  const svgPath = path.resolve('public', 'icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  console.log('Generating PNG icons for Android PWA...');

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.resolve('public', 'icon-192.png'));
  console.log('Created icon-192.png');

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.resolve('public', 'icon-512.png'));
  console.log('Created icon-512.png');

  // 512x512 maskable (with 10% safe zone padding)
  await sharp(svgBuffer)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: '#090d16'
    })
    .png()
    .toFile(path.resolve('public', 'icon-maskable-512.png'));
  console.log('Created icon-maskable-512.png');

  // 180x180 apple touch icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve('public', 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // Generate Native Android Mipmap Icons
  const androidDensities = [
    { dir: 'mipmap-mdpi', launcher: 48, foreground: 108 },
    { dir: 'mipmap-hdpi', launcher: 72, foreground: 162 },
    { dir: 'mipmap-xhdpi', launcher: 96, foreground: 216 },
    { dir: 'mipmap-xxhdpi', launcher: 144, foreground: 324 },
    { dir: 'mipmap-xxxhdpi', launcher: 192, foreground: 432 },
  ];

  const androidResDir = path.resolve('android', 'app', 'src', 'main', 'res');
  if (fs.existsSync(androidResDir)) {
    console.log('Generating Native Android Mipmap icons...');
    for (const d of androidDensities) {
      const targetDir = path.join(androidResDir, d.dir);
      if (!fs.existsSync(targetDir)) continue;

      // ic_launcher.png
      await sharp(svgBuffer)
        .resize(d.launcher, d.launcher)
        .png()
        .toFile(path.join(targetDir, 'ic_launcher.png'));

      // ic_launcher_round.png (circular mask)
      const radius = d.launcher / 2;
      const circleSvg = Buffer.from(
        `<svg width="${d.launcher}" height="${d.launcher}"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="#fff"/></svg>`
      );
      await sharp(svgBuffer)
        .resize(d.launcher, d.launcher)
        .composite([{ input: circleSvg, blend: 'dest-in' }])
        .png()
        .toFile(path.join(targetDir, 'ic_launcher_round.png'));

      // ic_launcher_foreground.png (centered in 108dp safe zone)
      const innerSize = Math.round(d.foreground * 0.66);
      const pad = Math.floor((d.foreground - innerSize) / 2);
      const padExtra = d.foreground - innerSize - pad * 2;
      await sharp(svgBuffer)
        .resize(innerSize, innerSize)
        .extend({
          top: pad,
          bottom: pad + padExtra,
          left: pad,
          right: pad + padExtra,
          background: { r: 9, g: 13, b: 22, alpha: 0 }
        })
        .png()
        .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));
    }
    console.log('All Native Android Mipmap icons generated successfully!');

    // Generate Native Android Splash Screens
    console.log('Generating Native Android Splash screens...');
    const splashTargets = [
      { dir: 'drawable', w: 480, h: 800, logo: 192 },
      { dir: 'drawable-port-mdpi', w: 320, h: 480, logo: 128 },
      { dir: 'drawable-port-hdpi', w: 480, h: 800, logo: 192 },
      { dir: 'drawable-port-xhdpi', w: 720, h: 1280, logo: 256 },
      { dir: 'drawable-port-xxhdpi', w: 960, h: 1600, logo: 320 },
      { dir: 'drawable-port-xxxhdpi', w: 1280, h: 1920, logo: 384 },
      { dir: 'drawable-land-mdpi', w: 480, h: 320, logo: 128 },
      { dir: 'drawable-land-hdpi', w: 800, h: 480, logo: 192 },
      { dir: 'drawable-land-xhdpi', w: 1280, h: 720, logo: 256 },
      { dir: 'drawable-land-xxhdpi', w: 1600, h: 960, logo: 320 },
      { dir: 'drawable-land-xxxhdpi', w: 1920, h: 1280, logo: 384 },
    ];

    for (const s of splashTargets) {
      const targetDir = path.join(androidResDir, s.dir);
      if (!fs.existsSync(targetDir)) continue;

      const logoBuf = await sharp(svgBuffer)
        .resize(s.logo, s.logo)
        .png()
        .toBuffer();

      await sharp({
        create: {
          width: s.w,
          height: s.h,
          channels: 4,
          background: { r: 2, g: 6, b: 23, alpha: 1 } // #020617
        }
      })
        .composite([{ input: logoBuf, gravity: 'center' }])
        .png()
        .toFile(path.join(targetDir, 'splash.png'));
    }
    console.log('All Native Android Splash screens generated successfully!');
  }

  console.log('All PWA and Android icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
