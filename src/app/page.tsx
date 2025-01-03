'use client'

import { useEffect, useRef, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { LuPencilLine } from "react-icons/lu";
import { FiCheck, FiPlus } from "react-icons/fi";
import { TwitterPicker } from "react-color";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { getLinkIcon, prettifyLink } from "./components/Links";
import { Preview } from "./components/Preview";
import { CommunityLinksInterface } from "./interfaces/CommunityLinksInterface";
import Link from "next/link";

export default function Home() {
  const componentRef = useRef(null);

  const [communityName, setCommunityName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [primaryColor, setPrimaryColor] = useState<string>("#3C65E5");
  const [communityLogo, setCommunityLogo] = useState<string|null>();
  const [communityLinks, setCommunityLinks] = useState<CommunityLinksInterface[]>([]);
  const [uploading, setUploading] = useState<boolean>(false)
  const [cid, setCid] = useState<string|null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setCommunityLogo(reader.result?.toString()||null);
        };
        reader.readAsDataURL(file);
      }
    } else {
      alert('Error uploading image')
    }
  };

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('communityName', communityName)
      localStorage.setItem('description', description)
      localStorage.setItem('primaryColor', primaryColor)
      if(communityLogo) {
        localStorage.setItem('communityLogo', communityLogo)
      }
      localStorage.setItem('communityLinks', JSON.stringify(communityLinks))
    }
  }, [communityName, description, primaryColor, communityLogo, communityLinks])

  const handleAddLink = () => {
    setCommunityLinks([...communityLinks, { id: Date.now(), url: "", isEditing: true }]);
  };

  const handleUpdateLink = (id: number, newUrl: string) => {
    setCommunityLinks(
      communityLinks.map((link) => (link.id === id ? { ...link, url: newUrl } : link))
    );
  };

  const toggleEditMode = (id: number) => {
    setCommunityLinks(
      communityLinks.map((link) =>
        link.id === id ? { ...link, isEditing: !link.isEditing } : link
      )
    );
  };

  const handleDeleteLink = (id: number) => {
    setCommunityLinks(communityLinks.filter((link) => link.id !== id));
  };

  const handleSave = async () => {
    setUploading(true)
    setCid(null)

    const formData = new FormData();
    formData.append("communityName", communityName.trim());
    if (description) formData.append("description", description);
    if (primaryColor) formData.append("primaryColor", primaryColor);
    if (communityLogo) formData.append("communityLogo", communityLogo);
    if (communityLinks) formData.append("communityLinks", JSON.stringify(communityLinks));

    await fetch("/api/generate", {
      method: "POST",
      body: formData,
    }).then((response) =>
      response.json()
    ).then((res) => {
      setUploading(false)
      setCid(res.directoryCid)
    }).catch((error) => {
      console.error('Failed to save the page', error);
    })
  }

  return (
    <div
      className="max-w-6xl mx-auto gap-6 p-6 bg-white shadow-md rounded-md"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Add your MyUnicornLink details</h2>
        <div className="flex gap-2">
          {cid && (
            <a
              target="_blank"
              href={`https://ipfs.io/ipfs/${cid}`}
              rel="noopener noreferrer"
            >
              <button
                className="flex items-center px-4 py-2 border-2 text-sm rounded-md disabled:bg-gray-300"
              >
                {cid}
              </button>
            </a>
          )}
          <Link target="_blank" href="/preview" rel="noopener noreferrer">
            <button
              className="flex items-center px-4 py-2 bg-purple-500 text-white text-sm rounded-md hover:bg-purple-600 disabled:bg-gray-300"
            >
              Preview
            </button>
          </Link>
          <button
            onClick={handleSave}
            disabled={!communityName || uploading}
            className="flex items-center px-4 py-2 bg-purple-500 text-white text-sm rounded-md hover:bg-purple-600 disabled:bg-gray-300"
          >
            {uploading ? "Uploading..." : "Upload to IPFS"}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Description</label>
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
                  accept="image/*"
                  onChange={handleImageChange}
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
            <p>How your page will look</p>
          </div>
          <div ref={componentRef}>
            <Preview
              communityName={communityName}
              description={description}
              primaryColor={primaryColor}
              communityLogo={communityLogo}
              communityLinks={JSON.stringify(communityLinks)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
