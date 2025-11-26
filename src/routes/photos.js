const { Router } = require('express');
const upload = require('../middleware/upload');
const { listPhotos, uploadPhoto, addCommentToPhoto } = require('../services/photo');

const router = Router();

router.get('/', async (_, res, next) => {
  try {
    const photos = await listPhotos();

    res.status(200).json({ photos });
  } catch (error) {
    next(error);
  }
});

router.post('/', upload.single("photo"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: `Field "photo" is required.` });
    }

    if (!req.body.description || !req.body.description.trim()) {
      return res.status(400).json({ message: 'Description is required.' });
    }

    const description = req.body.description.trim();
    const photo = await uploadPhoto({ file: req.file, description });

    res.status(201).json({ photo });
  } catch (error) {
    next(error);
  }
});

router.post('/:photoId/comments', async (req, res, next) => {
  try {
    const { photoId } = req.params;
    const { body, author } = req.body || {};

    if (!body || !body.trim()) {
      return res.status(400).json({ message: 'Comment body is required.' });
    }

    const comment = await addCommentToPhoto({
      photoId,
      body: body.trim(),
      author: author?.trim() || null,
    });

    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

