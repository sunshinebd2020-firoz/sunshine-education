import "./Branch.css";

export default function Branch() {
  const branches = [
    {
      id: 1,
      name: "Rajshahi Main Branch",
      nameBn: "রাজশাহী প্রধান শাখা",
      address: "Rajshahi, Bangladesh",
      mobile: "01XXXXXXXXX",
      email: "rajshahi@sunshineeducation.com",
    },
    {
      id: 2,
      name: "Ramchandrapur Branch",
      nameBn: "রামচন্দ্রপুর শাখা",
      address: "Ramchandrapur, Rajshahi, Bangladesh",
      mobile: "01XXXXXXXXX",
      email: "ramchandrapur@sunshineeducation.com",
    },
    {
      id: 3,
      name: "Khulna Branch",
      nameBn: "খুলনা শাখা",
      address: "Khulna, Bangladesh",
      mobile: "01XXXXXXXXX",
      email: "khulna@sunshineeducation.com",
    },
    {
      id: 4,
      name: "Tangail Branch",
      nameBn: "টাঙ্গাইল শাখা",
      address: "Tangail, Bangladesh",
      mobile: "01XXXXXXXXX",
      email: "tangail@sunshineeducation.com",
    },
  ];

  return (
    <div className="branch-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="branch-header">

        <h1>
          আমাদের শাখাসমূহ
        </h1>

        <p>
          আপনার নিকটস্থ Sunshine Education শাখায়
          যোগাযোগ করে কোর্স ও ভর্তি সংক্রান্ত তথ্য
          জানতে পারেন।
        </p>

      </section>


      {/* =================================================
          BRANCH LIST
      ================================================= */}

      <section className="branch-list">

        {branches.map((branch) => (

          <div
            className="branch-card"
            key={branch.id}
          >

            {/* =============================================
                BRANCH ICON
            ============================================= */}

            <div className="branch-icon">
              📍
            </div>


            {/* =============================================
                BRANCH INFORMATION
            ============================================= */}

            <div className="branch-info">

              <h2>
                {branch.name}
              </h2>

              <p className="branch-name-bn">
                {branch.nameBn}
              </p>


              <div className="branch-details">

                <div className="branch-detail">

                  <span>
                    📍
                  </span>

                  <div>
                    <small>
                      Address
                    </small>

                    <strong>
                      {branch.address}
                    </strong>
                  </div>

                </div>


                <div className="branch-detail">

                  <span>
                    📞
                  </span>

                  <div>
                    <small>
                      Mobile
                    </small>

                    <strong>
                      {branch.mobile}
                    </strong>
                  </div>

                </div>


                <div className="branch-detail">

                  <span>
                    ✉️
                  </span>

                  <div>
                    <small>
                      Email
                    </small>

                    <strong>
                      {branch.email}
                    </strong>
                  </div>

                </div>

              </div>

            </div>


            {/* =============================================
                ACTION
            ============================================= */}

            <div className="branch-action">

              <button
                type="button"
                className="branch-location-btn"
              >
                View Location
                <span>→</span>
              </button>

            </div>

          </div>

        ))}

      </section>

    </div>
  );
}