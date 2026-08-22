import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import "./DownloadAdmin.css";

export default function DownloadEntry() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const [form, setForm] = useState({ title: "", description: "", url: "" });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  useEffect(() => { if (editId) fetch(`${API_BASE_URL}/download_list.php`, { credentials: "include" }).then((r) => r.json()).then((d) => { const item = (d.data || []).find((entry) => String(entry.id) === String(editId)); if (item) setForm({ title: item.title || "", description: item.description || "", url: item.url || "" }); }); }, [editId]);
  const submit = async (event) => {
    event.preventDefault(); setMessage("");
    const body = new FormData(); Object.entries(form).forEach(([key, value]) => body.append(key, value)); if (file) body.append("file", file);
    try { const response = await fetch(`${API_BASE_URL}/${editId ? "download_update.php" : "download_add.php"}${editId ? `?id=${editId}` : ""}`, { method: "POST", credentials: "include", body }); const data = await response.json(); if (!data.success) throw new Error(data.message || "Download save failed."); navigate("/admin/downloads"); } catch (error) { setMessage(error.message); }
  };
  return <div className="download-admin"><div className="download-admin-header"><div><h1>{editId ? "Edit Download" : "Add Download"}</h1><p>{editId ? "Update downloadable resource" : "Create a downloadable resource"}</p></div><button className="secondary" onClick={() => navigate("/admin/downloads")}>Back</button></div>{message && <p className="download-error">{message}</p>}<form onSubmit={submit} className="download-form"><label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><label>External URL<input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></label><label>File<input type="file" onChange={(e) => setFile(e.target.files[0] || null)} /></label><button type="submit">Save Download</button></form></div>;
}
