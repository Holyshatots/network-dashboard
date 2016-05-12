import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  var Hosts = new Meteor.Collection('Hosts');
  Hosts.remove({});

  var ip = 'canyonsdistrict.org';
  var timeout = 3 * 1000;
  var maxSize = 10;

  Hosts.insert({
    host:ip,
    pings:[]
  });

  Hosts.insert({
    host:'192.168.1.1',
    pings:[]
  })

  var myInterval = Meteor.setInterval(function() {
    // Find the next highest position
    var hosts = Hosts.find({}).fetch();
    for(var i=0; i<hosts.length; i++) {
      // Get the current host
      var hostObj = hosts[i];

      // Do the actual ping
      var res = Ping.host(hostObj.host);

      // Add the new ping result
      Hosts.update({host:hostObj.host},
        {$push:
          {pings:
            {
              value:res.latency,
              status:res.status,
              online:res.online
            }
          },

        }
      );

      // Remove the oldest record if necessary
      if(hostObj.pings.length > maxSize) {
        Hosts.update({host:hostObj.host},
          {$pop: {
              pings: -1
            }
          }
        );
      }
    }

  }, timeout);
});
