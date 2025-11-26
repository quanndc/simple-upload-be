const path = require('path');

const prisma = require('../../lib/prisma');
const { getSupabaseClient } = require('../../lib/supabase');

function buildStoragePath(originalName = '') {
  const extension = path.extname(originalName) || '.jpg';
  const timestamp = Date.now();
  return `photos/${timestamp}${extension}`;
}

function getBucketName() {
  const bucket = process.env.SUPABASE_BUCKET;
  if (!bucket) {
    throw new Error('Missing SUPABASE_BUCKET configuration.');
  }
  return bucket;
}

async function listPhotos() {
  return prisma.photo.findMany({
    include: {
      User: true,
      comments: {
        include: {
          User: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function uploadPhoto({ file, description, userFirebaseId }) {
  console.log(userFirebaseId);
  if (!file) {
    throw new Error('File is required');
  }

  const supabase = getSupabaseClient();
  const bucket = getBucketName();
  const storagePath = buildStoragePath(file.originalname);

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file.buffer, {
      cacheControl: '3600',
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  return prisma.photo.create({
    data: {
      originalName: file.originalname,
      storagePath,
      publicUrl,
      description,
      user_firebase_id: userFirebaseId || null,
    },
    include: {
      User: true,
    },
  });
}

async function addCommentToPhoto({ photoId, body, author, userFirebaseId }) {
  const numericPhotoId = Number(photoId);
  if (Number.isNaN(numericPhotoId)) {
    const err = new Error('Photo id must be a number.');
    err.status = 400;
    throw err;
  }

  const photo = await prisma.photo.findUnique({ where: { id: numericPhotoId } });
  if (!photo) {
    const err = new Error('Photo not found.');
    err.status = 404;
    throw err;
  }

  return prisma.comment.create({
    data: {
      body,
      user_firebase_id: userFirebaseId || null,
      photoId: numericPhotoId,
    },
    include: {
      User: true,
    },
  });
}

module.exports = {
  listPhotos,
  uploadPhoto,
  addCommentToPhoto,
};


