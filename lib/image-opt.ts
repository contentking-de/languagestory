export type OptimizeOptions = {
  maxWidth?: number;
  format?: 'webp' | 'jpeg' | 'png';
  quality?: number; // 1-100
};

// Server-side no-op optimization to avoid native deps. We compress client-side.
export async function optimizeImage(
  input: Buffer,
  opts: OptimizeOptions = {}
): Promise<{ buffer: Buffer; contentType: string; extension: string }> {
  // Return original; client-side handles compression to WebP.
  return { buffer: input, contentType: 'image/png', extension: 'png' };
}
