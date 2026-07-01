const express  = require('express');
const router   = express.Router();
const {
  uploadArtwork,
  getAllArtworks,
  getArtworkById,
  getMyArtworks,
  updateArtwork,
  deleteArtwork,
} = require('../controllers/artworkController');
const { protect }                              = require('../middleware/auth');
const { upload, uploadArtwork: uploadFields }  = require('../middleware/upload');

const handleError = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

router.get   ('/',        getAllArtworks);
router.get   ('/my',      protect, getMyArtworks);
router.get   ('/:id',     getArtworkById);
router.post  ('/upload',  protect, handleError(uploadFields), uploadArtwork);
router.put   ('/:id',     protect, handleError(upload.single('image')), updateArtwork);
router.delete('/:id',     protect, deleteArtwork);

module.exports = router;