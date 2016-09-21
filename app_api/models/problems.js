// Require Mongoose so that we can use its methods
var mongoose = require( 'mongoose' );

// Define a schema for comments
var commentSchema = new mongoose.Schema({
  author: {type: String, required: true},
  commentText: {type: String, required: true},
  createdOn: {type: Date, "default": Date.now}
});

// Define a schema for state changes
var stateChangeSchema = new mongoose.Schema({
  author: {type: String, required: true},
  state:{type: String, required: true},
  commentText: {type: String, required: true},
  createdOn: {type: Date, "default": Date.now}
});

// Start main location schema definition
var problemSchema = new mongoose.Schema({
  author: {type: String, required: true},
  name: {type: String, required: true},
  category: {type: String, required: true},
  state: {type: String, required: true},
  description: {type: String, required: true},
  address: String,
  priority: {type: Number, "default": 0, min: 0, max: 3},
  coords: {type: [Number], index: '2dsphere', required: true},
  comments: [commentSchema],
  stateChanges: [stateChangeSchema]
},
{
  timestamps: true
});

// Once defined the data schema for the locations,
// we compile the schema into a model
mongoose.model('Problem', problemSchema); // => collection name is 'problems'
