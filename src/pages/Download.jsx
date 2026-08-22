import { useEffect, useState } from "react";
import API_BASE_URL, { API_ORIGIN } from "../config/api";
import "./Download.css";

export default function Download() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/download_public.php`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) setDownloads(data.data || []);
      })
      .catch((error) => console.error("Download fetch error:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="download">

      <section className="download-header">
        <h1>ডাউনলোড</h1>
        <p>
          প্রয়োজনীয় ফরম, নোটিশ ও শিক্ষামূলক উপকরণ এখান থেকে ডাউনলোড করুন।
        </p>
      </section>


      <section className="download-list">
        {loading ? (
          <p>লোড হচ্ছে...</p>
        ) : downloads.length ? (
          downloads.map((download) => {
            const target = download.file_url;
            const href = target?.startsWith("/")
              ? `${API_ORIGIN}${target}`
              : target;

            return (
              <div className="download-card" key={download.id}>
                <h2>{download.title}</h2>
                <p>{download.description || "Download resource"}</p>
                {href && (
                  <a href={href} rel="noreferrer" download>
                    Download
                  </a>
                )}
              </div>
            );
          })
        ) : (
          <p>কোনো download পাওয়া যায়নি।</p>
        )}
      </section>

    </div>
  );
}