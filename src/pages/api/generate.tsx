import { IncomingForm } from "formidable";
import { convertReactToHtml } from "@/app/utils/reactToHtml";
import { addDirectoryToIPFS } from "@/app/utils/pinata";

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle `form-data`
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const parseForm = (req) => {
      const form = new IncomingForm();
      return new Promise((resolve, reject) => {
        form.parse(req, (err, fields) => {
          if (err) return reject(err);
          resolve({ fields });
        });
      });
    }

    const { fields } = await parseForm(req) as { fields: { slug: string[] }};
    const slug = fields.slug[0]
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
