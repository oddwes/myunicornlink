import puppeteer, { Page } from 'puppeteer';
import chromium from '@sparticuz/chromium';
import puppeteerCore from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Inline all CSS styles
const inlineStyles = async (page: Page) => {
  const styles = await page.evaluate(() => {
    const styleSheets = Array.from(document.styleSheets);
    return styleSheets
      .map((styleSheet) => {
        try {
          const rules = Array.from(styleSheet.cssRules);
          return rules.map((rule) => rule.cssText).join('\n');
        } catch (error) {
          console.warn('Cannot access CSS rules:', error);
          return '';
        }
      })
      .join('\n');
  });

  const styleTag = `<style>${styles}</style>`;
  await page.evaluate((styleTag) => {
    const head = document.head || document.querySelector('head');
    if (head) {
      head.insertAdjacentHTML('beforeend', styleTag);
    }
  }, styleTag);
};

// Download images and update <img> tags
const downloadImages = async (page: Page, downloadDir: string) => {
  const images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map((img) => ({
      src: img.src,
      originalSrc: img.src, // Save original src for replacement
    }));
  });

  const localImagePaths: Record<string, string> = {};

  await Promise.all(
    images.map(async (img, index) => {
      try {
        const response = await axios.get(img.src, { responseType: 'arraybuffer' });
        const ext = path.extname(new URL(img.src).pathname) || '.png';
        const fileName = `image${index + 1}${ext}`;
        const filePath = path.join(downloadDir, fileName);

        // Save the image locally
        fs.writeFileSync(filePath, response.data);

        // Save local path mapping
        localImagePaths[img.src] = `${fileName}`;
      } catch (error) {
        console.error(`Failed to download image ${img.src}:`, error);
      }
    })
  );

  // Update <img> tags in the browser context
  await page.evaluate((localImagePaths) => {
    const images = Array.from(document.querySelectorAll('img'));
    images.forEach((img) => {
      if (localImagePaths[img.src]) {
        img.src = localImagePaths[img.src];
      }
    });
  }, localImagePaths);
};

export const convertReactToHtml = async (slug: string, targetUrl: string) => {
  const data_dir_root = process.env.DATA_DIR_ROOT || 'tmp'
  const downloadDir = path.join(data_dir_root, `data/output/${slug}`); // Directory to save images

  try {
    // Create the download directory if it doesn't exist
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    let browser
    if (process.env.NODE_ENV === 'development') {
      browser = await puppeteer.launch();
    }
    if (process.env.NODE_ENV === 'production') {
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    }
    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: 'networkidle0' });
    await inlineStyles(page);
    await downloadImages(page, downloadDir);
    const finalHTML = await page.content();
    fs.writeFileSync(path.join(downloadDir, 'index.html'), finalHTML, 'utf-8');
    await browser.close();

    return downloadDir
  } catch (error) {
    console.error('Error generating self-contained HTML:', error);
  }
}