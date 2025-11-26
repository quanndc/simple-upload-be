const { initFirebaseAdmin } = require('../lib/firebaseAdmin');
const { parseAuthHeader } = require('../utils/auth');

async function authMiddleware(req, res, next) {
  try {
    const { scheme, token } = parseAuthHeader(req);

    if (!token || scheme.toLowerCase() !== 'bearer') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const admin = initFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(token);
    console.log(decoded);

    req.user = decoded;
    return next();
  } catch (error) {
    // Optional: log error for debugging
    // console.error('Auth error', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;


