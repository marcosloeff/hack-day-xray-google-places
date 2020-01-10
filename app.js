const http = require('http');
const axios = require('axios');

const express = require('express');

const app = express();


app.use('/', (req, res, next) => {
	console.log('New request!');
	let { lat, lng, type, radius, key, pagetoken } = req.query;
	if (lat) {
		// if (!key) {
		// 	key  = 'AIzaSyCARa0RvtRVxpc2YU3b2G8Uh0XC9bDHcxM';
		// }
		//res.status(200).json({ lat: lat });
		let url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat + ',' + lng + '&radius=' + radius 
		+ '&type=' + type + '&key=' + key;
		if (pagetoken) {
			url = url + '&pagetoken=' + pagetoken;
		}
		axios.get(url)
			.then(response => {
				res.status(200).json(response.data);
				next();
			})
			.catch(error => {
				res.status(500).json(error);
				next();
			});
		
	} else {
		res.status(200).json({});
		next();
	}
	
});

const server = http.createServer(app);
var port = process.env.PORT || 3000;
server.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});
