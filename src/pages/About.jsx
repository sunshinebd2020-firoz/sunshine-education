import "./About.css";

export default function About() {
  return (
    <div className="about">

      <section className="about-header">
        <h1>আমাদের সম্পর্কে</h1>
        <p>
          Sunshine Education একটি আধুনিক ও মানসম্মত শিক্ষা প্রতিষ্ঠান।
          শিক্ষার্থীদের জ্ঞান, দক্ষতা ও নৈতিক মূল্যবোধ বিকাশে আমরা কাজ করে যাচ্ছি।
        </p>
      </section>


      <section className="about-content">

        <div className="about-card">
          <h2>প্রতিষ্ঠানের ইতিহাস</h2>
          <p>
            Sunshine Education প্রতিষ্ঠার মূল উদ্দেশ্য হলো শিক্ষার্থীদের
            জন্য একটি সুন্দর ও সুশৃঙ্খল শিক্ষা পরিবেশ তৈরি করা।
            এখানে অভিজ্ঞ শিক্ষকগণের মাধ্যমে পাঠদান পরিচালনা করা হয়।
          </p>
        </div>


        <div className="about-card">
          <h2>আমাদের লক্ষ্য</h2>
          <p>
            আধুনিক শিক্ষা পদ্ধতির মাধ্যমে শিক্ষার্থীদের মেধা বিকাশ,
            সৃজনশীলতা বৃদ্ধি এবং ভবিষ্যতের জন্য প্রস্তুত করা।
          </p>
        </div>


        <div className="about-card">
          <h2>আমাদের বৈশিষ্ট্য</h2>
          <ul>
            <li>অভিজ্ঞ ও দক্ষ শিক্ষক</li>
            <li>মানসম্মত পাঠদান</li>
            <li>শৃঙ্খলাপূর্ণ পরিবেশ</li>
            <li>শিক্ষার্থীদের প্রতি বিশেষ যত্ন</li>
          </ul>
        </div>

      </section>

    </div>
  );
}