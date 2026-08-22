import { useEffect, useState } from "react";
import "./BannerList.css";
import API_BASE_URL, { API_ORIGIN } from "../../config/api";

const API = API_BASE_URL;
const IMAGE_URL = `${API_ORIGIN}/`;

export default function BannerList() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingBanner, setEditingBanner] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [editPreview, setEditPreview] = useState("");

  const [message, setMessage] = useState("");

  /* ===============================
     LOAD BANNERS
  =============================== */

  const fetchBanners = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API}/banner_list.php`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (data.success) {
        setBanners(data.data);
      } else {
        setMessage(data.message || "Banner load করা যায়নি");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server-এর সাথে যোগাযোগ করা যাচ্ছে না");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBanners();
  }, []);


  /* ===============================
     EDIT
  =============================== */

  const handleEdit = (banner) => {
    setEditingBanner({
      ...banner,
    });

    setEditImage(null);

    setEditPreview(
      `${IMAGE_URL}${banner.banner_image}`
    );

    setMessage("");
  };


  /* ===============================
     EDIT INPUT
  =============================== */

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditingBanner((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  /* ===============================
     IMAGE CHANGE
  =============================== */

  const handleEditImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setEditImage(file);

    setEditPreview(
      URL.createObjectURL(file)
    );
  };


  /* ===============================
     UPDATE BANNER
  =============================== */

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingBanner) return;

    const formData = new FormData();

    formData.append(
      "id",
      editingBanner.id
    );

    formData.append(
      "title",
      editingBanner.title || ""
    );

    formData.append(
      "subtitle",
      editingBanner.subtitle || ""
    );

    formData.append(
      "button_text",
      editingBanner.button_text || ""
    );

    formData.append(
      "button_link",
      editingBanner.button_link || ""
    );

    formData.append(
      "status",
      editingBanner.status
    );

    formData.append(
      "sort_order",
      editingBanner.sort_order
    );

    if (editImage) {
      formData.append(
        "banner_image",
        editImage
      );
    }

    try {
      const response = await fetch(
        `${API}/banner_update.php`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {

        setMessage(
          "Banner সফলভাবে update হয়েছে"
        );

        setEditingBanner(null);
        setEditImage(null);
        setEditPreview("");

        fetchBanners();

      } else {

        setMessage(
          data.message ||
          "Banner update করা যায়নি"
        );
      }

    } catch (error) {

      console.error(error);

      setMessage(
        "Server-এর সাথে যোগাযোগ করা যাচ্ছে না"
      );
    }
  };


  /* ===============================
     DELETE
  =============================== */

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "আপনি কি এই Banner-টি Delete করতে চান?"
    );

    if (!confirmDelete) return;

    try {

      const formData = new FormData();

      formData.append("id", id);

      const response = await fetch(
        `${API}/banner_delete.php`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {

        setMessage(
          "Banner সফলভাবে Delete হয়েছে"
        );

        fetchBanners();

      } else {

        setMessage(
          data.message ||
          "Banner Delete করা যায়নি"
        );
      }

    } catch (error) {

      console.error(error);

      setMessage(
        "Server-এর সাথে যোগাযোগ করা যাচ্ছে না"
      );
    }
  };


  /* ===============================
     LOADING
  =============================== */

  if (loading) {
    return (
      <div className="banner-list">
        <div className="banner-loading">
          Loading...
        </div>
      </div>
    );
  }


  return (
    <div className="banner-list">

      {/* ===============================
          HEADER
      =============================== */}

      <div className="banner-list-header">

        <div>
          <h1>Banner List</h1>

          <p>
            Website Home Page-এর সকল Banner
          </p>
        </div>

        <a href="/admin/banner-entry" className="admin-list-add-button">
          + Add Banner
        </a>

      </div>


      {/* ===============================
          MESSAGE
      =============================== */}

      {message && (
        <div className="banner-message">
          {message}
        </div>
      )}


      {/* ===============================
          LIST
      =============================== */}

      {banners.length === 0 ? (

        <div className="empty-banner">
          কোনো Banner পাওয়া যায়নি।
        </div>

      ) : (

        <div className="banner-table-wrapper">

          <table className="banner-table">

            <thead>

              <tr>
                <th>Preview</th>
                <th>Title</th>
                <th>Status</th>
                <th>Sort Order</th>
                <th>Action</th>
              </tr>

            </thead>


            <tbody>

              {banners.map((banner) => (

                <tr key={banner.id}>

                  {/* Preview */}

                  <td>

                    <img
                      src={`${IMAGE_URL}${banner.banner_image}`}
                      alt={banner.title || "Banner"}
                      className="banner-thumb"
                    />

                  </td>


                  {/* Title */}

                  <td>

                    <strong>
                      {banner.title ||
                        "No Title"}
                    </strong>

                    {banner.subtitle && (
                      <small>
                        {banner.subtitle}
                      </small>
                    )}

                  </td>


                  {/* Status */}

                  <td>

                    <span
                      className={
                        banner.status === "Active"
                          ? "status-active"
                          : "status-inactive"
                      }
                    >
                      {banner.status}
                    </span>

                  </td>


                  {/* Sort */}

                  <td>
                    {banner.sort_order}
                  </td>


                  {/* Actions */}

                  <td>

                    <div className="banner-actions">

                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() =>
                          handleEdit(banner)
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(
                            banner.id
                          )
                        }
                      >
                        🗑️ Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}


      {/* ===============================
          EDIT MODAL
      =============================== */}

      {editingBanner && (

        <div className="banner-modal-overlay">

          <div className="banner-modal">

            <div className="banner-modal-header">

              <h2>
                Edit Banner
              </h2>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setEditingBanner(null)
                }
              >
                ✕
              </button>

            </div>


            <form
              onSubmit={handleUpdate}
              className="banner-edit-form"
            >

              {/* Image */}

              <div className="edit-form-group">

                <label>
                  Banner Image
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleEditImage
                  }
                />

                {editPreview && (

                  <div className="edit-image-preview">

                    <img
                      src={editPreview}
                      alt="Banner Preview"
                    />

                  </div>

                )}

              </div>


              {/* Title */}

              <div className="edit-form-group">

                <label>
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={
                    editingBanner.title ||
                    ""
                  }
                  onChange={
                    handleEditChange
                  }
                />

              </div>


              {/* Subtitle */}

              <div className="edit-form-group">

                <label>
                  Subtitle
                </label>

                <textarea
                  name="subtitle"
                  rows="4"
                  value={
                    editingBanner.subtitle ||
                    ""
                  }
                  onChange={
                    handleEditChange
                  }
                />

              </div>


              {/* Button */}

              <div className="edit-form-row">

                <div className="edit-form-group">

                  <label>
                    Button Text
                  </label>

                  <input
                    type="text"
                    name="button_text"
                    value={
                      editingBanner.button_text ||
                      ""
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>


                <div className="edit-form-group">

                  <label>
                    Button Link
                  </label>

                  <input
                    type="text"
                    name="button_link"
                    value={
                      editingBanner.button_link ||
                      ""
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>

              </div>


              {/* Status + Sort */}

              <div className="edit-form-row">

                <div className="edit-form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      editingBanner.status
                    }
                    onChange={
                      handleEditChange
                    }
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                  </select>

                </div>


                <div className="edit-form-group">

                  <label>
                    Sort Order
                  </label>

                  <input
                    type="number"
                    name="sort_order"
                    min="0"
                    value={
                      editingBanner.sort_order
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>

              </div>


              {/* Buttons */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setEditingBanner(null)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="update-btn"
                >
                  Update Banner
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}