mapboxgl.accessToken = 'pk.eyJ1IjoiZW56b2RlZzQwIiwiYSI6ImNrNXFtZWtxMTAzcjkzbG11eXU5cGpoOGgifQ.TF0f4dSYvzXAeMVFABoZ3g';
const map = new mapboxgl.Map({
  container: 'map',
  //style: 'mapbox://styles/enzodeg40/clk4gin0g00h701qy18qlhatw/draft',
  style: 'mapbox://styles/enzodeg40/clk4gin0g00h701qy18qlhatw',
  center: [2.598709210020017, 48.56438515629094], // starting position [lng, lat]
  zoom: 13, // starting zoom
});

const marker = new mapboxgl.Marker()
  .setLngLat([2.598709210020017, 48.56438515629094])
  .addTo(map);

const rightMarker = new mapboxgl.Marker({
  color: "#26AE00",
})
  .setLngLat([0, 0])
  .addTo(map);

class Game {
  constructor() {
    // Game variables
    this.score = 0;
    this.round = 0;
    this.maxImage = data.length;

    // Round variables
    this.image = null;
    this.userLat = 48.56438515629094;
    this.userLng = 2.598709210020017;
    this.lat = null;
    this.lng = null;
    this.roundEnd = false;
    this.distance = null;
  }

  resetMap() {    
    if (map.getLayer('line' + this.round)) {
      map.removeLayer('line' + this.round);
    }

    if (map.getLayer('line' + (this.round-1))) {
      map.removeLayer('line' + (this.round-1));
    }

    if (map.getSource('line-source')) {
      map.removeSource('line-source');
    }

    marker.setLngLat([2.598709210020017, 48.56438515629094]);
    rightMarker.setLngLat([0, 0]);
  }

  newRound() {
    this.round++;
    this.roundEnd = false;
    this.distance = null;
    this.image = Math.floor(Math.random() * this.maxImage) + 1;

    pannellum.viewer('panorama', {
      "type": "equirectangular",
      "panorama": "assets/360/" + this.image + ".jpg",
      "autoLoad": true
    });

    this.lat = data[this.image - 1].gps.split(", ")[0];
    this.lng = data[this.image - 1].gps.split(", ")[1];

    this.resetMap();
    this.updateUI();
  }


  getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  updateUI() {
    scoreDOM.innerHTML = `Score : ${this.score}`;
    mancheDOM.innerHTML = `Manche : ${this.round} / 5`;

    if (this.roundEnd) {
      valideDOM.style.display = "none";
      nextDOM.style.display = "";
      topPanelDOM.style.display = "";
      distanceDOM.innerHTML = `Distance : ${Math.round(this.getDistanceFromLatLonInKm(this.lat, this.lng, this.userLat, this.userLng) * 1000)} m`;
      console.log("roundEnd");
    }
    else {
      valideDOM.style.display = "";
      nextDOM.style.display = "none";
      topPanelDOM.style.display = "none";
      distanceDOM.innerHTML = `Distance : nullkm`;
      console.log("roundNotEnd");
    }
  }

  addLine() {
    if (map.getLayer('line' + this.round)) {
      map.removeLayer('line' + this.round);
    }

    if (map.getLayer('line' + (this.round-1))) {
      map.removeLayer('line' + (this.round-1));
    }

    if (map.getSource('line-source')) {
      map.removeSource('line-source');
    }
    
    rightMarker.setLngLat([this.lng, this.lat]);

    let lineCoordinates = [
      [this.lng, this.lat],
      [this.userLng, this.userLat]
    ];

    map.addLayer({
      id: 'line' + this.round,
      type: 'line',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: lineCoordinates
          }
        }
      },
      paint: {
        'line-color': '#9900ff', // Couleur de la ligne
        'line-width': 2 // Épaisseur de la ligne
      }
    });
  }

  checkAnswer() {
    if (this.roundEnd) {
      return;
    }

    const distance = this.getDistanceFromLatLonInKm(this.lat, this.lng, this.userLat, this.userLng);
    let score;

    const tolerance = 0.005;  // 5 mètres
    const maxScore = 5000;
    const maxDistance = 3;  // 3 km

    if (distance <= tolerance) {
      score = maxScore;
    }
    else if (distance <= maxDistance) {
      const ratio = 1 - (distance / maxDistance);
      score = Math.round(maxScore * ratio);
    }
    else {
      score = 0;
    }

    console.log("Distance : " + distance + " km");
    console.log("Score : " + score);
    
    this.score += score;
    this.roundEnd = true;
    
    this.addLine();
    this.updateUI();
  }

}

map.on('click', function (e) {
  if (game.roundEnd) {
    return;
  }
  marker.setLngLat(e.lngLat);
  game.userLat = e.lngLat.lat;
  game.userLng = e.lngLat.lng;
});

const topPanelDOM = document.getElementById("topPanel");
const distanceDOM = document.getElementById("distance");
const scoreDOM = document.getElementById("score");
const mancheDOM = document.getElementById("manche");
const valideDOM = document.getElementById("valide");
const nextDOM = document.getElementById("next");

valideDOM.addEventListener("click", function () {
  game.checkAnswer();
});

nextDOM.addEventListener("click", function () {
  game.newRound();
});

const game = new Game();
game.newRound();

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}
