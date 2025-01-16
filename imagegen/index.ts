import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateSpriteSheet(inputFile: string, outputFile: string, numFrames = 32) {
  // Create output directory if it doesn't exist
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const size = 64; // Set consistent sprite size
  const frames = [];

  // Generate each rotated frame
  for (let i = 0; i < numFrames; i++) {
    const rotation = (i * 360) / numFrames;
    frames.push({
      input: await sharp(inputFile)
        .rotate(rotation, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .resize(size, size)
        .toBuffer(),
      left: i * size,
      top: 0
    });
  }

  // Create the sprite sheet
  await sharp({
    create: {
      width: size * numFrames,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite(frames)
  .toFile(outputFile);
  
  console.log(`Generated sprite sheet: ${outputFile}`);
}

// Example usage for each language icon
const languages = ['javascript', 'python', 'lua', 'java', 'typescript', 'cpp', 'rust', 'kotlin'];

languages.forEach(lang => {
  generateSpriteSheet(
    `./source/${lang}.png`,
    `../public/assets/languages/${lang}-sheet.png`
  );
});