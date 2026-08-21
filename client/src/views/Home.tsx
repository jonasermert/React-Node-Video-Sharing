import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="hero">
      <div>
        <span className="eyebrow" />
        <h1>Record. Share. Done.</h1>
        <p>
          Capture your screen or webcam directly in the browser, save recordings privately and
          share them with one simple link.
        </p>
        <div className="actions">
          <Link
            className="button"
            to="/videos/create"
          >
            Start recording
          </Link>
          <Link
            className="button secondary"
            to="/register"
          >
            Create account
          </Link>
        </div>
      </div>
      <div className="preview">
        <div className="camera">● REC</div>
        <div className="screen">
          <div className="play">▶</div>
        </div>
      </div>
    </section>
  );
}
