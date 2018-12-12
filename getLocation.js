const request = require("request");
const apiKey = "AIzaSyCOoN_rcCdVRxcVwgGMkrjyg1N5Co1BBP8";
const fs = require("fs");
let miniMapUrl;
const getBallooonCoords = request.get(
  "https://api.aprs.fi/api/get?name=aggie-2&what=loc&apikey=118189.tA9HQbULuIDRghEx&format=json",
  function(error, res, body) {
    let data = JSON.parse(body);
    let lat = data.entries[0].lat;
    let lng = data.entries[0].lng;
    let coords = `${lat},${lng}`;
    miniMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coords}&zoom=13&size=600x300&maptype=roadmap&markers=color:blue|${coords}&key=${apiKey}`;
    request(miniMapUrl).pipe(fs.createWriteStream("minimap.jpg"));
  }
);
