// const multer = require('multer');
// const path   = require('path');
// const fs     = require('fs');

// const uploadDir = path.join(__dirname, '..', 'uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, unique + path.extname(file.originalname).toLowerCase());
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only jpeg, jpg, png, webp images are allowed'), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 },
// });
// // 
// module.exports = upload;
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png|webp|gif/;
  const videoTypes = /mp4|mov|avi|webm|mkv/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (imageTypes.test(ext) || videoTypes.test(ext)) cb(null, true);
  else cb(new Error('Only image and video files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

// Single image upload (for profile, etc)
const uploadSingle = upload.single('image');

// Artwork upload: image required + optional proofVideo + up to 4 extraPhotos
const uploadArtwork = upload.fields([
  { name: 'image',       maxCount: 1 },
  { name: 'proofVideo',  maxCount: 1 },
  { name: 'extraPhotos', maxCount: 4 },
]);

module.exports = { upload, uploadSingle, uploadArtwork };