const http = require('http');
const axios = require('axios');

const express = require('express');

const app = express();


app.use('/', (req, res, next) => {
	console.log('New request!');
	let { lat, lng, type, radius, key } = req.query;
	if (lat) {
		// if (!key) {
		// 	key  = 'AIzaSyCARa0RvtRVxpc2YU3b2G8Uh0XC9bDHcxM';
		// }
		//res.status(200).json({ lat: lat });
		const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat + ',' + lng + '&radius=' + radius 
		+ '&type=' + type + '&key=' + key;
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
//server.listen(3000);
server.listen(443);
