"use client"

import { CommunityLinksInterface, Preview } from "@/app/components/Preview"
import { useEffect, useState } from "react"

export default function Page() {
  const [communityName, setCommunityName] = useState<string>('');
  const [description, setDescription] = useState<string>("");
  const [primaryColor, setPrimaryColor] = useState<string>("#3C65E5");
  const [communityLogo, setCommunityLogo] = useState<string|null>();
  const [communityLinks, setCommunityLinks] = useState<CommunityLinksInterface[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCommunityName(localStorage.getItem('communityName')||'')
      setDescription(localStorage.getItem('description')||'')
      setPrimaryColor(localStorage.getItem('primaryColor')||"#3C65E5")
      setCommunityLogo(localStorage.getItem('communityLogo'))
      if(localStorage.getItem('communityLinks')) {
        setCommunityLinks(JSON.parse(localStorage.getItem('communityLinks')||''))
      }
    }
  }, [])

  return (
    <Preview
      communityName={communityName}
      description={description}
      primaryColor={primaryColor}
      communityLogo={communityLogo}
      communityLinks={communityLinks}
    />
  );
}