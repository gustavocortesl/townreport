var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload'
});

// include controllers
var ctrlProblems = require('../controllers/problems');
var ctrlComments = require('../controllers/comments');
var ctrlStateChanges = require('../controllers/statechanges');
var ctrlAuth = require('../controllers/authentication');
var ctrlConfig = require('../controllers/configuration');

// define routes for problems
router.get('/problems', ctrlProblems.problemsListByDistance);
router.post('/problems', auth, ctrlProblems.problemsCreate);
router.get('/problems/:problemid', ctrlProblems.problemsReadOne);
router.put('/problems/:problemid', auth, ctrlProblems.problemsUpdateOne);
router.delete('/problems/:problemid',auth, ctrlProblems.problemsDeleteOne);

// define routes for comments
router.post('/problems/:problemid/comments', auth, ctrlComments.commentsCreate);
router.get('/problems/:problemid/comments/:commentid', ctrlComments.commentsReadOne);
router.put('/problems/:problemid/comments/:commentid', auth, ctrlComments.commentsUpdateOne);
router.delete('/problems/:problemid/comments/:commentid', auth, ctrlComments.commentsDeleteOne);

// define routes for state changes
router.post('/problems/:problemid/statechanges', auth, ctrlStateChanges.stateChangesCreate);
router.get('/problems/:problemid/statechanges/:statechangeid', ctrlStateChanges.stateChangesReadOne);
router.put('/problems/:problemid/statechanges/:statechangeid', auth, ctrlStateChanges.stateChangesUpdateOne);
router.delete('/problems/:problemid/statechanges/:statechangeid', auth, ctrlStateChanges.stateChangesDeleteOne);

// define routes for authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

// define route for config variables
router.get('/config', ctrlConfig.configData);

// export routes
module.exports = router;