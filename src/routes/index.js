const { Router } = require('express');

const photosRouter = require('./photos');
const authRouter = require('./auth');

const router = Router();

router.use('/photos', photosRouter);
router.use('/auth', authRouter);

module.exports = router;

