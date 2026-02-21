import { renderToStaticMarkup } from 'react-dom/server';
import AppLogoIcon from '@/components/AppLogo';


/**
 * Renders the logo and notification dot onto a canvas and returns the data URL.
 */
export const generateFaviconDataUrl = async (count: number): Promise<string> => {
  if (typeof window === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // 1. Render Logo
  const svgString = renderToStaticMarkup(<AppLogoIcon width="64" height="64" />);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  await new Promise((resolve) => {
    img.onload = resolve;
    img.src = url;
  });

  ctx.clearRect(0, 0, 64, 64);
  
  // 2. Center your Logo (Adjusted for your specific viewBox 80 180 360 150)
  ctx.drawImage(img, 4, 10, 52, 52); 
  URL.revokeObjectURL(url);

  // 3. Precision Blue Dot (Aligned to the extreme top-right corner)
  if (count > 0) {
    ctx.beginPath();
    // Positioned at (54, 10) to sit perfectly in the corner
    ctx.arc(54, 10, 10, 0, 2 * Math.PI); 
    ctx.fillStyle = '#0070f3'; // Notification Blue
    ctx.fill();
    
    // White border prevents the blue from blending into dark browser tabs
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  return canvas.toDataURL('image/png');
};

/**
 * Forcefully syncs the dynamic favicon to the DOM.
 */
export const syncFaviconToDOM = (dataUrl: string) => {
  if (!dataUrl) return;

  // Remove conflicting icon tags that Next.js might have injected
  const existingIcons = document.querySelectorAll("link[rel*='icon']");
  
  let link = document.getElementById('dynamic-favicon') as HTMLLinkElement;
  
  if (!link) {
    existingIcons.forEach(el => el.remove());
    link = document.createElement('link');
    link.id = 'dynamic-favicon';
    link.rel = 'icon';
    link.type = 'image/png';
    document.head.appendChild(link);
  }

  link.href = dataUrl;
};