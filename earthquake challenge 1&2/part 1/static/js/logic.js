// Initialize the map
let myMap = L.map("map", {
    center: [37.0902, -95.7129],
    zoom: 5
});

// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Define the URL for earthquake data
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Define a function for color based on depth
function getColor(depth) {
    if (depth <= 10) {
        return 'yellow'; 
    } else if (depth <= 30) {
        return 'green'; 
    } else if (depth <= 50) {
        return 'orange'; 
    } else if (depth <= 70) {
        return 'red'; 
    } else if (depth <= 90) {
        return 'darkred'; 
    } else {
        return 'black'; 
    }
}

// Create the legend
var legend = L.control({ position: 'bottomright' });
// Define the legend and create a new HTML <div>
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    var grades = [-10, 10, 30, 50, 70, 90];// Create labels with colors
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i class="legend-color" style="background-color:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};
// Add the legend to the map
legend.addTo(myMap);

// Use D3.js to load earthquake data and create markers
d3.json(url).then(function (response) {
    response.features.forEach(function (quake) {
        let magnitude = quake.properties.mag;
        let coordinates = quake.geometry.coordinates;
        let place = quake.properties.place;
        let depth = quake.geometry.coordinates[2];
        let time = quake.properties.time; 
        date = new Date(time);
        // Create a circle marker
        let marker = L.circleMarker([coordinates[1], coordinates[0]], {
            radius: magnitude * 3,
            fillColor: getColor(depth),
            color: 'gray',
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.35
        });

        // Create the popup  with information
       let popup = `<strong>Magnitude:</strong> ${magnitude}<br><strong>Place:</strong> ${place}<br><strong>Depth:</strong> ${depth} km<br><strong>Time:</strong> ${date}`;

       // Add the popup
       marker.bindPopup(popup).addTo(myMap);
   
});
});