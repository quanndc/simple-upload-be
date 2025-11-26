const path = require('path');
const { Router } = require('express');
const { v4: uuid } = require('uuid');

const upload = require('../middleware/upload');
const prisma = require('../lib/prisma');
const { getSupabaseClient } = require('../lib/supabase');

const router = Router();


function buildStoragePath(originalName = '') {
  const extension = path.extname(originalName) || '.jpg';
  return `photos/${uuid()}${extension}`;
}

function getBucketName() {
  const bucket = process.env.SUPABASE_BUCKET;
  if (!bucket) {
    throw new Error('Missing SUPABASE_BUCKET configuration.');
  }
  return bucket;
}

router.get('/', async (req, res, next) => {
  try {
    const photos = await prisma.photo.findMany({
      include: {
        comments: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ photos });
  } catch (error) {
    next(error);
  }
});

router.post('/', upload.single("photo"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: `Field "${PHOTO_FIELD}" is required.` });
    }

    if (!req.body.description || !req.body.description.trim()) {
      return res.status(400).json({ message: 'Description is required.' });
    }

    const description = req.body.description.trim();
    const supabase = getSupabaseClient();
    const bucket = getBucketName();
    const storagePath = buildStoragePath(req.file.originalname);

    const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, req.file.buffer, {
      cacheControl: '3600',
      contentType: req.file.mimetype,
      upsert: false,
    });

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(storagePath);

    const photo = await prisma.photo.create({
      data: {
        originalName: req.file.originalname,
        storagePath,
        publicUrl,
        description,
      },
    });

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

    const numericPhotoId = Number(photoId);
    if (Number.isNaN(numericPhotoId)) {
      return res.status(400).json({ message: 'Photo id must be a number.' });
    }

    const photo = await prisma.photo.findUnique({ where: { id: numericPhotoId } });
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found.' });
    }

    const comment = await prisma.comment.create({
      data: {
        body: body.trim(),
        author: author?.trim() || null,
        photoId: numericPhotoId,
      },
    });

    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

