import { getLinkIcon, prettifyLink } from "./Links"

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
      className="p-4 bg-gray-100 rounded-md h-max"
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
        <p className="text-sm" style={{ color: primaryColor }}>{description}</p>
        <div className="flex justify-center mt-4 space-x-4">
          <div className="grid grid-cols-3 gap-4">
            {communityLinks && JSON.parse(communityLinks).map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600"
                style={{ color: primaryColor }}
              >
                <div
                  key={link.id}
                  className="flex items-center p-3 bg-white rounded-lg mb-2 space-x-2 "
                >
                  {getLinkIcon(link.url)}
                  <p className="text-gray-800 w-full truncate">{prettifyLink(link.url)}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}