// Require Mongoose so that we can use its methods
var mongoose = require( 'mongoose' );

// Define a schema for opening times
var openingTimeSchema = new mongoose.Schema({
  days: {type: String, required: true},
  opening: String,
  closing: String,
  closed: {type: Boolean, required: true}
});

// Define a schema for reviews
var reviewSchema = new mongoose.Schema({
  author: {type: String, required: true},
  rating: {type: Number, required: true, min: 0, max: 5},
  reviewText: {type: String, required: true},
  createdOn: {type: Date, "default": Date.now}
});

// Start main location schema definition
var locationSchema = new mongoose.Schema( {
  name: {type: String, required: true},
  address: String,
  rating: {type: Number, "default": 0, min: 0, max: 5},
  facilities: [String],
  coords: {type: [Number], index: '2dsphere', required: true},
  openingTimes: [openingTimeSchema],
  reviews: [reviewSchema]
});

// Once defined the data schema for the locations,
// we compile the schema into a model
mongoose.model('Location', locationSchema); // => collection name is 'locations'
