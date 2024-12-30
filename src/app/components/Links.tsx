import { IoLogoDiscord } from "react-icons/io5";
import { FaXTwitter } from "react-icons/fa6";
import { PiGlobe } from "react-icons/pi";
import { FaLinkedin } from "react-icons/fa";
import { SiFarcaster } from "react-icons/si";
import { parse } from "urlite";
import { HiOutlineMail } from "react-icons/hi";
import { validate } from "email-validator";

const urlIconMapping = [
  { url: "discord.com", icon: <IoLogoDiscord /> },
  { url: "x.com", icon: <FaXTwitter /> },
  { url: "linkedin.com", icon: <FaLinkedin /> },
  { url: "farcaster.com", icon: <SiFarcaster /> },
];

export const getLinkIcon = (url: string) => {
  let icon = <PiGlobe />;

  if(validate(url)) {
    icon = <HiOutlineMail />
  } else {
    for (const mapping of urlIconMapping) {
      if (url.includes(mapping.url)) {
        icon = mapping.icon;
        break;
      }
    }
  }

  return icon;
};

export const prettifyLink = (url: string) => {
  return parse(url)?.hostname?.replace("www.", "") || url
}