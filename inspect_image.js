const fs = require('fs');
const path = require('path');

// Read image header to find dimensions
// PNG header starts with 89 50 4E 47 0D 0A 1A 0A
// IHDR chunk starts at byte 12 (0-indexed) with length 13
// Width is at bytes 16-19, Height is at bytes 20-23

const imgPath = path.join(__dirname, 'logos', 'alrouad.png');
if (fs.existsSync(imgPath)) {
    const fd = fs.openSync(imgPath, 'r');
    const buffer = Buffer.alloc(24);
    fs.readSync(fd, buffer, 0, 24, 0);
    fs.closeSync(fd);

    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    console.log(`Image: alrouad.png, Width: ${width}px, Height: ${height}px`);
} else {
    console.log('Image not found');
}
