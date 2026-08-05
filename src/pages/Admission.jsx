import "./Admission.css";

export default function Admission() {
  return (
    <div className="admission">

      <section className="admission-header">
        <h1>ভর্তি কার্যক্রম</h1>
        <p>
          আমাদের Japanese, German ও Korean Language Course-এ
          ভর্তি চলছে।
        </p>
      </section>


      <section className="admission-content">

        <div className="admission-card">
          <h2>ভর্তির জন্য প্রয়োজনীয় তথ্য</h2>

          <ul>
            <li>শিক্ষার্থীর নাম</li>
            <li>মোবাইল নম্বর</li>
            <li>জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন (প্রযোজ্য ক্ষেত্রে)</li>
            <li>পাসপোর্ট সাইজ ছবি</li>
            <li>শিক্ষাগত যোগ্যতার তথ্য</li>
          </ul>
        </div>


        <div className="admission-card">
          <h2>উপলব্ধ কোর্স</h2>

          <ul>
            <li>🇯🇵 Japanese Language Course</li>
            <li>🇩🇪 German Language Course</li>
            <li>🇰🇷 Korean Language Course</li>
          </ul>
        </div>


        <div className="admission-card">
          <h2>ভর্তি প্রক্রিয়া</h2>

          <ol>
            <li>কোর্স নির্বাচন করুন</li>
            <li>ভর্তি ফরম পূরণ করুন</li>
            <li>প্রয়োজনীয় তথ্য জমা দিন</li>
            <li>ক্লাস শুরু করুন</li>
          </ol>
        </div>

      </section>


      <section className="contact-admission">

        <h2>ভর্তি সংক্রান্ত যোগাযোগ</h2>

        <p>
          মোবাইল: 01XXXXXXXXX
        </p>

        <p>
          ইমেইল: info@sunshineeducation.com
        </p>

      </section>


    </div>
  );
}