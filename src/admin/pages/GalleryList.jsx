import { useEffect, useState } from "react";
import "./GalleryList.css";
import API_BASE_URL, { API_ORIGIN } from "../../config/api";

export default function GalleryList() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingItem, setEditingItem] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const fetchGallery = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/gallery_list.php`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (data.success) {
        setGallery(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGallery();
  }, []);

  /* =========================
     Delete
  ========================= */

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this image?"
    );

    if (!confirmDelete) return;

    const formData = new FormData();
    formData.append("id", id);

    try {
      const response = await fetch(
        `${API_BASE_URL}/gallery_delete.php`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setGallery((prev) =>
          prev.filter((item) => Number(item.id) !== Number(id))
        );
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Delete failed.");
    }
  };

  /* =========================
     Open Edit
  ========================= */

  const handleEdit = (item) => {
    setEditingItem(item);
    setTitle(item.title || "");
    setCategory(item.category || "");
    setImage(null);
    setPreview(
      `${API_ORIGIN}/uploads/gallery/${item.image}`
    );
  };

  /* =========================
     Image Change
  ========================= */

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* =========================
     Close Edit
  ========================= */

  const closeEdit = () => {
    setEditingItem(null);
    setTitle("");
    setCategory("");
    setImage(null);
    setPreview("");
  };

  /* =========================
     Update
  ========================= */

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingItem) return;

    const formData = new FormData();

    formData.append("id", editingItem.id);
    formData.append("title", title);
    formData.append("category", category);

    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/gallery_update.php`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        await fetchGallery();
        closeEdit();
        alert("Gallery updated successfully.");
      } else {
        alert(data.message || "Update failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Update failed.");
    }
  };

  return (
    <div className="gallery-list">

      {/* Header */}

      <div className="gallery-list-header">
        <div>
          <h1>Gallery List</h1>
          <p>Manage uploaded gallery images</p>
        </div>
      </div>


      {/* Gallery */}

      {loading ? (
        <p>Loading...</p>
      ) : gallery.length === 0 ? (
        <p>No gallery images found.</p>
      ) : (
        <div className="gallery-admin-grid">

          {gallery.map((item) => (
            <div
              className="gallery-admin-card"
              key={item.id}
            >

              <img
                src={`${API_ORIGIN}/uploads/gallery/${item.image}`}
                alt={item.title || "Gallery"}
              />

              <div className="gallery-admin-info">

                <h3>
                  {item.title || "Untitled"}
                </h3>

                <span>
                  {item.category || "No Category"}
                </span>

                <div className="gallery-action-buttons">

                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="gallery-edit-btn"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="gallery-delete-btn"
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>
          ))}

        </div>
      )}


      {/* =========================
          Edit Modal
      ========================= */}

      {editingItem && (
        <div
          className="gallery-edit-modal"
          onClick={closeEdit}
        >

          <div
            className="gallery-edit-box"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="gallery-edit-header">

              <h2>Edit Gallery</h2>

              <button
                type="button"
                onClick={closeEdit}
                className="gallery-modal-close"
              >
                ×
              </button>

            </div>


            <form onSubmit={handleUpdate}>

              {/* Title */}

              <div className="gallery-form-group">

                <label>Title</label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter image title"
                />

              </div>


              {/* Category */}

              <div className="gallery-form-group">

                <label>Category</label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >

                  <option value="">
                    Select Category
                  </option>

                  <option value="Events">
                    Events
                  </option>

                  <option value="Seminar">
                    Seminar
                  </option>

                  <option value="Classroom">
                    Classroom
                  </option>

                  <option value="Students">
                    Students
                  </option>

                  <option value="Teachers">
                    Teachers
                  </option>

                  <option value="Others">
                    Others
                  </option>

                </select>

              </div>


              {/* Image */}

              <div className="gallery-form-group">

                <label>Change Image</label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />

              </div>


              {/* Preview */}

              {preview && (
                <div className="gallery-edit-preview">

                  <img
                    src={preview}
                    alt="Preview"
                  />

                </div>
              )}


              {/* Buttons */}

              <div className="gallery-edit-actions">

                <button
                  type="button"
                  onClick={closeEdit}
                  className="gallery-cancel-btn"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="gallery-save-btn"
                >
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}