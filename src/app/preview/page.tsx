"use client"

import { Preview } from "@/app/components/Preview"

export default function Page() {
  let communityName
  let description
  let primaryColor
  let communityLogo
  let communityLinks

  if (typeof window !== 'undefined') {
    communityName = localStorage.getItem('communityName')
    description = localStorage.getItem('description')
    primaryColor = localStorage.getItem('primaryColor') || "#3C65E5"
    communityLogo = localStorage.getItem('communityLogo')
    communityLinks = localStorage.getItem('communityLinks')
  }

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