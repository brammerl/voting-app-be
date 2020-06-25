require('dotenv').config();
require('./lib/utils/connect')();

const mongoose = require('mongoose');
const seed = require('./lib/utils/seed');

seed()
  .then(() => console.log('Database seeded'))
  .finally(() => mongoose.connection.close());
