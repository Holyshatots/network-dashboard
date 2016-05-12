var Hosts = new Meteor.Collection('Hosts');

Template.barChart.events({
});

Template.barChart.helpers({
  hosts: function() {
    return Hosts.find();
  }
})

Template.barChart.rendered = function() {
  var width = 900;
  var height = 250;

  var xScale = d3.scale.ordinal().rangeRoundBands([0, width], 0.05);
  var yScale = d3.scale.linear().range([0, height]);

  // Define key function, to be used when binding data
  var key = function(d) {
    return d._id;
  };

  Deps.autorun(function(){
    var hosts = Hosts.find({}).fetch();

    for(var i=0; i<hosts.length;i++) {
      var hostObj = hosts[i];
      // Create SVG element
      var svg = d3.select(".barChart[host='" + hostObj.host + "']").attr("width", width)
                                      .attr("height", height);

      var modifier = {fields:{value:1}};
      //console.log(svg);

      // Get the data
      var dataset = hostObj.pings;
      console.log(dataset);

      // Update scale domains
      xScale.domain(d3.range(dataset.length));
      yScale.domain([0, d3.max(dataset, function(d) {return d.value;})]);

      // Select
      var bars = svg.selectAll("rect")
                    .data(dataset, key);
      //console.log(bars);

      // Enter
      bars.enter()
        .append("rect")
        .attr("x", width)
        .attr("y", function(d) {
            return height - yScale(d.value);
        })
        .attr("width", xScale.rangeBand())
        .attr("height", function(d) {
          return yScale(d.value);
        })
        .attr("fill", function(d) {
          return "rgb(0, 0, " + (d.value * 10) + ")";
        })
        .attr("data-id", function(d){
          return d._id;
        });

      // Update
      bars.transition()
        .duration(500)
        .attr("x", function(d, i)  {
          return xScale(i);
        })
        .attr("y", function(d) {
          return height - yScale(d.value);
        })
        .attr("width", xScale.rangeBand())
        .attr("height", function(d) {
          return yScale(d.value);
        })
        .attr("fill", function(d) {
          return "rgb(0, 0, " + (d.value * 10) + ")";
        });

      // Exit
      bars.exit()
        .transition()
        .duration(500)
        .attr("x",-xScale.rangeBand())
        .remove();

      // Select
      var labels = svg.selectAll("text")
                    .data(dataset, key);

      // Enter
      labels.enter()
            .append("text")
            .text(function (d) {
              return d.value;
            })
            .attr("text-anchor", "middle")
            .attr("x", width)
            .attr("y", function(d) {
              return height - yScale(d.value) + 14;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "white");

      // Update
      labels.transition()
        .duration(500)
        .attr("x", function(d, i) {
          return xScale(i) + xScale.rangeBand() / 2;
        }).attr("y", function(d) {
          return height - yScale(d.value) + 14;
        }).text(function(d) {
          return d.value;
        });

      // Exit
      labels.exit()
            .transition()
            .duration(500)
            .attr("x", -xScale.rangeBand())
            .remove();
    }
  });
};
