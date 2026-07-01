const Event = require('../models/Event');

// GET /api/events — public
const getEvents = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { active: true };
    if (type && type !== 'all') filter.type = type;

    const events = await Event.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, events });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/events/admin — admin all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, events });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// POST /api/events — admin only
const createEvent = async (req, res) => {
  try {
    const {
      title, description, type, date,
      location, price, prize, organizer,
      capacity, readTime, featured,
    } = req.body;

    if (!title || !description || !type || !date) {
      return res.status(400).json({ success: false, message: 'Title, description, type, and date required' });
    }

    const event = new Event({
      title,
      description,
      type,
      date,
      image: req.file ? `/uploads/${req.file.filename}` : '',
      location: location || '',
      price: price ? Number(price) : 0,
      prize: prize ? Number(prize) : 0,
      organizer: organizer || '',
      capacity: capacity ? Number(capacity) : 0,
      readTime: readTime || '',
      featured: featured ? true : false,
    });

    await event.save();
    return res.status(201).json({ success: true, event });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// PUT /api/events/:id — admin only
const updateEvent = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.image = `/uploads/${req.file.filename}`;
    if (updates.price) updates.price = Number(updates.price);
    if (updates.prize) updates.prize = Number(updates.prize);
    if (updates.capacity) updates.capacity = Number(updates.capacity);

    const event = await Event.findByIdAndUpdate(
      req.params.id, updates, { new: true }
    );
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    return res.status(200).json({ success: true, event });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// DELETE /api/events/:id — admin only
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    return res.status(200).json({ success: true, message: 'Event deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// POST /api/events/:id/register — buyer/artist event registration (Added for Priority #21)
const registerEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if already registered
    if (event.attendees.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You are already registered for this event.' });
    }

    // Check capacity
    if (event.capacity && event.attendees.length >= event.capacity) {
      return res.status(400).json({ success: false, message: 'Sorry, this event is fully booked.' });
    }

    // Add user to attendees
    event.attendees.push(req.user._id);
    await event.save();

    return res.status(200).json({ success: true, message: 'Successfully registered for event', event });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = {
  getEvents,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  registerEvent
};