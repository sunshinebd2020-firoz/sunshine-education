import "./Header.css";
import logo from "../../assets/logo/logo.png";

export default function Header() {
  return (
    <header className="header">
          <img src={logo} alt="Logo" className="logo" />
      <h1>Sunshine Education</h1>
      <p>Japanese, German and Korean Language School</p>
    </header>
  );
}