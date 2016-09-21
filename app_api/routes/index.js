var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload'
});

// include controllers
var ctrlLocations = require('../controllers/locations');
var ctrlReviews = require('../controllers/reviews');
var ctrlProblems = require('../controllers/problems');
var ctrlComments = require('../controllers/comments');
var ctrlStateChanges = require('../controllers/statechanges');
var ctrlAuth = require('../controllers/authentication');

// define routes for locations
router.get('/locations', ctrlLocations.locationsListByDistance);
router.post('/locations', ctrlLocations.locationsCreate);
router.get('/locations/:locationid', ctrlLocations.locationsReadOne);
router.put('/locations/:locationid', ctrlLocations.locationsUpdateOne);
router.delete('/locations/:locationid', ctrlLocations.locationsDeleteOne);

// define routes for reviews
router.post('/locations/:locationid/reviews', auth, ctrlReviews.reviewsCreate);
router.get('/locations/:locationid/reviews/:reviewid', ctrlReviews.reviewsReadOne);
router.put('/locations/:locationid/reviews/:reviewid', auth, ctrlReviews.reviewsUpdateOne);
router.delete('/locations/:locationid/reviews/:reviewid', auth, ctrlReviews.reviewsDeleteOne);

// define routes for problems
router.get('/problems', ctrlProblems.problemsListByDistance);
router.post('/problems', ctrlProblems.problemsCreate);
router.get('/problems/:problemid', ctrlProblems.problemsReadOne);
router.put('/problems/:problemid', ctrlProblems.problemsUpdateOne);
router.delete('/problems/:problemid', ctrlProblems.problemsDeleteOne);

// define routes for comments
router.post('/locations/:problemid/comments', auth, ctrlComments.commentsCreate);
router.get('/locations/:problemid/comments/:commentid', ctrlComments.commentsReadOne);
router.put('/locations/:problemid/comments/:commentid', auth, ctrlComments.commentsUpdateOne);
router.delete('/locations/:problemid/comments/:commentid', auth, ctrlComments.commentsDeleteOne);

// define routes for state changes
router.post('/locations/:problemid/statechanges', auth, ctrlStateChanges.stateChangesCreate);
router.get('/locations/:problemid/statechanges/:statechangeid', ctrlStateChanges.stateChangesReadOne);
router.put('/locations/:problemid/statechanges/:statechangeid', auth, ctrlStateChanges.stateChangesUpdateOne);
router.delete('/locations/:problemid/statechanges/:statechangeid', auth, ctrlStateChanges.stateChangesDeleteOne);

// define routes for authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

// export routes
module.exports = router;