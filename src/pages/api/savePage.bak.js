import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { createHelia } from "helia";
import { unixfs } from '@helia/unixfs';
import { MemoryDatastore } from 'datastore-core/memory';
import axios from 'axios';

async function addDirectoryToIPFS(directoryPath, heliaFs) {
  const directoryEntries = [];

  function readDirectory(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    entries.forEach((entry) => {
      const entryPath = path.join(dir, entry.name);
      const ipfsPath = path.join(prefix, entry.name);

      if (entry.isDirectory()) {
        // Recursively read subdirectory
        readDirectory(entryPath, ipfsPath);
      } else {
        // Push file content and path to the directoryEntries
        const content = fs.readFileSync(entryPath);
        directoryEntries.push({ path: ipfsPath, content });
      }
    });
  }

  // Read the directory and build the directory entries
  readDirectory(directoryPath);

  // Add the directory to IPFS
  const rootCid = await heliaFs.addDirectory(directoryEntries);

  console.log(`Added directory: ${directoryPath} with CID: ${rootCid}`);
  return rootCid;
}

export default async function handler(req, res) {
  const targetUrl = 'http://localhost:3000/burlin'; // Replace with your target route
  const tempDir = path.join(process.cwd(), 'temp_uploads'); // Directory to temporarily store files

  try {
    // Create a temporary directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

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

      await Promise.all(
        images.map(async (img, index) => {
          try {
            const response = await axios.get(img.src, { responseType: 'arraybuffer' });
            const ext = path.extname(new URL(img.src).pathname) || '.png';
            const fileName = `image${index + 1}${ext}`;
            const filePath = path.join(tempDir, fileName);

            // Save the image locally
            fs.writeFileSync(filePath, response.data);

            // Update the <img> tag on the page
            await page.evaluate(
              (originalSrc, localSrc) => {
                const imgElement = document.querySelector(`img[src="${originalSrc}"]`);
                if (imgElement) {
                  imgElement.src = localSrc; // Update to local path
                }
              },
              img.originalSrc,
              `images/${fileName}` // Reference local path
            );
          } catch (error) {
            console.error(`Failed to download image ${img.src}:`, error);
          }
        })
      );
    };

    // Inline styles and download images
    await inlineStyles();
    await downloadImages();

    // Extract final HTML
    const finalHTML = await page.content();
    fs.writeFileSync(path.join(tempDir, 'index.html'), finalHTML, 'utf8');

    await browser.close();

    // // Initialize Helia
    // const helia = await createHelia({
    //   datastore: new MemoryDatastore(),
    // });
    // const fsUnix = unixfs(helia);

    // // Upload the directory to IPFS
    // const directoryCid = await addDirectoryToIPFS(tempDir, fsUnix);
    // console.log(`Uploaded directory CID: ${directoryCid.cid}`);

    // // Clean up temporary directory
    // fs.rmSync(tempDir, { recursive: true, force: true });

    // res.status(200).json({ directoryCid: directoryCid.toString() });
    res.status(200).json({ finalHTML: finalHTML });
  } catch (error) {
    console.error('Error generating and uploading to IPFS:', error);
    res.status(500).send('Failed to process request');
  }
}
