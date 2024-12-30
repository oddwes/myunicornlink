import { convertReactToHtml } from "@/app/utils/reactToHtml";

export default async function handler(req, res) {
  const { slug } = req.query

  try {
    const directoryCid = await convertReactToHtml(slug)
    res.status(200).json({ directoryCid })
  } catch (error) {
    res.status(500).send('Error generating self-contained HTML:', error);
  }
}
