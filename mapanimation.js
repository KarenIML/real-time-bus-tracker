var map;
var markers = [];

// load map
function init() {
  mapboxgl.accessToken = "YOUR-ACCESS-TOKEN";

  var element = document.getElementById("map");
  map = new mapboxgl.Map({
    container: element,
    style: "mapbox://styles/mapbox/satellite-streets-v11",
    center: [-71.104081, 42.365554],
    zoom: 14,
  });
  addMarkers();
}

// Add bus markers to map
async function addMarkers() {
  // get bus data
  var locations = await getBusLocations();

  // loop through data, add bus markers
  locations.forEach(function (bus) {
    var resultMarker = getMarker(bus.id);
    if (resultMarker) {
      moveMarker(resultMarker.marker, bus);
    } else {
      addMarker(bus);
    }
  });

  // timer
  console.log(new Date());
  setTimeout(addMarkers, 900);
}

// Request bus data from MBTA
async function getBusLocations() {
  var url =
    "https://api-v3.mbta.com/vehicles?api_key=ca34f7b7ac8a445287cab52fb451030a&filter[route]=1&include=trip";
  var response = await fetch(url);
  var json = await response.json();
  return json.data;
}

function addMarker(bus) {
  var icon = getIcon(bus);
  const el = document.createElement("div");
  el.className = icon;
  var marker = new mapboxgl.Marker({ element: el })
    .setLngLat([bus.attributes.longitude, bus.attributes.latitude])
    .setPopup(
      new mapboxgl.Popup().setHTML(
        `<div><strong>${bus.id}</strong><br>
        <i>Ocuppancy: </i>${
          bus.attributes.occupancy_status
            ? bus.attributes.occupancy_status.replace(/_/g, " ")
            : "NO AVAILABLE"
        }<br>
        <i>Status: </i>${bus.attributes.current_status.replace(
          /_/g,
          " "
        )}<br></div>`
      )
    )
    .addTo(map);
  console.log(marker);
  markers.push({
    id: bus.id,
    marker,
  });
}

function getIcon(bus) {
  // select icon based on bus direction
  if (bus.attributes.direction_id === 0) {
    return "marker-red";
  }
  return "marker-blue";
}

function moveMarker(marker, bus) {
  // change icon if bus has changed direction
  var icon = getIcon(bus);
  let element = marker.getElement();
  element.className = icon;

  // move icon to new lat/lon
  marker.setLngLat([bus.attributes.longitude, bus.attributes.latitude]);
}

function getMarker(id) {
  var markerElement = markers.find(function (item) {
    return item.id === id;
  });
  return markerElement;
}

window.onload = init;
