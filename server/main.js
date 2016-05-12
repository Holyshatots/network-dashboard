import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  var ip = 'google.com';
  var Pings = new Meteor.Collection('Pings');
  var myInterval = Meteor.setInterval(function() {
    var res = Ping.host(ip);

    // Find the next highest position
    var highest = Pings.findOne({}, {sort:{position:1}});
    if(highest) {
      var highestPos = highest.position;
    } else {
      var highestPos = 1;
    }

    // Add a new random value
    Pings.insert({
      value:res.latency,
      status:res.status,
      online:res.online,
      position:highestPos
    });
  }, 1000);
});
