import Link from "next/link"
import { getLinkIcon, getLinkStyle, prettifyLink } from "./Links"
import normalizeUrl from "normalize-url"

export interface CommunityLinksInterface {
  id: number
  url: string
  isEditing: boolean
}

export const Preview = ({
  communityName,
  description,
  primaryColor,
  communityLogo,
  communityLinks
} : {
  communityName: string | null,
  description: string | null,
  primaryColor: string,
  communityLogo: string | null | undefined,
  communityLinks: string | null
}) => {
  return (
    <div
      className="p-4 bg-gray-100 rounded-md h-dvh"
    >
      <div className="text-center">
        {communityLogo && (
          <img
            src={communityLogo}
            alt="Community Logo"
            className="mx-auto w-20 h-20 rounded-full"
          />
        )}
        <h1 className="text-2xl font-bold mt-2" style={{ color: primaryColor }}>{communityName}</h1>
        <div className="text-sm whitespace-break-spaces" style={{ color: primaryColor }}>{description}</div>
        <div className="flex justify-center mt-4">
          <div className="grid grid-cols-1 w-96">
            {communityLinks && JSON.parse(communityLinks).map((link) => {
              let urlHref: string
              try {
                urlHref = normalizeUrl(link.url)
              } catch {
                urlHref = link.url
              }

              const buttonStyle = `flex justify-center items-center px-10 py-3 bg-white rounded-lg mb-2 space-x-2 ${getLinkStyle(link.url)}`
              return (
                <Link
                  key={link.id}
                  href={urlHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div
                    key={link.id}
                    className={buttonStyle}
                  >
                    {getLinkIcon(link.url)}
                    <p className="font-semibold truncate">{prettifyLink(link.url)}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}