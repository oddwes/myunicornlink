import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { create, globSource } from 'kubo-rpc-client';

async function addDirectoryToIPFS(directoryPath) {
  const ipfs = create({ url: 'http://127.0.0.1:5001/api/v0' });

  // Options for wrapping the entire directory
  const addOptions = {
    wrapWithDirectory: true
  };

  console.log(`Adding directory "${directoryPath}" to IPFS...`);
  const imported = []
  // Use globSource to recursively fetch all files from the directory
  for await (const file of ipfs.addAll(globSource(directoryPath, '**/*'), addOptions)) {
    imported.push(file)
    console.log(`Added: ${file.path} | CID: ${file.cid}`);
  }

  console.log('Directory added successfully!');
  return imported[imported.length - 1].cid
}

export default async function handler(req, res) {
  const { slug } = req.query
  const targetUrl = `http://localhost:3000/preview/${slug}`; // Replace with your target route
  const downloadDir = path.join(process.cwd(), `downloads/${slug}`); // Directory to save images

  try {
    // Create the download directory if it doesn't exist
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the page
    await page.goto(targetUrl, { waitUntil: 'networkidle0' });

    // Inline all CSS styles
    const inlineStyles = async () => {
      const styles = await page.evaluate(() => {
        const styleSheets = Array.from(document.styleSheets);
        return styleSheets
          .map((styleSheet) => {
            try {
              const rules = Array.from(styleSheet.cssRules);
              return rules.map((rule) => rule.cssText).join('\n');
            } catch (error) {
              console.warn('Cannot access CSS rules:', styleSheet.href);
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
    const downloadImages = async () => {
      const images = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img')).map((img) => ({
          src: img.src,
          originalSrc: img.src, // Save original src for replacement
        }));
      });

      const localImagePaths = {};

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

    // Apply inlining and image downloading
    await inlineStyles();
    await downloadImages();

    // Extract the final HTML content
    const finalHTML = await page.content();
    fs.writeFileSync(path.join(downloadDir, 'index.html'), finalHTML, 'utf-8');

    // Close Puppeteer
    await browser.close();
    const directoryCid = await addDirectoryToIPFS(downloadDir)
    res.status(200).json({ directoryCid })
  } catch (error) {
    console.error('Error generating self-contained HTML:', error);
    res.status(500).send('Failed to generate HTML');
  }
}
