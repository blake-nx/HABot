const config = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();
const request = require("request");
const fs = require("fs");
let miniMapUrl;
client.on("ready", () => {
  client
    .generateInvite([
      "SEND_MESSAGES",
      "READ_MESSAGES",
      "EMBED_LINKS",
      "ATTACH_FILES"
    ])
    .then(link => {
      console.log(link);
    });
  console.log(
    `HABOT firing up with ${client.users.size} users, in ${
      client.channels.size
    } channels of ${client.guilds.size} guilds.`
  );
  client.user.setActivity("Balloons", { type: "Watching" });
});
client.on("message", message => {
  if (message.author.bot) return;
  if (message.content.indexOf(config.prefix) !== 0) return;
  const args = message.content
    .slice(config.prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift();
  if (command === "call") {
    let callsign = args.join("").toLowerCase();
    console.log(callsign);
    const getBallooonCoords = request.get(
      `https://api.aprs.fi/api/get?name=${callsign}&what=loc&apikey=${
        config.aprs_token
      }&format=json`,
      function(error, res, body) {
        let data = JSON.parse(body);
        if (data.found === 0) {
          message.channel.send(
            "Sorry, I couldn't find that. Please check the call sign and try again."
          );
          return;
        } else {
          let lat = data.entries[0].lat;
          let lng = data.entries[0].lng;
          let altitude = data.entries[0].altitude;
          let coords = `${lat},${lng}`;
          let timeUpdated = new Date(data.entries[0].time * 1000);
          let dateOptions = {
            weekday: "short",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            timeZone: config.timezone
          };
          miniMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coords}&zoom=13&size=600x300&maptype=roadmap&markers=color:blue|${coords}&key=${
            config.gmaps_token
          }`;
          request(miniMapUrl).pipe(fs.createWriteStream("minimap.jpg"));
          let locationEmbed = new Discord.RichEmbed()
            .setColor("#500000")
            .setAuthor("HABOT")
            .addField("Coordinates", coords)
            .addField(
              "Altitude",
              `${altitude}m (${Math.round(altitude * 3.28084)}ft)`
            )
            .addField("Time", timeUpdated.toLocaleString("en-US", dateOptions))
            .addField(
              "Directions",
              `https://www.google.com/maps/search/?api=1&query=${coords}`
            )
            .setImage(miniMapUrl)
            .setTimestamp();
          message.channel.send({ embed: locationEmbed });
          return;
        }
      }
    );
  }
  return;
});
client.login(config.token);
