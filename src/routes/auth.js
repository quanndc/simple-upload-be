const { Router } = require('express');
const auth = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = Router();

// Check or create user based on Firebase token
router.post('/check-auth', auth, async (req, res, next) => {
  try {
    const decoded = req.user;

    if (!decoded || !decoded.uid) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const firebaseUid = decoded.uid;
    const name = decoded.name || decoded.displayName || null;
    const email = decoded.email || null;
    const picture = decoded.picture || null;

    let user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid,
          name,
          email,
          picture,
        },
      });
      return res.status(201).json({ exists: false, user });
    }

    return res.status(200).json({ exists: true, user });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;


