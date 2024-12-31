import { convertReactToHtml } from "@/app/utils/reactToHtml";

export default async function handler(req, res) {
  try {
    const { slug } = req.query
    const protocol = req.headers["x-forwarded-proto"] || (req.connection.encrypted ? "https" : "http");
    const domain = `${protocol}://${req.headers.host}`;
    const directoryCid = await convertReactToHtml(slug, `${domain}/preview/${slug}`)
    res.status(200).json({ directoryCid })
  } catch (error) {
    res.status(500).send('Error generating self-contained HTML:', error);
  }
}
