export const generateUVGridTexture = (): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  const cols = 8;
  const rows = 8;
  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;

  // Colors based on the user's image description (Teal, Yellow, Red logic)
  const colors = [
    '#4d8076', // Teal/Greenish
    '#fceea7', // Yellowish
    '#d95d5d', // Reddish
    '#e8ac65'  // Orange/Tan
  ];

  const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const colorIndex = (x + y) % 4; 
      // A simple pattern variation
      const patternIdx = ((x % 2) + (y % 2) * 2 + Math.floor(x/2) + Math.floor(y/2)) % 4;
      
      ctx.fillStyle = colors[patternIdx];
      ctx.fillRect(x * cellW, y * cellH, cellW, cellH);

      // Text
      ctx.fillStyle = '#1f2937'; // Dark gray text
      ctx.font = 'bold 60px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const label = `${labels[y]}${x + 1}`; // Row Letter + Col Number (Like Chess but rotated in image usually)
      // Based on image provided: A1 is top left.
      // The image shows A1, A2... across top. So Letters are Rows? No, usually Letters are columns in chess, but the image shows "A1 A2 A3".
      // Let's follow the image: A1, A2, A3 are in the first row.
      // So Row 1 = A, Row 2 = B.
      // Wait, looking at image: A1 A2 A3... is Top Row. B1 B2... is second.
      // So Letters are Rows, Numbers are Columns.
      
      const text = `${labels[y]}${x + 1}`;
      ctx.fillText(text, x * cellW + cellW / 2, y * cellH + cellH / 2);
    }
  }

  return canvas.toDataURL();
};
