import jwt from 'jsonwebtoken';

const secret = () => process.env.JWT_SECRET || 'development-secret-change-me';

export function issue(res, user) {
  const token = jwt.sign({ sub: user.id }, secret(), { expiresIn: '7d' });
  res.cookie('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 86400000,
  });
}

export function clear(res) {
  res.clearCookie('session');
}

export function auth(req, res, next) {
  try {
    const token = req.cookies.session;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    req.userId = Number(jwt.verify(token, secret()).sub);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid session' });
  }
}
