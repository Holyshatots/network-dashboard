import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  var Hosts = new Meteor.Collection('Hosts');

  // Refresh all of the information
  Hosts.remove({});

  // Configuration
  var timeout = 3 * 1000;
  var maxSize = 30;
  var initialHosts = [
      'canyonsdistrict.org',
      '192.168.1.1',
      'google.com',
      'facebook.com',
      'reddit.com',
      'imgur.com'
      ];

  // Add in all of the hosts
  for(var i=0; i<initialHosts.length; i++) {
    Hosts.insert({
      host:initialHosts[i],
      pings:[]
    });
  }

  // Start an interval to ping the servers
  var myInterval = Meteor.setInterval(function() {
    // Find the next highest position
    var hosts = Hosts.find({}).fetch();
    for(var i=0; i<hosts.length; i++) {
      // Get the current host
      var hostObj = hosts[i];

      // Do the actual ping
      var res = Ping.host(hostObj.host);

      // Add the new ping result and limit to the max size
      Hosts.update({host:hostObj.host},
        {$push:
          {pings:
            {
              $each: [{
                value:res.latency,
                status:res.status,
                online:res.online,
                _id: Random.id()
              }],
              $slice: -maxSize
            }
          },
        }
      );

      Hosts.update({host:hostObj.host},
        {
          $set:
          {
            status:hostObj.pings[hostObj.pings.length - 1].status
          }
        }
      );
    }

  }, timeout);
});
