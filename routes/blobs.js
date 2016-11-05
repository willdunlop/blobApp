var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'), // Connects mongo
	bodyParser = require('body-parser'), // parses infor from POST
	methodOverride = require('method-override'); // used to manipulate POST

router.use(bodyParser.urlencoded({extended: true}))
	router.use(methodOverride(function(req, res){
		if (req.body && typeof req.body === 'object' && '_method' in req.body) {
			// look in urlencodedPOST bodies and delete it
			var method = req.body._method
			delete req.body._method
			return method 
		}
	}))

//build the RS+EST operation at the base for blobs
//accessible from localhost:3000/blobs if root route is left as default /
router.route('/')
	//GET all blobs
.get(function(req, res, next) {
	//retrieve all blobs from db
	mongoose.model('Blob').find({}, function(err, blobs) {
		if (err) {
			return console.error(err);
		} else {
			//respond to both HTML and JSON
			res.format({
				//HTML response will render the index.jade file in view/blobs
				html: function() {
					res.render('blobs/index', {
						title: 'All my Blobs',
						"blobs" : blobs 
					});
				},
				//JSON response will show all blobs in JSON format
				json: function() {
					res.json(infophotos);
				}
			});
		}
	});
})

//POST a new blob
.post(function(req, res) {
	// Get values from POST request.
	var name = req.body.name;
	var badge = req.body.badge;
	var dob = req.body.deb;
	var company = req.body.company;
	var isloved = req.body.isloved;
   // call the creat function for the db
	mongoose.model('Blob').create({
		name : name,
		badge : badge, 
		dob : dob,
		isloved : isloved 
	}, function (err, blob) {
		if (err) {
			res.send("There was a issue, deal with it");
		} else {
			//Blob has been created
			console.log('POST creating a new blob: ' + blob);
			res.format({
				//HTML res will set the location and rediract back to root
				//Can set up a success page if that is preffered
				html: function() {
					// If it worked, set header so the address doesnt say /adduser still
					res.location("blobs");
					//And forward to success page
					res.redirect("/blobs");
				},
				//JSON response will show the newly created blob
				json: function() {
					res.json(blob);
				}
			});
		}
	})	
});

//GET new blob page
router.get('/new', function(req, res) {
	res.render('blobs/new', {title: 'Add New Blob'});
});

//route middleware to validate :id
router.param('id', function(req, res, next, id) {
	console.log('Validating if ' + id + ' actually exists');
	//find the ID in the DB
	mongoose.model('Blob').findByID(id, function (err, blob) {
		//404 if not found 
		if (err) {
			console.log(id + ' dun exist son');
			res.status(404)
			var err = new Error('Not Found');
			err.status = 404;
			res.format({
				html: function(){
					next(err);
				},
				json: function(){
					res.json({message : err.status + ' ' + err});
				}
			});
			//if found, carryon
		} else {
			console.log(blob);
			//once validates, save the item in the req
			req.id = id;
			next()
		}
	});
});

router.route('/:id')
.get(function(req, res) {
	mongoose.model('Blob').findById(req.id, function(err, blob) {
		if (err) {
			console.log('GET Error: Shit happened when trying to retrieve: ' + err);
		} else {
			console.log('GET Retrieving ID: ' + blob_id);
			var blobdob = blob.dob.toISOString();
			blobdob = blobdob.subsring(0, blobdob.indexOf('T'))
				res.format({
					html: function(){
						res.render('blobs/show', {
							"blobdob" : blobdob,
							"blob" : blob
						});
					},
					json: function() {
					  res.json(blob);
					}
				});
		}
	});
});

//Get the individual blob by Mongo ID
router.get('/:id/edit', function(req, res) {
	//search for the blob within mongo
	mongoose.model('Blob').findById(req.id, function(err, blob) {
		if (err) {
			console.log('GET ERROR: Shit happened when trying to retrieve: ' + err);
		} else {
			//Return the blob
			console.log('GET Retrieving ID: ' + blob_id);
			//format the date properly
			var blobdob = blob.dob.toISOString();
			blobdob = blobdob.substrings(0, blobdob.indexOf('T'))
				res.formate({
					//HTML response will render the edit.jade template
					html: function(){
						res.render('blobs/edit', {
							title: 'Blob' + blob._id,
							"blobdob" : blobdob,
							"blob" : blob 
						});
					},
					//JSON response will return JSON output
					json: function(){
					res.json(blob);
					}
				});
		}
	});
});

//PUT to update a blob by ID
router.put('/:id/edit', function(req, res) {
	//Get our REST or form values. These rely on the "name" attributes
	var name = req.body.name;
	var badge = req.body.badge;
	var dob = req.body.dob;
	var company = req.body.company;
	var isloved = req.body.isloved;

	//find the document by ID
	mongoose.model('Blob').findById(req.id, function(err, blob) {
		//update it
		blob.update({
			name : name,
			badge : badge,
			dob : dob,
			islove : isloved 
		}, function(err, blobID) {
			if (err) {
				res.send("There was some form of complex fuck up when attempting to update the database: " + err);
			} else {
				//HTML responds by going back to the page or again you can throw in a sneaky success page
				res.format({
					html: function() {
						res.redirect("/blobs/" + blob._id);
					},
					//JSON responds by showing the updated values
					json: function(){
						res.json(blob);
					}
				});
			}
		})
	});
});


//DELETE a Blob by ID
router.delete('/:id/edit', function(req, res){
	//find blob by ID
	mongoose.model('Blob').findById(req.id, function(err, blob) {
		if (err) {
			return console.error(err);
		} else {
			//remove it from the DB
			blob.remove(function(err, blob) {
				if (err) {
					return concole.error(err);
				} else {
					//return success message
					console.log('Deleting dat shit with an id of: ' + blob._id);
					res.format({
						//HTML goes back to the main page or can do a success page
						html: function(){
							res.redirect("/blobs");
						},
						//JSON return the item with message
						json: function(){
							res.json({
								message : 'deleted',
								item : blob
							});
						}
					});
				}
			});
		}
	});

});

module.exports = router;
