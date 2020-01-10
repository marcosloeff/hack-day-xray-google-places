const http = require('http');
const axios = require('axios');
var fs = require('fs');
var path = require('path');
var xmlReader = require('read-xml');
const express = require('express');
var convert = require('xml-js');
const csv = require('csv-parser');

const app = express();


app.use('/', (req, res, next) => {
	console.log('New request!');
	let { lat, lng, type, radius, key, pagetoken, kml, unit_id } = req.query;
	if (unit_id) {
		let unit_found = false;
		fs.createReadStream('valuation_and_view.csv')
			.pipe(csv())
			.on('data', (row) => {
				if (row.unit_id === unit_id && row.living_room_view_score.length > 0){
					const value = row.living_room_view_score.substr(0,1);
					res.status(200).json({value: value, description: row.living_room_view_score});
					unit_found = true;
					next();
				}
			})
			.on('end', () => {
				console.log('CSV file successfully processed');
				if (unit_found == false) {
					res.status(200).json({});
					next();
				}
			});
	}
	else if (kml && lat) {
		xmlReader.readXML(fs.readFileSync('mapa_ruido.kml'), function (err, data) {
			if (err) {
				console.error(err);
			}

			var xml = data.content;
			var result = JSON.parse(convert.xml2json(xml, { compact: true, spaces: 4 }));

			let response = {
				latitude: 0,
				longitude: 0,
				noise: 0,
			}
			let minDistance = 1000000;
			// If your KML file is different than the one I provided just change 
			// result.kml.Document.Placemark['gx:Track']['gx:coord'].
			// As you can see it is similar with the KML file provided.
			for (var i = 0; i < result.kml.Document.Placemark.length; i++) {
				var placemark = result.kml.Document.Placemark[i];
				if (placemark && placemark.Polygon && placemark.Polygon.outerBoundaryIs) {
					var coordinates = placemark.Polygon.outerBoundaryIs.LinearRing.coordinates;
					var cordValues = coordinates._text.split('\n');
					if (cordValues && cordValues.length > 0) {
						for (var j = 0; j < cordValues.length; j++) {
							var values = cordValues[j].split(',');
							if (values && values.length > 1) {
								var currentResponse = {
									latitude: parseFloat(values[1].trim()),
									longitude: parseFloat(values[0].trim()),
									noise: parseFloat(values[2].trim()),
								}
								currentDistance = (lat - currentResponse.latitude) * (lat - currentResponse.latitude) + (lng - currentResponse.longitude) * (lng - currentResponse.longitude);
								if (currentDistance < minDistance) {
									minDistance = currentDistance;
									response = {
										...currentResponse,
										distance: minDistance
									};
								}
							}
						}
					}
				}
			}
			res.status(200).json(response);
			next();
		});

	}
	else if (lat) {
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
server.listen(port, function () {
	console.log('Our app is running on http://localhost:' + port);
});
