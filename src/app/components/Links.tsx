import { IoLogoDiscord } from "react-icons/io5";
import { FaXTwitter } from "react-icons/fa6";
import { PiGlobe } from "react-icons/pi";
import { FaLinkedin } from "react-icons/fa";
import { SiFarcaster } from "react-icons/si";
import { parse } from "urlite";

const urlIconMapping = [
  { url: "discord.com", icon: <IoLogoDiscord /> },
  { url: "x.com", icon: <FaXTwitter /> },
  { url: "linkedin.com", icon: <FaLinkedin /> },
  { url: "farcaster.com", icon: <SiFarcaster /> },
];

export const getLinkIcon = (url) => {
  let icon = <PiGlobe />;
  for (let mapping of urlIconMapping) {
    if (url.includes(mapping.url)) {
      icon = mapping.icon;
      break;
    }
  }

  return icon;
};

export const prettifyLink = (url) => {
  return parse(url)?.hostname?.replace("www.", "") || url
}