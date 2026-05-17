// client/src/components/Footer.jsx

import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaTiktok,
  FaFacebookF,
  FaEnvelope,
  FaWhatsapp
} from "react-icons/fa";
import "./footer.css";

const socialLinks = {
  instagram: "https://www.instagram.com/teepop2026/",
  tiktok: "https://www.tiktok.com/@teepop2026",
  facebook: "https://www.facebook.com/",
  email: "mailto:infojr.83@gmail.com",
  whatsapp: "https://wa.me/17543669922"
};

export default function Footer() {
  return (
    <footer className="cw-footer">
      <div className="container">
        <div className="cw-footer-box">
          <div className="cw-footer-grid">
            <div className="cw-footer-brand-block">
              <Link to="/" className="cw-footer-brand">
                Tee<span>PoP</span>
              </Link>

              <p className="cw-footer-copy">
                Premium custom DTF shirts packed inside collectible cans and shipped
                ready to gift, post, and wear.
              </p>

              <div className="cw-footer-socials">
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="cw-social-link cw-social-instagram"
                >
                  <FaInstagram size={20} />
                </a>

                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                  className="cw-social-link cw-social-tiktok"
                >
                  <FaTiktok size={20} />
                </a>

                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="cw-social-link cw-social-facebook"
                >
                  <FaFacebookF size={20} />
                </a>

                <a
                  href={socialLinks.email}
                  aria-label="Email"
                  className="cw-social-link cw-social-email"
                >
                  <FaEnvelope size={20} />
                </a>

                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp Junior"
                  className="cw-social-link cw-social-whatsapp"
                >
                  <FaWhatsapp size={20} />
                </a>
              </div>

              <p className="cw-footer-note">
                Need help with your order?
                <br />
                WhatsApp Junior:{" "}
                <a href="https://wa.me/17543669922" target="_blank" rel="noreferrer">
                  (754) 366-9922
                </a>
              </p>
            </div>

            <div className="cw-footer-links">
              <h4>Shop</h4>
              <a href="/#shop">Buy Can</a>
              <a href="/#can-video">Watch the can</a>
              <Link to="/cart">Cart</Link>
              <Link to="/auth">Account</Link>
            </div>

            <div className="cw-footer-links">
              <h4>Company</h4>
              <a href="/#community">Community</a>
              <a href="https://wa.me/17543669922" target="_blank" rel="noreferrer">
                Contact Junior
              </a>
              <a href="/#shop">Shipping</a>
            </div>

            <div className="cw-footer-links">
              <h4>Follow</h4>
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer">
                Instagram
              </a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer">
                TikTok
              </a>
              <a href={socialLinks.whatsapp} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="cw-footer-bottom">
          © {new Date().getFullYear()} TeePoP. All rights reserved.
        </div>
      </div>
    </footer>
  );
}