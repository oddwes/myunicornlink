import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { createHelia } from "helia";
import { unixfs } from "@helia/unixfs";
import { IncomingForm } from "formidable";

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle `form-data`
  },
};

// Initialize Helia instance
async function createHeliaInstance() {
  const helia = await createHelia();
  const fs = unixfs(helia); // UnixFS for file management
  return { helia, fs };
}

async function compilePage(htmlFilePath, outputFilePath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Load the HTML file
  await page.goto(`file://${htmlFilePath}`, { waitUntil: "networkidle0" });

  // Save the compiled page
  const content = await page.content();
  fs.writeFileSync(outputFilePath, content);

  await browser.close();
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const form = new IncomingForm(); // Use `IncomingForm` from `formidable`
    const dataDir = path.join(process.cwd(), "data");

    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        return res.status(500).json({ message: "Error processing upload" });
      }

      const { slug } = fields;
      const sanitizedSlug = slug[0]?.replace(/[^a-zA-Z0-9-_]/g, "");

      if (!sanitizedSlug) {
        return res.status(400).json({ message: "Invalid slug" });
      }

      const uploadedFile = files?.image[0];
      const imageUrl = uploadedFile
        ? `/uploads/${path.basename(uploadedFile.filepath)}`
        : null;

      // Generate the static HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${sanitizedSlug}</title>
        </head>
        <body>
          <h1>Generated Page for: ${sanitizedSlug}</h1>
          ${imageUrl ? `<img src="${imageUrl}" alt="${sanitizedSlug}" />` : ""}
        </body>
        </html>
      `;

      try {
        // Write HTML content to a file
        const htmlFilePath = path.join(dataDir, `${sanitizedSlug}.html`);
        fs.writeFileSync(htmlFilePath, htmlContent);

        // Compile the HTML file into a fully-rendered version
        const compiledFilePath = path.join(dataDir, `${sanitizedSlug}-compiled.html`);
        await compilePage(htmlFilePath, compiledFilePath);

        // Create Helia instance and upload the compiled file to IPFS
        const { helia, fs: unixFs } = await createHeliaInstance();
        const fileStream = fs.createReadStream(compiledFilePath);
        const cid = await unixFs.addFile({
          content: fileStream,
        });

        // Get the IPFS URL
        const ipfsUrl = `https://ipfs.io/ipfs/${cid.toString()}`;

        // Save metadata locally
        const metadataFilePath = path.join(dataDir, `${sanitizedSlug}.json`);
        fs.writeFileSync(metadataFilePath, JSON.stringify({ slug: sanitizedSlug, ipfsUrl }));

        res.status(200).json({
          message: "Page generated, compiled, and uploaded to IPFS!",
          slug: sanitizedSlug,
          ipfsUrl,
        });

        // Shutdown Helia
        await helia.stop();
      } catch (error) {
        console.error("Error handling IPFS upload:", error);
        res.status(500).json({ message: "Error handling IPFS upload" });
      }
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
