import L from "leaflet";

export function initMapWithLayerControl(
  mapElement,
  center,
  zoom,
  markers = []
) {
  const map = L.map(mapElement).setView(center, zoom);

  const baseMaps = {
    "Street Map": L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    ),
    Topographic: L.tileLayer(
      "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      {
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
        maxZoom: 17,
      }
    ),
    Watercolor: L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg",
      {
        attribution:
          'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 1,
        maxZoom: 16,
      }
    ),
    "Dark Mode": L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ),
  };

  const overlayMaps = {};

  if (markers.length > 0) {
    const storyMarkers = L.layerGroup();

    markers.forEach((marker) => {
      marker.addTo(storyMarkers);
    });

    overlayMaps["Story Locations"] = storyMarkers;

    storyMarkers.addTo(map);
  }

  baseMaps["Street Map"].addTo(map);

  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: true,
    })
    .addTo(map);

  L.control
    .scale({
      imperial: false,
    })
    .addTo(map);

  return map;
}

export function createStoryMarker(story, isDetailPage = false) {
  const marker = L.marker([story.lat, story.lon]);

  const popupContent = `
    <div class="map-popup">
      <h3>${story.name}</h3>
      <p>${story.description.substring(0, 100)}${
    story.description.length > 100 ? "..." : ""
  }</p>
      ${
        !isDetailPage
          ? `<a href="#/detail/${story.id}" class="popup-link">Lihat Detail</a>`
          : ""
      }
    </div>
  `;

  marker.bindPopup(popupContent);

  return marker;
}
