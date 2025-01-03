import { IncomingForm } from "formidable";
import { convertReactToHtml } from "@/app/utils/reactToHtml";
import { addDirectoryToIPFS } from "@/app/utils/pinata";
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle `form-data`
  },
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
    const data_dir = process.env.DATA_DIR_ROOT || "tmp"
    const dataDir = path.join(data_dir, 'data', 'input');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

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
    const { communityName, description, primaryColor, communityLogo, communityLinks } = fields;
    if (!communityName) {
      return res.status(400).json({ message: 'Community Name cannot be empty' });
    }

    const slug = communityName[0]
      .replace(/[^a-zA-Z0-9-_]/g, '')
      .toLowerCase();
    const filePath = path.join(dataDir, `${slug}.json`);

    fs.writeFileSync(
      filePath,
      JSON.stringify({ communityName, description, primaryColor, communityLogo, communityLinks })
    );

    const protocol = req.headers["x-forwarded-proto"] || (req.connection.encrypted ? "https" : "http");
    const domain = `${protocol}://${req.headers.host}`;
    const downloadDir = await convertReactToHtml(slug?.toString() || '', `${domain}/preview/${slug}`)
    if(downloadDir) {
      const directoryCid = await addDirectoryToIPFS(downloadDir)
      res.status(200).json({ directoryCid });
    } else {
      res.status(400).json({ message: "Error converting react to HTML" });
    }
  }
}
