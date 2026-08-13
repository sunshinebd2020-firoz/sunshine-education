import { useEffect, useState } from "react";
import "./Gallery.css";

export default function Gallery() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetch("http://localhost/sunshine-api/api/gallery_list.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setGallery(data.data);
        }
      })
      .catch((error) => {
        console.error("Gallery error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="gallery-page">

      <div className="gallery-header">
        <h1>Gallery</h1>
        <p>Moments from Sunshine Education</p>
      </div>

<div className="gallery-filter">
  <button
    type="button"
    className={selectedCategory === "All" ? "active" : ""}
    onClick={() => setSelectedCategory("All")}
  >
    All
  </button>

  <button
    type="button"
    className={selectedCategory === "Events" ? "active" : ""}
    onClick={() => setSelectedCategory("Events")}
  >
    Events
  </button>

  <button
    type="button"
    className={selectedCategory === "Seminar" ? "active" : ""}
    onClick={() => setSelectedCategory("Seminar")}
  >
    Seminar
  </button>

  <button
    type="button"
    className={selectedCategory === "Classroom" ? "active" : ""}
    onClick={() => setSelectedCategory("Classroom")}
  >
    Classroom
  </button>

  <button
    type="button"
    className={selectedCategory === "Students" ? "active" : ""}
    onClick={() => setSelectedCategory("Students")}
  >
    Students
  </button>

  <button
    type="button"
    className={selectedCategory === "Teachers" ? "active" : ""}
    onClick={() => setSelectedCategory("Teachers")}
  >
    Teachers
  </button>

  <button
    type="button"
    className={selectedCategory === "Others" ? "active" : ""}
    onClick={() => setSelectedCategory("Others")}
  >
    Others
  </button>
</div>

      {loading ? (
        <div className="gallery-loading">
          Loading...
        </div>
      ) : gallery.length === 0 ? (
        <div className="gallery-empty">
          No images available.
        </div>
      ) : (
        <div className="gallery-grid">

          {gallery
  .filter(
    (item) =>
      selectedCategory === "All" ||
      item.category === selectedCategory
  )
  .map((item) => (
            <div
              className="gallery-card"
              key={item.id}
              onClick={() => setSelectedImage(item)}
            >
              <img
                src={`http://localhost/sunshine-api/uploads/gallery/${item.image}`}
                alt={item.title || "Gallery"}
              />

              <div className="gallery-info">
                {item.title && <h3>{item.title}</h3>}

                {item.category && (
                  <span>{item.category}</span>
                )}
              </div>
            </div>
          ))}

        </div>
      )}

      {/* Image Preview */}

      {selectedImage && (
        <div
          className="gallery-modal"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="gallery-close"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>

          <img
            src={`http://localhost/sunshine-api/uploads/gallery/${selectedImage.image}`}
            alt={selectedImage.title || "Gallery"}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

    </div>
  );
}