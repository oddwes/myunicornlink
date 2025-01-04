import { IoLogoDiscord } from "react-icons/io5";
import { FaXTwitter } from "react-icons/fa6";
import { PiGlobe } from "react-icons/pi";
import { FaGithub, FaLinkedin, FaTelegramPlane, FaYoutube } from "react-icons/fa";
import { SiFarcaster } from "react-icons/si";
import { HiOutlineMail } from "react-icons/hi";
import { validate } from "email-validator";

const urlTitleMapping = [
  { url: "discord.com", title: "Discord" },
  { url: "x.com", title: "X" },
  { url: "linkedin.com", title: "LinkedIn" },
  { url: "farcaster.com", title: "Farcaster" },
  { url: "t.me", title: "Telegram" },
  { url: "github.com", title: "Github" },
  { url: "youtube.com", title: "Youtube" },
];

const urlIconMapping = [
  { url: "discord.com", icon: <IoLogoDiscord /> },
  { url: "x.com", icon: <FaXTwitter /> },
  { url: "linkedin.com", icon: <FaLinkedin /> },
  { url: "farcaster.com", icon: <SiFarcaster /> },
  { url: "t.me", icon: <FaTelegramPlane /> },
  { url: "github.com", icon: <FaGithub /> },
  { url: "youtube.com", icon: <FaYoutube /> },
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
  let title = url
  for (const mapping of urlTitleMapping) {
    if (url.includes(mapping.url)) {
      title = mapping.title;
      break;
    }
  }
  return title
}