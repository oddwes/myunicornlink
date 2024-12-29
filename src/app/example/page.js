"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null); // The uploaded file
  const [preview, setPreview] = useState(null); // Image preview URL
  const router = useRouter();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);

      // Generate a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      alert("Slug is required.");
      return;
    }

    const formData = new FormData();
    formData.append("slug", input.trim());
    if (image) formData.append("image", image);

    const response = await fetch("/api/example", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      router.push(`/example/${input.trim()}`);
    } else {
      alert("Failed to generate page.");
    }
  };

  return (
    <div>
      <h1>Generate Static Page</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter slug"
        />
        <br />
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <br />
        {preview && (
          <div style={{ marginTop: "10px" }}>
            <p>Image Preview:</p>
            <img
              src={preview}
              alt="Preview"
              style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "8px" }}
            />
          </div>
        )}
        <button type="submit" style={{ marginTop: "10px" }}>
          Generate
        </button>
      </form>
    </div>
  );
}
