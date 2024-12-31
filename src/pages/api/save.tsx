import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
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
  if (req.method === 'POST') {
    try {
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

      // Wait for formidable to finish parsing
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

      return res.status(200).json({ message: 'success' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Something went wrong' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
