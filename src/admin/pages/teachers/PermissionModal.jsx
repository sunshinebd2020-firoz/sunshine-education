import { useEffect, useState } from "react";
import "./PermissionModal.css";
import API_BASE_URL from "../../../config/api";


const PERMISSIONS = [

  {
    key: "teacher",
    label: "Teacher",
  },

  {
    key: "student",
    label: "Student",
  },

  {
    key: "course",
    label: "Course",
  },

  {
    key: "branch",
    label: "Branch",
  },

  {
    key: "income",
    label: "Income",
  },

  {
    key: "expense",
    label: "Expense",
  },

  {
    key: "report",
    label: "Reports",
  },

  {
    key: "notice",
    label: "Notice",
  },

  {
    key: "gallery",
    label: "Gallery",
  },

  {
    key: "banner",
    label: "Banner",
  },

  {
    key: "download",
    label: "Download",
  },

  {
    key: "setting",
    label: "Settings",
  },

];


const createDefaultPermission =
  () => ({

    can_view: false,

    can_add: false,

    can_edit: false,

    can_delete: false,

  });


export default function PermissionModal({
  teacher,
  onClose,
  onSaved,
}) {

  const [permissions, setPermissions] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("error");


  /*
  =====================================================
  CURRENT USER
  =====================================================
  */

  const getCurrentUser = () => {

    try {

      const saved =
        localStorage.getItem(
          "sunshine_user"
        );


      if (saved) {

        const user =
          JSON.parse(saved);

        if (
          user &&
          (
            user.id ||
            user.admin_id ||
            user.user_id
          )
        ) {

          return user;
        }
      }

    } catch {
      // Ignore
    }


    return null;
  };


  /*
  =====================================================
  CURRENT ADMIN ID
  =====================================================
  */

  const getCurrentAdminId = () => {

    const user =
      getCurrentUser();


    if (!user) return "";


    return String(
      user.id ||
      user.admin_id ||
      user.user_id ||
      ""
    ).trim();
  };


  /*
  =====================================================
  TARGET ADMIN ID
  =====================================================
  */

  const getTargetAdminId = () => {

    const id =
      teacher?.admin_id ??
      teacher?.user_id ??
      null;


    if (
      id === null ||
      id === undefined ||
      id === ""
    ) {

      return "";
    }


    return String(
      id
    ).trim();
  };


  /*
  =====================================================
  SELF CHECK
  =====================================================
  */

  const isSelfPermissionChange =
    () => {

      const currentId =
        getCurrentAdminId();

      const targetId =
        getTargetAdminId();


      return (

        currentId !== "" &&

        targetId !== "" &&

        currentId === targetId

      );
    };


  /*
  =====================================================
  EMPTY PERMISSIONS
  =====================================================
  */

  const createEmptyPermissions =
    () => {

      const result = {};


      PERMISSIONS.forEach(
        item => {

          result[item.key] =
            createDefaultPermission();

        }
      );


      return result;
    };


  /*
  =====================================================
  LOAD
  =====================================================
  */

  const loadPermissions =
    async () => {

      const targetId =
        getTargetAdminId();


      if (!targetId) {

        setPermissions(
          createEmptyPermissions()
        );

        setMessage(
          "Admin ID পাওয়া যায়নি।"
        );

        setMessageType(
          "error"
        );

        setLoading(false);

        return;
      }


      if (
        isSelfPermissionChange()
      ) {

        setPermissions(
          createEmptyPermissions()
        );

        setMessage(
          "আপনি নিজের permission পরিবর্তন করতে পারবেন না।"
        );

        setMessageType(
          "error"
        );

        setLoading(false);

        return;
      }


      try {

        setLoading(true);

        setMessage("");


        const response =
          await fetch(
            `${API_BASE_URL}/permission_get.php?admin_id=${encodeURIComponent(
              targetId
            )}`,
            {
              method: "GET",

              credentials: "include",

              headers: {
                Accept:
                  "application/json"
              }
            }
          );


        const text =
          await response.text();


        if (!text.trim()) {

          throw new Error(
            "Server থেকে empty response পাওয়া গেছে।"
          );
        }


        const data =
          JSON.parse(text);


        if (
          !response.ok ||
          !data.success
        ) {

          throw new Error(
            data.message ||
            "Permission load করা যাচ্ছে না।"
          );
        }


        const permissionData =
          createEmptyPermissions();


        if (
          Array.isArray(
            data.permissions
          )
        ) {

          data.permissions.forEach(
            item => {

              const key =
                String(
                  item.permission ||
                  ""
                )
                  .trim()
                  .toLowerCase();


              if (
                permissionData[key]
              ) {

                permissionData[key] = {

                  can_view:
                    Number(
                      item.can_view
                    ) === 1,

                  can_add:
                    Number(
                      item.can_add
                    ) === 1,

                  can_edit:
                    Number(
                      item.can_edit
                    ) === 1,

                  can_delete:
                    Number(
                      item.can_delete
                    ) === 1,

                };
              }

            }
          );
        }


        setPermissions(
          permissionData
        );


      } catch (error) {

        console.error(
          "Permission Load Error:",
          error
        );


        setPermissions(
          createEmptyPermissions()
        );


        setMessage(
          error.message ||
          "Permission load করা যাচ্ছে না।"
        );

        setMessageType(
          "error"
        );


      } finally {

        setLoading(false);
      }
    };


  useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPermissions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher]);


  /*
  =====================================================
  CHANGE
  =====================================================
  */

  const handlePermissionChange =
    (
      permission,
      action
    ) => {

      if (
        saving ||
        isSelfPermissionChange()
      ) {
        return;
      }


      setPermissions(
        prev => ({

          ...prev,

          [permission]: {

            ...(prev[permission] ||
              createDefaultPermission()),

            [action]:
              !prev[permission]?.[
                action
              ],

          },

        })
      );
    };


  /*
  =====================================================
  ROW ALL
  =====================================================
  */

  const isRowAllSelected =
    permission => {

      const current =
        permissions[
          permission
        ];


      if (!current) {
        return false;
      }


      return (

        current.can_view &&
        current.can_add &&
        current.can_edit &&
        current.can_delete

      );
    };


  const handleSelectAll =
    permission => {

      if (
        saving ||
        isSelfPermissionChange()
      ) {
        return;
      }


      const allSelected =
        isRowAllSelected(
          permission
        );


      setPermissions(
        prev => ({

          ...prev,

          [permission]: {

            can_view:
              !allSelected,

            can_add:
              !allSelected,

            can_edit:
              !allSelected,

            can_delete:
              !allSelected,

          },

        })
      );
    };


  /*
  =====================================================
  GLOBAL ALL
  =====================================================
  */

  const isAllSelected =
    () => {

      return PERMISSIONS.every(
        item =>
          isRowAllSelected(
            item.key
          )
      );
    };


  const handleSelectAllPermissions =
    () => {

      if (
        saving ||
        isSelfPermissionChange()
      ) {
        return;
      }


      const newValue =
        !isAllSelected();


      const newPermissions =
        {};


      PERMISSIONS.forEach(
        item => {

          newPermissions[
            item.key
          ] = {

            can_view:
              newValue,

            can_add:
              newValue,

            can_edit:
              newValue,

            can_delete:
              newValue,

          };

        }
      );


      setPermissions(
        newPermissions
      );
    };


  /*
  =====================================================
  SAVE
  =====================================================
  */

  const handleSave =
    async () => {

      const targetId =
        getTargetAdminId();


      if (!targetId) {

        setMessage(
          "Target Admin ID পাওয়া যায়নি।"
        );

        setMessageType(
          "error"
        );

        return;
      }


      if (
        isSelfPermissionChange()
      ) {

        setMessage(
          "আপনি নিজের permission পরিবর্তন করতে পারবেন না।"
        );

        setMessageType(
          "error"
        );

        return;
      }


      try {

        setSaving(true);

        setMessage("");


        const permissionList =
          PERMISSIONS.map(
            item => {

              const current =
                permissions[
                  item.key
                ] ||
                createDefaultPermission();


              return {

                permission:
                  item.key,

                can_view:
                  current.can_view
                    ? 1
                    : 0,

                can_add:
                  current.can_add
                    ? 1
                    : 0,

                can_edit:
                  current.can_edit
                    ? 1
                    : 0,

                can_delete:
                  current.can_delete
                    ? 1
                    : 0,

              };
            }
          );


        const response =
          await fetch(
            `${API_BASE_URL}/permission_save.php`,
            {
              method: "POST",

              credentials: "include",

              headers: {

                "Content-Type":
                  "application/json",

                Accept:
                  "application/json"

              },

              body:
                JSON.stringify({

                  admin_id:
                    Number(
                      targetId
                    ),

                  permissions:
                    permissionList

                })
            }
          );


        const text =
          await response.text();


        if (!text.trim()) {

          throw new Error(
            "Server থেকে empty response পাওয়া গেছে।"
          );
        }


        const data =
          JSON.parse(text);


        if (
          !response.ok ||
          !data.success
        ) {

          throw new Error(
            data.message ||
            "Permission save করা যায়নি।"
          );
        }


        setMessage(
          "Permissions successfully saved."
        );

        setMessageType(
          "success"
        );


        if (onSaved) {
          onSaved();
        }


        setTimeout(
          () => {

            onClose();

          },
          700
        );


      } catch (error) {

        console.error(
          "Permission Save Error:",
          error
        );


        setMessage(
          error.message ||
          "Server-এর সাথে যোগাযোগ করা যাচ্ছে না।"
        );

        setMessageType(
          "error"
        );


      } finally {

        setSaving(false);
      }
    };


  /*
  =====================================================
  RENDER
  =====================================================
  */

  return (

    <div
      className="permission-modal-overlay"

      onClick={() => {

        if (!saving) {
          onClose();
        }

      }}
    >

      <div
        className="permission-modal"

        onClick={e =>
          e.stopPropagation()
        }
      >

        <div className="permission-modal-header">

          <div>

            <h2>
              Manage Permissions
            </h2>

            <p>

              {
                teacher?.full_name ||
                teacher?.name_en ||
                teacher?.name_bn ||
                teacher?.username ||
                "User"
              }

            </p>

            <span>

              Admin ID:{" "}
              {
                getTargetAdminId() ||
                "Not Found"
              }

            </span>

          </div>


          <button
            type="button"

            className="permission-close"

            onClick={onClose}

            disabled={saving}
          >

            ×

          </button>

        </div>


        <div className="permission-modal-body">

          {loading ? (

            <div className="permission-loading">

              Loading permissions...

            </div>

          ) : (

            <>

              <div className="permission-toolbar">

                <button
                  type="button"

                  className="permission-select-all"

                  onClick={
                    handleSelectAllPermissions
                  }

                  disabled={
                    saving ||
                    isSelfPermissionChange()
                  }
                >

                  {
                    isAllSelected()
                      ? "Unselect All"
                      : "Select All"
                  }

                </button>

              </div>


              <div className="permission-table-wrapper">

                <table className="permission-table">

                  <thead>

                    <tr>

                      <th>
                        Module
                      </th>

                      <th>
                        View
                      </th>

                      <th>
                        Add
                      </th>

                      <th>
                        Edit
                      </th>

                      <th>
                        Delete
                      </th>

                      <th>
                        All
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {PERMISSIONS.map(
                      item => {

                        const current =
                          permissions[
                            item.key
                          ] ||
                          createDefaultPermission();


                        const allSelected =
                          isRowAllSelected(
                            item.key
                          );


                        return (

                          <tr
                            key={
                              item.key
                            }
                          >

                            <td className="permission-module">

                              {
                                item.label
                              }

                            </td>


                            {[
                              "can_view",
                              "can_add",
                              "can_edit",
                              "can_delete"
                            ].map(
                              action => (

                                <td
                                  key={
                                    action
                                  }
                                >

                                  <label className="permission-checkbox">

                                    <input
                                      type="checkbox"

                                      checked={
                                        current[
                                          action
                                        ] === true
                                      }

                                      onChange={() =>
                                        handlePermissionChange(
                                          item.key,
                                          action
                                        )
                                      }

                                      disabled={
                                        saving ||
                                        isSelfPermissionChange()
                                      }
                                    />

                                    <span />

                                  </label>

                                </td>

                              )
                            )}


                            <td>

                              <label className="permission-checkbox">

                                <input
                                  type="checkbox"

                                  checked={
                                    allSelected
                                  }

                                  onChange={() =>
                                    handleSelectAll(
                                      item.key
                                    )
                                  }

                                  disabled={
                                    saving ||
                                    isSelfPermissionChange()
                                  }
                                />

                                <span />

                              </label>

                            </td>

                          </tr>

                        );

                      }
                    )}

                  </tbody>

                </table>

              </div>

            </>

          )}


          {message && (

            <div
              className={`permission-message ${messageType}`}
            >

              {message}

            </div>

          )}

        </div>


        <div className="permission-modal-footer">

          <button
            type="button"

            className="permission-cancel-btn"

            onClick={onClose}

            disabled={saving}
          >

            Cancel

          </button>


          <button
            type="button"

            className="permission-save-btn"

            onClick={handleSave}

            disabled={
              loading ||
              saving ||
              !getTargetAdminId() ||
              isSelfPermissionChange()
            }
          >

            {saving
              ? "Saving..."
              : "Save Permissions"}

          </button>

        </div>

      </div>

    </div>
  );
}