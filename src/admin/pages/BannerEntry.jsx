import { useState } from "react";
import "./BannerEntry.css";
import API_BASE_URL from "../../config/api";

export default function BannerEntry() {
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    button_text: "",
    button_link: "",
    status: "Active",
    sort_order: 0,
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

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
      setMessage("Banner image নির্বাচন করুন");
      return;
    }

    const formData = new FormData();

    formData.append("banner_image", image);
    formData.append("title", form.title);
    formData.append("subtitle", form.subtitle);
    formData.append("button_text", form.button_text);
    formData.append("button_link", form.button_link);
    formData.append("status", form.status);
    formData.append("sort_order", form.sort_order);

    try {
      const response = await fetch(
        `${API_BASE_URL}/banner_entry.php`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Banner সফলভাবে সংরক্ষণ হয়েছে");

        setForm({
          title: "",
          subtitle: "",
          button_text: "",
          button_link: "",
          status: "Active",
          sort_order: 0,
        });

        setImage(null);
        setPreview("");

        document.getElementById("banner-image").value = "";
      } else {
        setMessage(data.message || "Banner সংরক্ষণ করা যায়নি");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server-এর সাথে যোগাযোগ করা যাচ্ছে না");
    }
  };

  return (
    <div className="banner-entry">

      <div className="banner-entry-header">
        <h1>Add Banner</h1>
        <p>Website Home Page-এর জন্য নতুন Banner যোগ করুন</p>
      </div>

      <form onSubmit={handleSubmit} className="banner-form">

        <div className="form-group">
          <label>Banner Image *</label>

          <input
            id="banner-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
          />

          {preview && (
            <div className="banner-preview">
              <img src={preview} alt="Banner Preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Title</label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Banner Title"
          />
        </div>

        <div className="form-group">
          <label>Subtitle</label>

          <textarea
            name="subtitle"
            value={form.subtitle}
            onChange={handleChange}
            placeholder="Banner Subtitle"
            rows="4"
          />
        </div>

        <div className="form-row">

          <div className="form-group">
            <label>Button Text</label>

            <input
              type="text"
              name="button_text"
              value={form.button_text}
              onChange={handleChange}
              placeholder="ভর্তি সম্পর্কে জানুন"
            />
          </div>

          <div className="form-group">
            <label>Button Link</label>

            <input
              type="text"
              name="button_link"
              value={form.button_link}
              onChange={handleChange}
              placeholder="/admission"
            />
          </div>

        </div>

        <div className="form-row">

          <div className="form-group">
            <label>Status</label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="form-group">
            <label>Sort Order</label>

            <input
              type="number"
              name="sort_order"
              value={form.sort_order}
              onChange={handleChange}
              min="0"
            />
          </div>

        </div>

        {message && (
          <div className="banner-message">
            {message}
          </div>
        )}

        <button type="submit" className="banner-submit">
          Save Banner
        </button>

      </form>
    </div>
  );
}