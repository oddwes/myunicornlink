'use client'

import { useState } from "react";
import { useRouter } from 'next/navigation'
import { FaRegTrashAlt } from "react-icons/fa";
import { LuPencilLine } from "react-icons/lu";
import { FiCheck, FiPlus } from "react-icons/fi";
import { TwitterPicker } from "react-color";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { getLinkIcon, prettifyLink } from "./components/Links";
import { Preview } from "./components/Preview";

export default function Home() {
  const router = useRouter();
  const [communityName, setCommunityName] = useState("Burlin");
  const [description, setDescription] = useState("Foobullish on the Future of Web3");
  const [primaryColor, setPrimaryColor] = useState("#3C65E5");
  const [communityLogo, setCommunityLogo] = useState(null);
  const [preview, setPreview] = useState(null); // Image preview URL
  const [communityLinks, setCommunityLinks] = useState([
    { id: 1, url: "https://discord.com/foobar", isEditing: false },
    { id: 2, url: "https://x.com/foobar", isEditing: false },
    { id: 3, url: "https://foobar.io", isEditing: false },
  ]);
  const [uploading, setUploading] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCommunityLogo(file);

      // Generate a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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

  const handleSave = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("communityName", communityName.trim());
    if (description) formData.append("description", description);
    if (primaryColor) formData.append("primaryColor", primaryColor);
    if (communityLogo) formData.append("communityLogo", communityLogo);
    if (communityLinks) formData.append("communityLinks", JSON.stringify(communityLinks));

    const response = await fetch("/api/generate", {
      method: "POST",
      body: formData,
    });

    const slug = communityName.trim().toLowerCase()
    if (response.ok) {
      try {
        const response = await fetch(`/api/save_page/${encodeURIComponent(slug)}`);
        if (response.ok) {
        } else {
          console.error('Failed to save the page');
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      alert("Failed to generate page.");
    }
  };


  return (
    <div
      className="max-w-6xl mx-auto gap-6 p-6 bg-white shadow-md rounded-md"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Add your MyUnicornLink details</h2>
        <div className="flex gap-2">
          <button
            disabled={!communityName}
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-300"
          >
            Save
          </button>
          <button
            onClick={() => {}}
            disabled={true}
            // disabled={uploading}
            className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-300"
          >
            {uploading ? "Uploading..." : "Upload to IPFS"}
            <FiCheck className="w-5 h-5 ml-2 text-white" />
          </button>
        </div>
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
            {!preview ? (
              <label
                className="block w-full p-6 text-center border-2 border-dashed rounded-md bg-purple-50 text-purple-700 cursor-pointer hover:bg-purple-100"
              >
                <span className="block text-lg font-semibold">Choose a file to upload</span>
                <span className="block text-sm mt-2">JPG or PNG with maximum size of 2MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <label className="relative cursor-pointer">
                <img
                  src={preview}
                  alt="Community Logo"
                  className="mt-2 w-32 h-32 object-cover rounded-md hover:opacity-80"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
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
                    <p className="text-gray-800">{prettifyLink(link.url)}</p>
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
          <Preview
            communityLogo={preview}
            primaryColor={primaryColor}
            communityName={communityName}
            description={description}
            communityLinks={communityLinks}
          />
        </div>
      </div>
    </div>
  );
}
