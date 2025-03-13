const mongoose = require('mongoose')

const connectDB = (mongoURL) => {

  return mongoose.connect(mongoURL, {});
  
}

module.exports = connectDB
