import fs from "fs";
import path from "path";
import { IncomingForm } from "formidable";
import { convertReactToHtml } from "@/app/utils/reactToHtml";

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle `form-data`
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const dataDir = path.join('tmp', "data", "input");
    const imagesDir = path.join(process.cwd(), "public", "uploads");
    const form = new IncomingForm({ uploadDir: imagesDir, keepExtensions: true});

    // Ensure directories exist
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        return res.status(500).json({ message: "Error processing upload" });
      }
      const { communityName, description, primaryColor, communityLinks } = fields;
      if (!communityName) {
        return res.status(400).json({ message: "Community Name cannot be empty" });
      }
      const sanitizedCommunityName = communityName[0].replace(/[^a-zA-Z0-9-_]/g, "");
      if (!sanitizedCommunityName) {
        return res.status(400).json({ message: "Invalid communityName" });
      }
      const slug = sanitizedCommunityName.toLowerCase()

      let imageUrl
      if(files.communityLogo) {
        const uploadedFile = files.communityLogo[0];
        imageUrl = uploadedFile ? `/uploads/${path.basename(uploadedFile.filepath)}` : null;
      }

      // Save the communityName and image URL to a JSON file
      const filePath = path.join(dataDir, `${slug}.json`);
      fs.writeFileSync(filePath, JSON.stringify({
        communityName: sanitizedCommunityName,
        description,
        primaryColor,
        imageUrl,
        communityLinks,
      }));

      const protocol = req.headers["x-forwarded-proto"] || (req.connection.encrypted ? "https" : "http");
      const domain = `${protocol}://${req.headers.host}`;
      const directoryCid = await convertReactToHtml(slug, `${domain}/preview/${slug}`)
      res.status(200).json({ cid: directoryCid });
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
