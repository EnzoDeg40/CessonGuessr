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

class Game {
  constructor() {
    // Game variables
    this.score = 0;
    this.round = 0;
    this.maxImage = data.length;

    // Round variables
    this.image = null;
    this.userLat = null;
    this.userLng = null;
    this.lat = null;
    this.lng = null;
    this.roundEnd = false;
  }

  newRound() {
    this.round++;
    this.roundEnd = false;
    this.image = Math.floor(Math.random() * this.maxImage) + 1;

    pannellum.viewer('panorama', {
      "type": "equirectangular",
      "panorama": "assets/360/" + this.image + ".jpg",
      "autoLoad": true
    });

    this.lat = data[this.image - 1].gps.split(", ")[0];
    this.lng = data[this.image - 1].gps.split(", ")[1];

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
      nextDOM.style.display = "block";
      console.log("roundEnd");
    }
    else {
      valideDOM.style.display = "block";
      nextDOM.style.display = "none";
      console.log("roundNotEnd");
    }
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

    this.updateUI();
  }

}

map.on('click', function (e) {
  marker.setLngLat(e.lngLat);
  game.userLat = e.lngLat.lat;
  game.userLng = e.lngLat.lng;
});

const valideDOM = document.getElementById("valide");
const nextDOM = document.getElementById("next");
const scoreDOM = document.getElementById("score");
const mancheDOM = document.getElementById("manche");

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
