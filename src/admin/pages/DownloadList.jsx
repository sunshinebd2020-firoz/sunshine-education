import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import "./DownloadAdmin.css";

export default function DownloadList() {
  const navigate = useNavigate(); const [items, setItems] = useState([]); const [message, setMessage] = useState("");
  const load = () => fetch(`${API_BASE_URL}/download_list.php`, { credentials: "include" }).then((r) => r.json()).then((d) => { if (d.success) setItems(d.data || []); else setMessage(d.message || "Could not load downloads."); }).catch(() => setMessage("Could not load downloads."));
  useEffect(() => { load(); }, []);
  const remove = async (id) => { if (!window.confirm("Delete this download?")) return; const r = await fetch(`${API_BASE_URL}/download_delete.php`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); const d = await r.json(); if (d.success) setItems(items.filter((item) => item.id !== id)); else setMessage(d.message || "Delete failed."); };
  return <div className="download-admin"><div className="download-admin-header"><div><h1>Download List</h1><p>Manage downloadable resources</p></div><button onClick={() => navigate("/admin/download-entry")}>+ Add Download</button></div>{message && <p className="download-error">{message}</p>}<div className="download-table"><table><thead><tr><th>Title</th><th>Description</th><th>Source</th><th>Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.title}</td><td>{item.description || "N/A"}</td><td>{item.file_name || item.url || "N/A"}</td><td><a href={item.file_url || item.url} target="_blank" rel="noreferrer">View</a><button onClick={() => navigate(`/admin/download-entry?id=${item.id}`)}>Edit</button><button className="small-danger" onClick={() => remove(item.id)}>Delete</button></td></tr>)}</tbody></table>{!items.length && <p className="empty-download">No downloads found.</p>}</div></div>;
}
