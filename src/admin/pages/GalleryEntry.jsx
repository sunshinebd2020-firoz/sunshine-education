import { useState } from "react";
import "./GalleryEntry.css";

export default function GalleryEntry() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!image) {
      setMessage("Please select an image.");
      return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("category", category);
    formData.append("image", image);

    try {
      const response = await fetch(
        "http://localhost/sunshine-api/api/gallery_upload.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Image uploaded successfully.");

        setTitle("");
        setCategory("");
        setImage(null);
        setPreview("");

        document.getElementById("gallery-image").value = "";
      } else {
        setMessage(data.message || "Upload failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server error.");
    }
  };

  return (
    <div className="gallery-entry">
      <div className="gallery-entry-header">
        <div>
          <h1>Gallery</h1>
          <p>Upload a new gallery image</p>
        </div>
      </div>

      <div className="gallery-entry-card">
        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              placeholder="Enter image title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Category</label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              <option value="Events">Events</option>
              <option value="Seminar">Seminar</option>
              <option value="Classroom">Classroom</option>
              <option value="Students">Students</option>
              <option value="Teachers">Teachers</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="form-group">
            <label>Image</label>

            <input
              id="gallery-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
            />
          </div>

          {preview && (
            <div className="gallery-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}

          <button type="submit" className="gallery-upload-btn">
            Upload Image
          </button>

          {message && (
            <p className="gallery-message">
              {message}
            </p>
          )}

        </form>
      </div>
    </div>
  );
}