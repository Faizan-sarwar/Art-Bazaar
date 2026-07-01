const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  await User.findOneAndUpdate(
    { email: 'HaroonAdmin@gmail.com' },
    { role: 'admin' }
  );
  console.log('Done — user is now admin');
  mongoose.disconnect();
});