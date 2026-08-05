import "./Home.css";

export default function Home() {
  return (
    <div className="home">

      <section className="welcome">
        <h1>স্বাগতম Sunshine Education এ</h1>
        <p>
          আধুনিক ও মানসম্মত শিক্ষার মাধ্যমে শিক্ষার্থীদের
          জ্ঞান, দক্ষতা ও নৈতিক মূল্যবোধ গড়ে তোলাই আমাদের লক্ষ্য।
        </p>
      </section>


      <section className="features">

        <div className="card">
          <h2>আমাদের লক্ষ্য</h2>
          <p>
            শিক্ষার্থীদের জন্য উন্নত শিক্ষা পরিবেশ নিশ্চিত করা।
          </p>
        </div>

        <div className="card">
          <h2>অভিজ্ঞ শিক্ষক</h2>
          <p>
            দক্ষ ও অভিজ্ঞ শিক্ষকমণ্ডলীর মাধ্যমে পাঠদান।
          </p>
        </div>

        <div className="card">
          <h2>আধুনিক শিক্ষা</h2>
          <p>
            প্রযুক্তিনির্ভর ও যুগোপযোগী শিক্ষা ব্যবস্থা।
          </p>
        </div>

      </section>


      <section className="about-home">
        <h2>প্রতিষ্ঠান সম্পর্কে</h2>
        <p>
          Sunshine Education একটি আদর্শ শিক্ষা প্রতিষ্ঠান।
          এখানে শিক্ষার্থীদের একাডেমিক শিক্ষার পাশাপাশি
          নৈতিক ও সামাজিক মূল্যবোধের শিক্ষা প্রদান করা হয়।
        </p>
      </section>

    </div>
  );
}