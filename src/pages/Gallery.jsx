import "./Gallery.css";

export default function Gallery() {
  const images = [
    "/images/gallery1.jpg",
    "/images/gallery2.jpg",
    "/images/gallery3.jpg",
    "/images/gallery4.jpg",
    "/images/gallery5.jpg",
    "/images/gallery6.jpg",
  ];

  return (
    <div className="gallery">

      <section className="gallery-header">
        <h1>Gallery</h1>
        <p>
          আমাদের প্রতিষ্ঠানের বিভিন্ন কার্যক্রম ও মুহূর্তের ছবি।
        </p>
      </section>


      <section className="gallery-grid">

        {images.map((image, index) => (
          <div className="gallery-card" key={index}>
            <img 
              src={image} 
              alt={`Gallery ${index + 1}`} 
            />
          </div>
        ))}

      </section>

    </div>
  );
}