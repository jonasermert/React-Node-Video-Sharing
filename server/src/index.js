import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';
import { existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { auth, clear, issue } from './auth.js';
import { db, testDatabaseConnection } from './db.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const uploads = resolve('uploads');

mkdirSync(uploads, { recursive: true });

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(uploads, { fallthrough: false }));

const storage = multer.diskStorage({
  destination: uploads,
  filename: (_r, f, cb) =>
    cb(null, `${Date.now()}-${nanoid(8)}${extname(f.originalname) || '.webm'}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_r, f, cb) => cb(null, f.mimetype.startsWith('video/')),
});

// Express 4 does not forward rejected promises from async handlers to the
// error middleware on its own; this wrapper makes sure a failed query (e.g.
// a lost DB connection) results in a clean 500 response instead of an
// unhandled rejection that crashes the process.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const toIso = (value) => (value instanceof Date ? value.toISOString() : value);

const userView = (u) => ({ id: u.id, name: u.name, email: u.email });

const videoView = (v, req) => ({
  id: v.id,
  title: v.title,
  description: v.description,
  createdAt: toIso(v.created_at),
  updatedAt: toIso(v.updated_at),
  videoUrl: `/uploads/${v.filename}`,
  shareUrl: `${req.protocol}://${req.get('host')}/view/${v.id}`,
});

app.post(
  '/api/auth/register',
  asyncHandler(async (req, res) => {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body.password || '');

    if (name.length < 2 || !email.includes('@') || password.length < 8) {
      return res.status(422).json({
        message: 'Please provide a valid name, email and a password with at least 8 characters.',
      });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash],
    );

    const user = { id: result.insertId, name, email };
    issue(res, user);
    res.status(201).json({ user: userView(user) });
  }),
);

app.post(
  '/api/auth/login',
  asyncHandler(async (req, res) => {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();

    const [rows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.password_hash))) {
      return res.status(422).json({ message: 'Invalid email or password.' });
    }

    issue(res, user);
    res.json({ user: userView(user) });
  }),
);

app.post('/api/auth/logout', (_req, res) => {
  clear(res);
  res.json({ ok: true });
});

app.get(
  '/api/auth/me',
  auth,
  asyncHandler(async (req, res) => {
    const [rows] = await db.query('SELECT id, name, email FROM users WHERE id = ? LIMIT 1', [
      req.userId,
    ]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ user: userView(user) });
  }),
);

app.get(
  '/api/videos',
  auth,
  asyncHandler(async (req, res) => {
    const [rows] = await db.query(
      'SELECT * FROM videos WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId],
    );
    res.json({ videos: rows.map((v) => videoView(v, req)) });
  }),
);

app.post(
  '/api/videos',
  auth,
  upload.single('video'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(422).json({ message: 'Please choose a video.' });
    }

    const title = String(req.body.title || '').trim();
    if (!title) {
      unlinkSync(req.file.path);
      return res.status(422).json({ message: 'A title is required.' });
    }

    const id = nanoid(14);
    const description = String(req.body.description || '').trim();

    await db.query(
      `INSERT INTO videos (id, user_id, title, description, filename, mime_type)
     VALUES (?, ?, ?, ?, ?, ?)`,
      [id, req.userId, title, description, req.file.filename, req.file.mimetype],
    );

    const [rows] = await db.query('SELECT * FROM videos WHERE id = ? LIMIT 1', [id]);
    res.status(201).json({ video: videoView(rows[0], req) });
  }),
);

app.get(
  '/api/videos/:id',
  auth,
  asyncHandler(async (req, res) => {
    const [rows] = await db.query('SELECT * FROM videos WHERE id = ? AND user_id = ? LIMIT 1', [
      req.params.id,
      req.userId,
    ]);
    const v = rows[0];
    if (!v) return res.status(404).json({ message: 'Video not found' });
    res.json({ video: videoView(v, req) });
  }),
);

app.patch(
  '/api/videos/:id',
  auth,
  asyncHandler(async (req, res) => {
    const title = String(req.body.title || '').trim();
    if (!title) {
      return res.status(422).json({ message: 'A title is required.' });
    }
    const description = String(req.body.description || '').trim();

    const [result] = await db.query(
      'UPDATE videos SET title = ?, description = ? WHERE id = ? AND user_id = ?',
      [title, description, req.params.id, req.userId],
    );
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const [rows] = await db.query('SELECT * FROM videos WHERE id = ? LIMIT 1', [req.params.id]);
    res.json({ video: videoView(rows[0], req) });
  }),
);

app.delete(
  '/api/videos/:id',
  auth,
  asyncHandler(async (req, res) => {
    const [rows] = await db.query('SELECT * FROM videos WHERE id = ? AND user_id = ? LIMIT 1', [
      req.params.id,
      req.userId,
    ]);
    const v = rows[0];
    if (!v) return res.status(404).json({ message: 'Video not found' });

    await db.query('DELETE FROM videos WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);

    const p = resolve(uploads, v.filename);
    if (existsSync(p)) unlinkSync(p);
    res.json({ ok: true });
  }),
);

app.get(
  '/api/public/videos/:id',
  asyncHandler(async (req, res) => {
    const [rows] = await db.query('SELECT * FROM videos WHERE id = ? LIMIT 1', [req.params.id]);
    const v = rows[0];
    if (!v) return res.status(404).json({ message: 'Video not found' });
    res.json({ video: videoView(v, req) });
  }),
);

app.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'The video is larger than 500 MB.' });
  }

  // Errors bubbled up from express.static (e.g. a missing/removed upload)
  // already carry the correct HTTP status; forward it instead of masking
  // every non-500 case as a generic server error.
  const status = Number(err.status || err.statusCode) || 500;
  if (status < 500) {
    return res.status(status).json({ message: err.message || 'Request failed.' });
  }

  console.error(err);
  res.status(500).json({ message: 'Unexpected server error.' });
});

try {
  await testDatabaseConnection();
} catch (err) {
  console.error('Could not connect to MySQL. Is the database running (npm run db:start)?');
  console.error(err.message);
  process.exit(1);
}

app.listen(port, () => console.log(`API running at http://localhost:${port}`));
