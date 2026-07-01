const express  = require('express');
const router   = express.Router();
const { getEvents, getAllEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, restrictTo } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/',         getEvents);
router.get('/admin',    protect, restrictTo('admin'), getAllEvents);
router.post('/',        protect, restrictTo('admin'), upload.single('image'), createEvent);
router.put('/:id',      protect, restrictTo('admin'), upload.single('image'), updateEvent);
router.delete('/:id',   protect, restrictTo('admin'), deleteEvent);

module.exports = router;