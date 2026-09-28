import { useEffect, useState } from "react";
import API_BASE_URL from "../../config/api";
import "./LanguageManagement.css";

const requestJson = async (response) => {
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Language request failed.");
  }

  return data;
};

const fetchLanguageList = async () => {
  const response = await fetch(`${API_BASE_URL}/language_list.php`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const data = await requestJson(response);
  return Array.isArray(data.data) ? data.data : [];
};

export default function LanguageManagement() {
  const [languages, setLanguages] = useState([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [editingLanguage, setEditingLanguage] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [notice, setNotice] = useState(null);

  const loadLanguages = async () => {
    try {
      const rows = await fetchLanguageList();
      setLanguages(rows);
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Languages could not be loaded." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchLanguageList()
      .then((rows) => {
        if (active) setLanguages(rows);
      })
      .catch((error) => {
        if (active) {
          setNotice({ type: "error", text: error.message || "Languages could not be loaded." });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const openAddForm = () => {
    setEditingLanguage(null);
    setName("");
    setNotice(null);
    setFormOpen(true);
  };

  const openEditForm = (language) => {
    setEditingLanguage(language);
    setName(language.name || "");
    setNotice(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditingLanguage(null);
    setName("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setNotice({ type: "error", text: "Enter a language name." });
      return;
    }

    try {
      setSaving(true);
      setNotice(null);
      const isEditing = Boolean(editingLanguage);
      const response = await fetch(
        `${API_BASE_URL}/${isEditing ? "language_update.php" : "language_add.php"}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...(isEditing ? { id: editingLanguage.id } : {}),
            name: trimmedName,
          }),
        }
      );
      const data = await requestJson(response);
      setFormOpen(false);
      setEditingLanguage(null);
      setName("");
      await loadLanguages();
      setNotice({ type: "success", text: data.message || "Language saved successfully." });
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Language could not be saved." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (language) => {
    if (!window.confirm(`Delete ${language.name}? Languages used by courses or students cannot be deleted.`)) {
      return;
    }

    try {
      setDeletingId(language.id);
      setNotice(null);
      const response = await fetch(`${API_BASE_URL}/language_delete.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: language.id }),
      });
      const data = await requestJson(response);
      await loadLanguages();
      setNotice({ type: "success", text: data.message || "Language deleted successfully." });
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Language could not be deleted." });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredLanguages = languages.filter((language) =>
    String(language.name || "").toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <main className="language-admin-page">
      <header className="language-page-header">
        <div>
          <h1>Languages</h1>
          <p>Manage the languages used by courses and student records.</p>
        </div>
        <button type="button" className="language-add-button" onClick={openAddForm}>
          + Add Language
        </button>
      </header>

      {notice && (
        <div className={`language-notice ${notice.type}`} role="status">
          {notice.text}
        </div>
      )}

      {formOpen && (
        <form className="language-form" onSubmit={handleSubmit}>
          <div className="language-form-heading">
            <div>
              <h2>{editingLanguage ? "Edit language" : "Add language"}</h2>
              <p>{editingLanguage ? "Renaming also updates linked course and student records." : "Add a language to the existing language list."}</p>
            </div>
          </div>
          <label htmlFor="language-name">Language name</label>
          <input
            id="language-name"
            name="name"
            autoFocus
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter language name"
            required
          />
          <div className="language-form-actions">
            <button type="button" className="language-cancel-button" onClick={closeForm} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="language-save-button" disabled={saving || !name.trim()}>
              {saving ? "Saving..." : editingLanguage ? "Save changes" : "Add language"}
            </button>
          </div>
        </form>
      )}

      <section className="language-list-section" aria-label="Language list">
        <div className="language-list-toolbar">
          <div>
            <h2>Language list</h2>
            <span>{filteredLanguages.length} of {languages.length}</span>
          </div>
          <input
            type="search"
            aria-label="Search languages"
            placeholder="Search languages..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <div className="language-list-state">Loading languages...</div>
        ) : filteredLanguages.length === 0 ? (
          <div className="language-list-state">
            {search ? "No matching languages." : "No languages have been added yet."}
          </div>
        ) : (
          <div className="language-table-wrap">
            <table className="language-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Language</th>
                  <th scope="col">Status</th>
                  <th scope="col">Added</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLanguages.map((language, index) => {
                  const isActive = ["1", "active", "enabled", "true"].includes(
                    String(language.status ?? "1").trim().toLowerCase()
                  );

                  return (
                    <tr key={language.id}>
                      <td>{index + 1}</td>
                      <td className="language-name-cell">{language.name}</td>
                      <td>
                        <span className={`language-status ${isActive ? "active" : "inactive"}`}>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{language.created_at ? new Date(language.created_at).toLocaleDateString() : "—"}</td>
                      <td>
                        <div className="language-row-actions">
                          <button type="button" className="language-edit-button" onClick={() => openEditForm(language)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="language-delete-button"
                            onClick={() => handleDelete(language)}
                            disabled={deletingId === language.id}
                          >
                            {deletingId === language.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}