const IMAGE_MAX_BYTES = 2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function isExplicitHeicBrand(bytes: Uint8Array): boolean {
  if (bytes.length < 12) {
    return false;
  }

  const isFtyp =
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70;

  if (!isFtyp) {
    return false;
  }

  const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  return brand === "heic" || brand === "heix" || brand === "hevc" || brand === "hevx";
}

function containsFourCc(bytes: Uint8Array, marker: string): boolean {
  if (bytes.length < 4 || marker.length !== 4) {
    return false;
  }

  const markerBytes = new TextEncoder().encode(marker);
  for (let index = 0; index <= bytes.length - 4; index += 1) {
    if (
      bytes[index] === markerBytes[0] &&
      bytes[index + 1] === markerBytes[1] &&
      bytes[index + 2] === markerBytes[2] &&
      bytes[index + 3] === markerBytes[3]
    ) {
      return true;
    }
  }

  return false;
}

function isJpegMagic(bytes: Uint8Array): boolean {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isPngMagic(bytes: Uint8Array): boolean {
  if (bytes.length < 8) {
    return false;
  }

  return (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

function isWebpMagic(bytes: Uint8Array): boolean {
  if (bytes.length < 12) {
    return false;
  }

  const riff =
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
  const webp =
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;

  return riff && webp;
}

function isAvifMagic(bytes: Uint8Array): boolean {
  if (bytes.length < 12) {
    return false;
  }

  const isFtyp =
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70;

  if (!isFtyp) {
    return false;
  }

  return containsFourCc(bytes, "avif") || containsFourCc(bytes, "avis");
}

function matchesMagicForMime(bytes: Uint8Array, mimeType: string): boolean {
  if (mimeType === "image/jpeg") {
    return isJpegMagic(bytes);
  }

  if (mimeType === "image/png") {
    return isPngMagic(bytes);
  }

  if (mimeType === "image/webp") {
    return isWebpMagic(bytes);
  }

  if (mimeType === "image/avif") {
    return isAvifMagic(bytes);
  }

  return false;
}

function isLikelyHeicFile(file: File): boolean {
  const mime = file.type.toLowerCase();
  if (mime === "image/heic" || mime === "image/heif") {
    return true;
  }

  const name = file.name.trim().toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

export { IMAGE_MAX_BYTES };

export async function validateImageFile(file: File): Promise<void> {
  if (!file || file.size === 0) {
    throw new Error("Selecciona una imagen válida.");
  }

  if (file.size > IMAGE_MAX_BYTES) {
    throw new Error("La imagen no puede superar 2 MB.");
  }

  if (isLikelyHeicFile(file)) {
    throw new Error(
      "HEIC no está soportado en el navegador. Convierte la foto a JPG o PNG y vuelve a subirla."
    );
  }

  if (!file.type) {
    throw new Error("Formato no permitido. Usa JPG, PNG, WebP o AVIF.");
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Formato no permitido. Usa JPG, PNG, WebP o AVIF.");
  }

  const header = new Uint8Array(await file.slice(0, 32).arrayBuffer());

  if (isExplicitHeicBrand(header)) {
    throw new Error(
      "Parece un archivo HEIC/HEIF. Convierte la foto a JPG o PNG y vuelve a subirla."
    );
  }

  if (!matchesMagicForMime(header, file.type)) {
    throw new Error(
      "El archivo no coincide con el formato indicado. Usa una imagen JPG, PNG, WebP o AVIF real."
    );
  }
}
