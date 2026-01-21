export type BackgroundMode = 'transparent' | 'color' | 'blur';

export interface BackgroundRemovalResult {
  imageData: ImageData;
  mask: ImageData;
}

export interface BackgroundRemovalOptions {
  threshold: number;
  edgeBlur: number;
  mode: BackgroundMode;
  backgroundColor?: string;
  blurAmount?: number;
}

export const DEFAULT_OPTIONS: BackgroundRemovalOptions = {
  threshold: 0.5,
  edgeBlur: 2,
  mode: 'transparent',
  backgroundColor: '#ffffff',
  blurAmount: 10,
};

export class BackgroundRemovalService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private workCanvas: HTMLCanvasElement;
  private workCtx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
    this.workCanvas = document.createElement('canvas');
    this.workCtx = this.workCanvas.getContext('2d', { willReadFrequently: true })!;
  }

  async removeBackground(
    imageSource: HTMLImageElement | ImageBitmap | string,
    options: Partial<BackgroundRemovalOptions> = {},
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    onProgress?.(10);

    let img: HTMLImageElement | ImageBitmap;
    if (typeof imageSource === 'string') {
      img = await this.loadImage(imageSource);
    } else {
      img = imageSource;
    }

    const width = img.width;
    const height = img.height;

    this.canvas.width = width;
    this.canvas.height = height;
    this.workCanvas.width = width;
    this.workCanvas.height = height;

    this.ctx.drawImage(img, 0, 0);
    const imageData = this.ctx.getImageData(0, 0, width, height);

    onProgress?.(30);

    const mask = this.generateMask(imageData, opts.threshold);

    onProgress?.(50);

    if (opts.edgeBlur > 0) {
      this.applyGaussianBlur(mask, opts.edgeBlur);
    }

    onProgress?.(70);

    const result = this.applyMask(imageData, mask, opts);

    onProgress?.(90);

    this.ctx.putImageData(result, 0, 0);

    onProgress?.(100);

    return this.canvas.toDataURL('image/png');
  }

  private async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private generateMask(imageData: ImageData, threshold: number): ImageData {
    const { data, width, height } = imageData;
    const mask = new ImageData(width, height);

    const edgeColors = this.detectEdgeColors(data, width, height);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      let isForeground = true;

      for (const edgeColor of edgeColors) {
        const distance = this.colorDistance(r, g, b, edgeColor.r, edgeColor.g, edgeColor.b);
        if (distance < threshold * 255 * 3) {
          isForeground = false;
          break;
        }
      }

      const alpha = isForeground ? 255 : 0;
      mask.data[i] = alpha;
      mask.data[i + 1] = alpha;
      mask.data[i + 2] = alpha;
      mask.data[i + 3] = 255;
    }

    return this.refineMask(mask, 2);
  }

  private detectEdgeColors(data: Uint8ClampedArray, width: number, height: number): { r: number; g: number; b: number }[] {
    const samples: { r: number; g: number; b: number }[] = [];
    const sampleSize = 10;

    for (let x = 0; x < width; x += Math.floor(width / sampleSize)) {
      const topIdx = x * 4;
      samples.push({ r: data[topIdx], g: data[topIdx + 1], b: data[topIdx + 2] });

      const bottomIdx = ((height - 1) * width + x) * 4;
      samples.push({ r: data[bottomIdx], g: data[bottomIdx + 1], b: data[bottomIdx + 2] });
    }

    for (let y = 0; y < height; y += Math.floor(height / sampleSize)) {
      const leftIdx = y * width * 4;
      samples.push({ r: data[leftIdx], g: data[leftIdx + 1], b: data[leftIdx + 2] });

      const rightIdx = (y * width + width - 1) * 4;
      samples.push({ r: data[rightIdx], g: data[rightIdx + 1], b: data[rightIdx + 2] });
    }

    const colorCounts = new Map<string, { count: number; r: number; g: number; b: number }>();
    for (const sample of samples) {
      const quantized = {
        r: Math.round(sample.r / 16) * 16,
        g: Math.round(sample.g / 16) * 16,
        b: Math.round(sample.b / 16) * 16,
      };
      const key = `${quantized.r},${quantized.g},${quantized.b}`;
      const existing = colorCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        colorCounts.set(key, { count: 1, ...quantized });
      }
    }

    return Array.from(colorCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(({ r, g, b }) => ({ r, g, b }));
  }

  private colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
    return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
  }

  private refineMask(mask: ImageData, iterations: number): ImageData {
    const { width, height } = mask;
    const result = new ImageData(new Uint8ClampedArray(mask.data), width, height);

    for (let iter = 0; iter < iterations; iter++) {
      const temp = new Uint8ClampedArray(result.data);

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;

          let sum = 0;
          let count = 0;

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nIdx = ((y + dy) * width + (x + dx)) * 4;
              sum += temp[nIdx];
              count++;
            }
          }

          const avg = sum / count;
          result.data[idx] = avg > 127 ? 255 : 0;
          result.data[idx + 1] = result.data[idx];
          result.data[idx + 2] = result.data[idx];
        }
      }
    }

    return result;
  }

  private applyGaussianBlur(mask: ImageData, radius: number): void {
    const { data, width, height } = mask;
    const temp = new Uint8ClampedArray(data);

    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const idx = (y * width + x) * 4;

        let sum = 0;
        let weightSum = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const weight = Math.exp(-(distance * distance) / (2 * radius * radius));
            sum += temp[nIdx] * weight;
            weightSum += weight;
          }
        }

        data[idx] = sum / weightSum;
        data[idx + 1] = data[idx];
        data[idx + 2] = data[idx];
      }
    }
  }

  private applyMask(imageData: ImageData, mask: ImageData, options: BackgroundRemovalOptions): ImageData {
    const { width, height } = imageData;
    const result = new ImageData(new Uint8ClampedArray(imageData.data), width, height);

    if (options.mode === 'transparent') {
      for (let i = 0; i < mask.data.length; i += 4) {
        result.data[i + 3] = mask.data[i];
      }
    } else if (options.mode === 'color' && options.backgroundColor) {
      const bgColor = this.hexToRgb(options.backgroundColor);
      for (let i = 0; i < mask.data.length; i += 4) {
        const alpha = mask.data[i] / 255;
        result.data[i] = result.data[i] * alpha + bgColor.r * (1 - alpha);
        result.data[i + 1] = result.data[i + 1] * alpha + bgColor.g * (1 - alpha);
        result.data[i + 2] = result.data[i + 2] * alpha + bgColor.b * (1 - alpha);
        result.data[i + 3] = 255;
      }
    } else if (options.mode === 'blur' && options.blurAmount) {
      this.workCtx.filter = `blur(${options.blurAmount}px)`;
      this.workCtx.drawImage(this.canvas, 0, 0);
      this.workCtx.filter = 'none';
      const blurredData = this.workCtx.getImageData(0, 0, width, height);

      for (let i = 0; i < mask.data.length; i += 4) {
        const alpha = mask.data[i] / 255;
        result.data[i] = result.data[i] * alpha + blurredData.data[i] * (1 - alpha);
        result.data[i + 1] = result.data[i + 1] * alpha + blurredData.data[i + 1] * (1 - alpha);
        result.data[i + 2] = result.data[i + 2] * alpha + blurredData.data[i + 2] * (1 - alpha);
        result.data[i + 3] = 255;
      }
    }

    return result;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 255, g: 255, b: 255 };
  }
}

let serviceInstance: BackgroundRemovalService | null = null;

export function getBackgroundRemovalService(): BackgroundRemovalService {
  if (!serviceInstance) {
    serviceInstance = new BackgroundRemovalService();
  }
  return serviceInstance;
}
