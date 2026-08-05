import "./Contact.css";

export default function Contact() {
  return (
    <div className="contact">

      <section className="contact-header">
        <h1>যোগাযোগ করুন</h1>
        <p>
          কোর্স, ভর্তি ও অন্যান্য তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন।
        </p>
      </section>


      <section className="contact-content">

        <div className="contact-info">

          <h2>প্রতিষ্ঠানের তথ্য</h2>

          <p>
            📍 ঠিকানা: Sunshine Education, Rajshahi, Bangladesh
          </p>

          <p>
            📞 মোবাইল: 01XXXXXXXXX
          </p>

          <p>
            ✉️ Email: info@sunshineeducation.com
          </p>

          <p>
            🌐 Website: www.sunshineeducation.com
          </p>

        </div>


        <div className="contact-form">

          <h2>মেসেজ পাঠান</h2>

          <input 
            type="text" 
            placeholder="আপনার নাম"
          />

          <input 
            type="text" 
            placeholder="মোবাইল নম্বর"
          />

          <input 
            type="email" 
            placeholder="ইমেইল"
          />

          <textarea 
            placeholder="আপনার বার্তা লিখুন"
          ></textarea>


          <button>
            Send Message
          </button>

        </div>

      </section>

    </div>
  );
}