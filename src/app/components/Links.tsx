import { validate } from "email-validator";
import { IoLogoDiscord } from "react-icons/io5";
import { FaXTwitter } from "react-icons/fa6";
import { PiGlobe } from "react-icons/pi";
import { FaGithub, FaInstagram, FaLinkedin, FaTelegramPlane, FaYoutube } from "react-icons/fa";
import { SiFarcaster } from "react-icons/si";
import { MdEmail } from "react-icons/md";
import { ReactElement } from "react";

const urlDataMapping = [
  { url: "discord.com", icon: <IoLogoDiscord />, title: "Discord", style: "button-discord" },
  { url: "x.com", icon: <FaXTwitter />, title: "Twitter", style: "button-x" },
  { url: "linkedin.com", icon: <FaLinkedin />, title: "Linkedin", style: "button-discord" },
  { url: "farcaster.com", icon: <SiFarcaster />, title: "Farcaster", style: "button-farcaster" },
  { url: "t.me", icon: <FaTelegramPlane />, title: "Telegram", style: "button-telegram" },
  { url: "github.com", icon: <FaGithub />, title: "Github", style: "button-github" },
  { url: "youtube.com", icon: <FaYoutube />, title: "Youtube", style: "button-youtube" },
  { url: "instagram.com", icon: <FaInstagram />, title: "Instagram", style: "button-instagram" },
];

export const getLinkIcon = (url: string): ReactElement => {
  let icon = <PiGlobe />;

  if(validate(url)) {
    icon = <MdEmail />
  } else {
    for (const mapping of urlDataMapping) {
      if (url.includes(mapping.url)) {
        icon = mapping.icon;
        break;
      }
    }
  }

  return icon;
};

export const prettifyLink = (url: string): string => {
  let title = url
  for (const mapping of urlDataMapping) {
    if (url.includes(mapping.url)) {
      title = mapping.title;
      break;
    }
  }
  return title
}

export const getLinkStyle = (url: string): string => {
  let style = 'button-default'
  for (const mapping of urlDataMapping) {
    if (url.includes(mapping.url)) {
      style = mapping.style;
      break;
    }
  }
  return style
}