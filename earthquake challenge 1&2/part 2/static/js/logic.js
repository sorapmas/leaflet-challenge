// Define tile layers
let osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let satelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 30,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>'
});

let outdoorLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '&copy; <a href="https://www.opentopomap.org/copyright">OpenTopoMap</a> contributors'
});



// Create a base layer group with all base maps
let baseLayers = {
    "OpenStreetMap": osmLayer,
    "Satellite": satelliteLayer,
    "Outdoor": outdoorLayer,
    
};

// Initialize the map with osmLayer
let myMap = L.map("map", {
    center: [37.0902, -95.7129],
    zoom: 4,
    layers: [osmLayer] // Set the default base map
});
// Create separate layer groups for earthquake and tectonic data
let earthquakeLayer = L.layerGroup().addTo(myMap);
let tectonicLayer = L.layerGroup().addTo(myMap);

// Define the URL for earthquake data
let earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

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
let legend = L.control({ position: 'bottomright' });
// Define the legend and create a new HTML <div>
legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    let grades = [-10, 10, 30, 50, 70, 90];
    // Create labels with colors
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
d3.json(earthquakeUrl).then(function (response) {
    console.log(response)
    response.features.forEach(function (quake) {

        let magnitude = quake.properties.mag;
        let coordinates = quake.geometry.coordinates;
        let depth = quake.geometry.coordinates[2];
        let place = quake.properties.place;
        let time = quake.properties.time;
        date = new Date(time);

        // Create circle marker
        let marker = L.circleMarker([coordinates[1], coordinates[0]], {
            radius: magnitude *3,
            fillColor: getColor(depth), 
            color: 'gray',
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.8
        });

        // Create the popup  with information
        let popup = `<strong>Magnitude:</strong> ${magnitude}<br><strong>Place:</strong> ${place}<br><strong>Depth:</strong> ${depth} km<br><strong>Time:</strong> ${date}`;

        // Add the popup 
        marker.bindPopup(popup).addTo(earthquakeLayer);
    });

    
});
// Define the URL for tectonic plates data
let tectonicUrl = "static/tectonic.json";

// Load tectonic plates data and add it to the tectonicLayer
d3.json(tectonicUrl).then(function (tectonicData) {
    console.log(tectonicData)
    L.geoJSON(tectonicData, {
        style: function (feature) {
            return {
                color: "red", 
                weight: 2,     
            };
        },
    }).addTo(tectonicLayer);
});

// Create a control layer
let overlays = {
    "Earthquakes Data": earthquakeLayer,
    "Tectonic Plates": tectonicLayer
};

// Add control layers for base layers and overlays
L.control.layers(baseLayers, overlays, { collapsed: false }).addTo(myMap);