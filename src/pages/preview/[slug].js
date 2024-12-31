import '@/app/globals.css';

import fs from "fs";
import path from "path";
import { Preview } from "../../app/components/Preview";

export async function getStaticPaths() {
  const dataDir = path.join(process.env.DATA_DIR_ROOT, "data", "input");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const files = fs.readdirSync(dataDir);

  const paths = files.map((file) => ({
    params: { slug: file.replace(".json", "") },
  }));

  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const filePath = path.join(process.env.DATA_DIR_ROOT, "data", "input", `${params.slug}.json`);

  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    return {
      props: {
        communityName: data.communityName,
        description: data.description,
        primaryColor: data.primaryColor,
        imageUrl: data.communityLogo,
        communityLinks: JSON.parse(data.communityLinks),
      },
    };
  } catch (error) {
    console.error("Error reading file:", error.message);
    return { notFound: true };
  }
}

export default function GeneratedPage({ communityName, description, primaryColor, imageUrl, communityLinks }) {
  return (
    <Preview
      communityName={communityName}
      description={description}
      primaryColor={primaryColor}
      communityLogo={imageUrl}
      communityLinks={communityLinks}
    />
  );
}
