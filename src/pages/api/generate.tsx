import PinataClient from '@pinata/sdk';
import chromium from '@sparticuz/chromium';
import axios from 'axios';
import { IncomingForm } from "formidable";
import fs from 'fs';
import path from 'path';
import puppeteer, { Page } from "puppeteer";
import puppeteerCore from 'puppeteer-core';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle `form-data`
  },
};

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

interface PageDataProps {
  communityName: string[],
  description: string[],
  primaryColor: string[],
  communityLogo: string[],
  communityLinks: string[],
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const data_dir_root = process.env.DATA_DIR_ROOT || 'tmp'
    const downloadDir = path.join(data_dir_root, 'upload')
    if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });

    const parseForm = (req) => {
      const form = new IncomingForm();
      return new Promise((resolve, reject) => {
        form.parse(req, (err, fields) => {
          if (err) return reject(err);
          resolve({ fields });
        });
      });
    }

    const { fields } = await parseForm(req) as { fields: PageDataProps };
    console.log('parsed form')

    const { communityName } = fields;
    console.log(communityName)

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

    const protocol = req.headers["x-forwarded-proto"]
    const targetUrl = `${protocol}://${req.headers.host}/preview`;
    await page.goto(targetUrl, { waitUntil: 'networkidle0' });

    await page.evaluate((fields) => {
      const { communityName, description, primaryColor, communityLogo, communityLinks } = fields;
      localStorage.setItem('communityName', communityName[0]);
      localStorage.setItem('description', description[0]);
      localStorage.setItem('primaryColor', primaryColor[0]);
      localStorage.setItem('communityLogo', communityLogo[0]);
      localStorage.setItem('communityLinks', communityLinks[0]);
    }, fields);
    await page.goto(targetUrl, { waitUntil: 'networkidle0' });
    await inlineStyles(page);
    await downloadImages(page, downloadDir);
    const finalHTML = await page.content();
    fs.writeFileSync(path.join(downloadDir, 'index.html'), finalHTML, 'utf-8');

    const pinata = new PinataClient(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
    const result = await pinata.pinFromFS(downloadDir)
    const directoryCid = result.IpfsHash

    if(directoryCid) {
      res.status(200).json({ directoryCid });
    } else {
      res.status(400).json({ message: "Error converting react to HTML" });
    }
  }
}
