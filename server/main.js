import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  var Hosts = new Meteor.Collection('Hosts');

  // Refresh all of the information
  Hosts.remove({});

  // Read in the initial hosts from /public/data/initial.txt
  var fs = Npm.require('fs');
  var initialHosts = fs.readFileSync(process.cwd() + '/../web.browser/app/data/initial.txt', 'utf8').toString().split("\n");

  // Remove any blank lines
  for(var i=0; i<initialHosts.length; i++) {
    if(initialHosts[i].trim() === '') {
      initialHosts.splice(i, 1);
    }
  }

  // Configuration
  var timeout = 3 * 1000;
  var maxSize = 30;

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
