import "./BranchList.css";
import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BranchList() {
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  /* =====================================================
     LOAD BRANCHES
  ===================================================== */

  const loadBranches = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/branch_list.php`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (data.success) {
        setBranches(
          Array.isArray(data.branches)
            ? data.branches
            : []
        );

        setMessage("");
      } else {
        setBranches([]);

        setMessage(
          data.message ||
            "Branch data পাওয়া যায়নি"
        );
      }
    } catch (error) {
      console.error(
        "Branch loading error:",
        error
      );

      setMessage(
        "Server connection failed"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBranches();
  }, []);


  /* =====================================================
     ACTIVE / INACTIVE
  ===================================================== */

  const handleStatus = async (id, status) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/branch_status.php`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            id,
            status,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(
          data.message ||
            "Status updated successfully"
        );

        loadBranches();
      } else {
        setMessage(
          data.message ||
            "Status update failed"
        );
      }
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      setMessage(
        "Server connection failed"
      );
    }
  };


  /* =====================================================
     DELETE BRANCH
  ===================================================== */

  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "আপনি কি এই Branch-টি Delete করতে চান?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/branch_delete.php`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            id,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(
          data.message ||
            "Branch deleted successfully"
        );

        loadBranches();
      } else {
        setMessage(
          data.message ||
            "Branch delete failed"
        );
      }
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      setMessage(
        "Server connection failed"
      );
    }
  };


  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredBranches =
    branches.filter((branch) => {
      const searchText =
        search.trim().toLowerCase();

      if (!searchText) {
        return true;
      }

      return (
        String(
          branch.title || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          branch.branch_name || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          branch.branch_name_bn || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          branch.address || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          branch.mobile || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          branch.email || ""
        )
          .toLowerCase()
          .includes(searchText)
      );
    });


  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="branch-list-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="branch-list-header">

        <div>

          <h1>
            Branch List
          </h1>

          <p>
            নিবন্ধিত শাখাসমূহের তালিকা
          </p>

        </div>


        <button
          type="button"
          className="admin-list-add-button"
          onClick={() => navigate("/admin/branch-entry")}
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

        ) : (

          <>

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
                          {branch.title ||
                            "-"}

                        </strong>

                      </td>


                      {/* BRANCH NAME */}

                      <td>

                        <div className="branch-name">

                          <strong>
                            {branch.branch_name ||
                              "-"}
                          </strong>

                          {branch.branch_name_bn && (
                            <span>
                              {
                                branch.branch_name_bn
                              }
                            </span>
                          )}

                        </div>

                      </td>


                      {/* ADDRESS */}

                      <td>

                        <span className="branch-address">

                          {branch.address ||
                            "-"}

                        </span>

                      </td>


                      {/* MOBILE */}

                      <td>

                        {branch.mobile ||
                          "-"}

                      </td>


                      {/* EMAIL */}

                      <td>

                        {branch.email ||
                          "-"}

                      </td>


                      {/* STATUS */}

                      <td>

                        {String(
                          branch.status
                        ).toLowerCase() ===
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

                          {String(
                            branch.status
                          ).toLowerCase() ===
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


            {/* =================================================
                NO BRANCH
            ================================================= */}

            {filteredBranches.length === 0 && (

              <p className="no-branch">
                কোনো Branch পাওয়া যায়নি।
              </p>

            )}

          </>

        )}

      </div>

    </div>
  );
}