import path from 'path';
import fs from 'fs';
import { GlobalFonts } from '@napi-rs/canvas';

let fontsInitialized = false;

export function initNativeFonts(): void {
  if (fontsInitialized) return;

  try {
    (GlobalFonts as any).loadSystemFonts?.();
  } catch (err: any) {
    console.warn(`[FONT_INIT] Cảnh báo loadSystemFonts: ${err.message}`);
  }

  const fontDir = path.resolve(process.cwd(), 'assets', 'fonts');
  if (fs.existsSync(fontDir)) {
    const fontFiles = [
      { file: 'BeVietnamPro-Regular.ttf', family: 'Be Vietnam Pro', weight: '400' },
      { file: 'BeVietnamPro-Bold.ttf', family: 'Be Vietnam Pro', weight: '700' },
      { file: 'BeVietnamPro-Black.ttf', family: 'Be Vietnam Pro', weight: '900' },
      { file: 'Montserrat.ttf', family: 'Montserrat', weight: '700' },
      { file: 'Montserrat-Bold.ttf', family: 'Montserrat', weight: '700' }
    ];

    for (const f of fontFiles) {
      const fullPath = path.join(fontDir, f.file);
      if (fs.existsSync(fullPath)) {
        try {
          GlobalFonts.registerFromPath(fullPath, f.family);
        } catch (e: any) {
          console.warn(`[FONT_INIT] Không thể nạp font ${f.file}: ${e.message}`);
        }
      }
    }
  }

  fontsInitialized = true;
  console.log('[FONT_INIT] Native Skia Fonts đã sẵn sàng (Be Vietnam Pro, Montserrat, System Fonts).');
}
