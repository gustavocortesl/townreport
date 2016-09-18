var express = require('express');
var router = express.Router();
var ctrlLocations = require('../controllers/locations');
var ctrlOthers = require('../controllers/others');

/* Locations pages */
router.get('/', ctrlOthers.angularApp);
//router.get('/location/:locationid', ctrlLocations.locationInfo);
// Insert locationid parameter into existing route for review form
//router.get('/location/:locationid/reviews/new', ctrlLocations.addReview);
// New route on same URL but using POST method and referencing different controller
//router.post('/location/:locationid/reviews/new', ctrlLocations.doAddReview);

/* Other pages */
router.get('/about', ctrlOthers.about);

module.exports = router;
