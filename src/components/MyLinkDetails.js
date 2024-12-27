import React, { useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { LuPencilLine } from "react-icons/lu";
import { FiCheck, FiPlus } from "react-icons/fi";
import { IoLogoDiscord } from "react-icons/io5";
import { FaXTwitter } from "react-icons/fa6";
import { PiGlobe } from "react-icons/pi";
import { FaLinkedin } from "react-icons/fa";
import { TwitterPicker } from "react-color";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { SiFarcaster } from "react-icons/si";
import { parse } from "urlite"

const MyLinkDetails = () => {
  const urlIconMapping = [
    { url: "discord.com", icon: <IoLogoDiscord /> },
    { url: "x.com", icon: <FaXTwitter /> },
    { url: "linkedin.com", icon: <FaLinkedin /> },
    { url: "farcaster.com", icon: <SiFarcaster /> },
  ];

  const [communityName, setCommunityName] = useState("Ser Foobar");
  const [description, setDescription] = useState("Foobullish on the Future of Web3");
  const [primaryColor, setPrimaryColor] = useState("#3C65E5");
  const [communityLogo, setCommunityLogo] = useState(null);
  const [communityLinks, setCommunityLinks] = useState([
    { id: 1, url: "https://discord.com/foobar", isEditing: false },
    { id: 2, url: "https://x.com/foobar", isEditing: false },
    { id: 3, url: "https://foobar.io", isEditing: false },
  ]);

  const getLinkIcon = (url) => {
    let icon = <PiGlobe />;
    for (let mapping of urlIconMapping) {
      if (url.includes(mapping.url)) {
        icon = mapping.icon;
        break;
      }
    }

    return icon;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setCommunityLogo(file ? URL.createObjectURL(file) : null);
  };

  const handleAddLink = () => {
    setCommunityLinks([...communityLinks, { id: Date.now(), url: "", isEditing: true, icon: null }]);
  };

  const handleUpdateLink = (id, newUrl) => {
    setCommunityLinks(
      communityLinks.map((link) => (link.id === id ? { ...link, url: newUrl } : link))
    );
  };

  const toggleEditMode = (id) => {
    setCommunityLinks(
      communityLinks.map((link) =>
        link.id === id ? { ...link, isEditing: !link.isEditing } : link
      )
    );
  };

  const handleDeleteLink = (id) => {
    setCommunityLinks(communityLinks.filter((link) => link.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto gap-6 p-6 bg-white shadow-md rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Add your MyUnicornLink details</h2>
        <button className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">
          Save
          <FiCheck className="w-5 h-5 ml-2 text-white" />
        </button>
      </div>
      <div className="grid grid-cols-2">
        <div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Community name</label>
            <input
              type="text"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Community description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Primary color</label>
            <TwitterPicker
              triangle="hide"
              color={primaryColor}
              onChangeComplete={(color) => setPrimaryColor(color.hex)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Community logo</label>
            {!communityLogo ? (
              <label
                className="block w-full p-6 text-center border-2 border-dashed rounded-md bg-purple-50 text-purple-700 cursor-pointer hover:bg-purple-100"
              >
                <span className="block text-lg font-semibold">Choose a file to upload</span>
                <span className="block text-sm mt-2">JPG or PNG with maximum size of 2MB</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <label className="relative cursor-pointer">
                <img
                  src={communityLogo}
                  alt="Community Logo"
                  className="mt-2 w-32 h-32 object-cover rounded-md hover:opacity-80"
                />
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Community networks</label>
            {communityLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 bg-gray-100 rounded-lg mb-2"
              >
                <div className="flex items-center space-x-2 flex-grow">
                  <div className="p-2 bg-white rounded-lg hover:bg-gray-100">
                    {getLinkIcon(link.url)}
                  </div>
                  {link.isEditing ? (
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleUpdateLink(link.id, e.target.value)}
                      className="flex-grow p-2 border rounded-md bg-white"
                    />
                  ) : (
                    <p className="text-gray-800">{parse(link.url).hostname}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                    onClick={() => toggleEditMode(link.id)}
                  >
                    {link.isEditing ? (
                      <FiCheck className="w-5 h-5 text-gray-600" />
                    ) : (
                      <LuPencilLine className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <button
                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                    onClick={() => handleDeleteLink(link.id)}
                  >
                    <FaRegTrashAlt className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={handleAddLink}
              className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            >
              Add a community link
              <FiPlus className="w-5 h-5 ml-2 text-white" />
            </button>
          </div>
        </div>
        <div className="p-8">
          <div className="mb-4 px-4 py-2 bg-gray-100 text-black font-semibold rounded-md flex items-center space-x-2 justify-center">
            <IoMdInformationCircleOutline />
            <p>Your community real look</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-md h-max">
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
                {communityLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600"
                    style={{ color: primaryColor }}
                  >
                    {getLinkIcon(link.url)}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyLinkDetails;
