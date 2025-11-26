const { Router } = require('express');

const photosRouter = require('./photos');

const router = Router();
router.use('/photos', photosRouter);

module.exports = router;

