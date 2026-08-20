import "./Contact.css";
import API_BASE_URL from "../config/api";
import { useEffect, useState } from "react";

export default function Contact() {
  const [branch, setBranch] = useState(null);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  /* =========================================
     LOAD MAIN BRANCH
  ========================================= */

  useEffect(() => {
    fetch(`${API_BASE_URL}/branch_list.php`, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Branch server error");
        }

        return response.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.branches)) {
          const mainBranch = data.branches.find(
            (item) =>
              Number(item.sort_order) === 1 &&
              String(item.status).toLowerCase() === "active"
          );

          setBranch(mainBranch || null);
        }
      })
      .catch((error) => {
        console.error("Branch fetch error:", error);
      });
  }, []);


  /* =========================================
     MAP URL
  ========================================= */

  const getMapUrl = () => {
    if (!branch) {
      return "";
    }

    const mapLink = String(branch.map_link || "").trim();

    const address = String(branch.address || "").trim();

    /*
      যদি map_link আগে থেকেই Google Embed URL হয়,
      তাহলে সেটিই ব্যবহার হবে।
    */

    if (
      mapLink.includes("google.com/maps/embed") ||
      mapLink.includes("google.com/maps/embed?")
    ) {
      return mapLink;
    }

    /*
      যদি সাধারণ Google Maps URL হয়,
      তাহলে address দিয়ে embedded map তৈরি হবে।
    */

    if (address) {
      return (
        "https://www.google.com/maps?q=" +
        encodeURIComponent(address) +
        "&output=embed"
      );
    }

    return "";
  };


  /* =========================================
     INPUT CHANGE
  ========================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!form.name.trim()) {
      setMessage("আপনার নাম লিখুন।");
      return;
    }

    if (!form.mobile.trim()) {
      setMessage("মোবাইল নম্বর লিখুন।");
      return;
    }

    if (!form.message.trim()) {
      setMessage("আপনার বার্তা লিখুন।");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/contact_message.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            mobile: form.mobile.trim(),
            email: form.email.trim(),
            message: form.message.trim(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(
          data.message || "আপনার মেসেজ সফলভাবে পাঠানো হয়েছে।"
        );

        setForm({
          name: "",
          mobile: "",
          email: "",
          message: "",
        });
      } else {
        setMessage(
          data.message || "মেসেজ পাঠানো যায়নি।"
        );
      }
    } catch (error) {
      console.error("Contact submit error:", error);

      setMessage(
        "Server-এর সাথে যোগাযোগ করা যায়নি।"
      );
    } finally {
      setLoading(false);
    }
  };


  const mapUrl = getMapUrl();


  return (
    <div className="contact">

 
      {/* =========================================
          CONTENT
      ========================================= */}

      <section className="contact-content">


        {/* =========================================
            BRANCH INFORMATION
        ========================================= */}

        <div className="contact-info">

          <h2>প্রতিষ্ঠানের তথ্য</h2>


          {branch ? (
            <>

              {branch.address && (
                <p>
                  📍 <strong>ঠিকানা:</strong>{" "}
                  {branch.address}
                </p>
              )}


              {branch.mobile && (
                <p>
                  📞 <strong>মোবাইল:</strong>{" "}
                  {branch.mobile}
                </p>
              )}


              {branch.email && (
                <p>
                  ✉️ <strong>Email:</strong>{" "}
                  {branch.email}
                </p>
              )}


              {/* =================================
                  GOOGLE MAP
              ================================= */}

              {mapUrl && (
                <div className="contact-map">

                  <iframe
                    src={mapUrl}
                    title={
                      branch.branch_name_bn ||
                      branch.branch_name ||
                      "Sunshine Education Location"
                    }
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>

                </div>
              )}

            </>
          ) : (
            <p className="contact-loading">
              তথ্য লোড হচ্ছে...
            </p>
          )}

        </div>


        {/* =========================================
            CONTACT FORM
        ========================================= */}

        <div className="contact-form">

          <h2>মেসেজ পাঠান</h2>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="আপনার নাম"
              autoComplete="name"
            />


            <input
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="মোবাইল নম্বর"
              autoComplete="tel"
            />


            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ইমেইল"
              autoComplete="email"
            />


            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="আপনার বার্তা লিখুন"
            ></textarea>


            {message && (
              <div className="contact-message">
                {message}
              </div>
            )}


            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "পাঠানো হচ্ছে..."
                : "Send Message"}
            </button>

          </form>

        </div>

      </section>

    </div>
  );
}