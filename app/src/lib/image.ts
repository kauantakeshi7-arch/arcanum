// Porte de index.html:1957-1979 (compressImageToWebP) — mesmo algoritmo,
// usado sempre que o usuário anexa uma foto (posts, stories, perfil).
export function compressImageToWebP(file: File, maxSize = 1080, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round(height * (maxSize / width));
            width = maxSize;
          } else {
            width = Math.round(width * (maxSize / height));
            height = maxSize;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar imagem'))), 'image/webp', quality);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
