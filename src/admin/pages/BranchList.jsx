import "./BranchList.css";
import API_BASE_URL from "../../config/api";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BranchList() {
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | LOAD BRANCHES
  |--------------------------------------------------------------------------
  */

  const loadBranches = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const url = `${API_BASE_URL}/branch_list.php`;

      console.log("Branch API URL:", url);

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const responseText = await response.text();

      console.log("Branch API Response:", responseText);

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Invalid JSON response:", responseText);

        throw new Error(
          "Server থেকে valid JSON response পাওয়া যায়নি।"
        );
      }

      console.log("Branch API Data:", data);
      console.log("Branch Array:", data.branch);

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Server error: ${response.status}`
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Branch data could not be loaded."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | API RESPONSE
      |
      | {
      |   success: true,
      |   branch: [...]
      | }
      |--------------------------------------------------------------------------
      */

      if (Array.isArray(data.branch)) {
        setBranches(data.branch);
      } else {
        setBranches([]);

        console.warn(
          "API returned branch data in unexpected format:",
          data
        );
      }

    } catch (error) {
      console.error("Branch loading error:", error);

      setBranches([]);

      setMessage(
        error.message ||
          "Branch data load failed."
      );

    } finally {
      setLoading(false);
    }
  }, []);


  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);


  /*
  |--------------------------------------------------------------------------
  | STATUS UPDATE
  |--------------------------------------------------------------------------
  */

  const handleStatus = async (id, status) => {
    try {
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/branch_status.php`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            id,
            status,
          }),
        }
      );

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error(
          "Invalid status response:",
          responseText
        );

        throw new Error(
          "Server থেকে valid JSON response পাওয়া যায়নি।"
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Status update failed."
        );
      }

      setMessage(
        data.message ||
          "Status updated successfully."
      );

      await loadBranches();

    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      setMessage(
        error.message ||
          "Server connection failed."
      );
    }
  };


  /*
  |--------------------------------------------------------------------------
  | DELETE BRANCH
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "আপনি কি এই Branch-টি Delete করতে চান?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/branch_delete.php`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            id,
          }),
        }
      );

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error(
          "Invalid delete response:",
          responseText
        );

        throw new Error(
          "Server থেকে valid JSON response পাওয়া যায়নি।"
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Branch delete failed."
        );
      }

      setMessage(
        data.message ||
          "Branch deleted successfully."
      );

      await loadBranches();

    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      setMessage(
        error.message ||
          "Server connection failed."
      );
    }
  };


  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const searchText = search.trim().toLowerCase();

  const filteredBranches = branches.filter(
    (branch) => {
      if (!searchText) {
        return true;
      }

      return (
        String(branch.title || "")
          .toLowerCase()
          .includes(searchText) ||

        String(branch.branch_name || "")
          .toLowerCase()
          .includes(searchText) ||

        String(branch.branch_name_bn || "")
          .toLowerCase()
          .includes(searchText) ||

        String(branch.address || "")
          .toLowerCase()
          .includes(searchText) ||

        String(branch.mobile || "")
          .toLowerCase()
          .includes(searchText) ||

        String(branch.email || "")
          .toLowerCase()
          .includes(searchText)
      );
    }
  );


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="branch-list-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="branch-list-header">

        <div>
          <h1>Branch List</h1>

          <p>
            নিবন্ধিত শাখাসমূহের তালিকা
          </p>
        </div>


        <button
          type="button"
          className="admin-list-add-button"
          onClick={() =>
            navigate("/admin/branch-entry")
          }
        >
          + Add Branch
        </button>


        <div className="branch-count">
          Total: {filteredBranches.length}
        </div>

      </div>


      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="branch-search">

        <input
          type="text"
          placeholder="Search by title, branch, address, mobile or email..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <p className="branch-message">
          {message}
        </p>
      )}


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="branch-table-container">

        {loading ? (

          <p className="no-branch">
            Loading branches...
          </p>

        ) : filteredBranches.length === 0 ? (

          <p className="no-branch">
            কোনো Branch পাওয়া যায়নি।
          </p>

        ) : (

          <table>

            <thead>

              <tr>

                <th>
                  Title
                </th>

                <th>
                  Branch Name
                </th>

                <th>
                  Address
                </th>

                <th>
                  Mobile
                </th>

                <th>
                  Email
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredBranches.map(
                (branch) => (

                  <tr
                    key={branch.id}
                  >

                    {/* TITLE */}

                    <td>

                      <strong className="branch-title">
                        {branch.title || "-"}
                      </strong>

                    </td>


                    {/* BRANCH NAME */}

                    <td>

                      <div className="branch-name">

                        <strong>
                          {branch.branch_name || "-"}
                        </strong>

                        {branch.branch_name_bn && (
                          <span>
                            {branch.branch_name_bn}
                          </span>
                        )}

                      </div>

                    </td>


                    {/* ADDRESS */}

                    <td>

                      <span className="branch-address">
                        {branch.address || "-"}
                      </span>

                    </td>


                    {/* MOBILE */}

                    <td>
                      {branch.mobile || "-"}
                    </td>


                    {/* EMAIL */}

                    <td>
                      {branch.email || "-"}
                    </td>


                    {/* STATUS */}

                    <td>

                      {String(branch.status)
                        .toLowerCase() ===
                      "active" ? (

                        <span className="branch-status-active">
                          Active
                        </span>

                      ) : (

                        <span className="branch-status-inactive">
                          Inactive
                        </span>

                      )}

                    </td>


                    {/* ACTION */}

                    <td>

                      <div className="branch-actions">

                        {/* EDIT */}

                        <button
                          type="button"
                          className="branch-edit-button"
                          title="Edit Branch"
                          onClick={() =>
                            navigate(
                              `/admin/branch-edit/${branch.id}`
                            )
                          }
                        >
                          ✏️
                        </button>


                        {/* ACTIVE / INACTIVE */}

                        {String(branch.status)
                          .toLowerCase() ===
                        "active" ? (

                          <button
                            type="button"
                            className="branch-inactive-button"
                            title="Make Inactive"
                            onClick={() =>
                              handleStatus(
                                branch.id,
                                "inactive"
                              )
                            }
                          >
                            🔴
                          </button>

                        ) : (

                          <button
                            type="button"
                            className="branch-active-button"
                            title="Make Active"
                            onClick={() =>
                              handleStatus(
                                branch.id,
                                "active"
                              )
                            }
                          >
                            🟢
                          </button>

                        )}


                        {/* DELETE */}

                        <button
                          type="button"
                          className="branch-delete-button"
                          title="Delete Branch"
                          onClick={() =>
                            handleDelete(
                              branch.id
                            )
                          }
                        >
                          🗑️
                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}