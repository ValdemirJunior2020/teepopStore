// client/src/components/Navbar.jsx

import { NavLink, Link } from "react-router-dom";
import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import logo from "../teePot-logo.png";
import "./navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  const englishAudioRef = useRef(null);
  const portugueseAudioRef = useRef(null);

  const [playingTrack, setPlayingTrack] = useState(null);

  const stopAllMusic = () => {
    if (englishAudioRef.current) {
      englishAudioRef.current.pause();
      englishAudioRef.current.currentTime = 0;
    }

    if (portugueseAudioRef.current) {
      portugueseAudioRef.current.pause();
      portugueseAudioRef.current.currentTime = 0;
    }

    setPlayingTrack(null);
  };

  const playEnglishMusic = async () => {
    try {
      if (playingTrack === "english") {
        stopAllMusic();
        return;
      }

      if (portugueseAudioRef.current) {
        portugueseAudioRef.current.pause();
        portugueseAudioRef.current.currentTime = 0;
      }

      if (englishAudioRef.current) {
        englishAudioRef.current.currentTime = 0;
        await englishAudioRef.current.play();
        setPlayingTrack("english");
      }
    } catch (error) {
      console.error("English music play error:", error);
    }
  };

  const playPortugueseMusic = async () => {
    try {
      if (playingTrack === "portuguese") {
        stopAllMusic();
        return;
      }

      if (englishAudioRef.current) {
        englishAudioRef.current.pause();
        englishAudioRef.current.currentTime = 0;
      }

      if (portugueseAudioRef.current) {
        portugueseAudioRef.current.currentTime = 0;
        await portugueseAudioRef.current.play();
        setPlayingTrack("portuguese");
      }
    } catch (error) {
      console.error("Portuguese music play error:", error);
    }
  };

  return (
    <header className="cw-topbar">
      <div className="container">
        <nav className="cw-nav">
          <Link to="/" className="cw-brand" aria-label="TeePoP home">
            <img src={logo} alt="TeePoP logo" className="cw-brand-logo" />
            <span className="cw-brand-text">TeePoP</span>
          </Link>

          <div className="cw-nav-links">
            <NavLink to="/" className="cw-nav-link">
              Home
            </NavLink>

            <NavLink to="/shop" className="cw-nav-link">
  Shop
</NavLink>

            <a href="/#community" className="cw-nav-link">
              Community
            </a>

            <a
              href="https://wa.me/17543669922?text=Hi%2C%20I%20need%20help%20with%20a%20TeePoP%20order."
              className="cw-nav-link"
              target="_blank"
              rel="noreferrer"
            >
              Contact
            </a>
          </div>

          <div className="cw-music-player" aria-label="TeePoP music player">
            <button
              type="button"
              className={`cw-music-btn cw-music-btn-en ${
                playingTrack === "english" ? "cw-music-btn-active" : ""
              }`}
              onClick={playEnglishMusic}
              aria-label={
                playingTrack === "english"
                  ? "Stop TeePoP English song"
                  : "Play TeePoP English song"
              }
            >
              <span className="cw-music-flag">🇺🇸</span>
              <span>
                {playingTrack === "english" ? "⏸ Stop EN" : "▶ Play EN"}
              </span>
            </button>

            <button
              type="button"
              className={`cw-music-btn cw-music-btn-pt ${
                playingTrack === "portuguese" ? "cw-music-btn-active" : ""
              }`}
              onClick={playPortugueseMusic}
              aria-label={
                playingTrack === "portuguese"
                  ? "Stop TeePoP Portuguese song"
                  : "Play TeePoP Portuguese song"
              }
            >
              <span className="cw-music-flag">🇧🇷</span>
              <span>
                {playingTrack === "portuguese" ? "⏸ Stop PT" : "▶ Play PT"}
              </span>
            </button>

            {playingTrack && (
              <button
                type="button"
                className="cw-music-stop"
                onClick={stopAllMusic}
                aria-label="Stop all TeePoP music"
              >
                ✕
              </button>
            )}

            <audio
              ref={englishAudioRef}
              src="/English.mp3"
              preload="metadata"
              onEnded={() => setPlayingTrack(null)}
            />

            <audio
              ref={portugueseAudioRef}
              src="/Portuguese.mp3"
              preload="metadata"
              onEnded={() => setPlayingTrack(null)}
            />
          </div>

          <div className="cw-nav-actions">
            {user ? (
              <div className="cw-user-pill">
                <span className="cw-user-name">
                  Hi, {user.displayName || user.email?.split("@")[0]}
                </span>

                <button type="button" className="badge-btn" onClick={logout}>
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/auth" className="badge-btn">
                Login
              </Link>
            )}

            <Link to="/cart" className="cw-cart-pill">
              Cart
              <span className="cw-cart-count">{cartCount}</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}