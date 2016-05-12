var Bars = new Meteor.Collection(null);
Session.setDefault('barChartSort', 'none');
Session.setDefault('barChartSortModifer', undefined);

if(Bars.find({}).count() === 0) {
  for( i = 0; i < 10; i++) {
    Bars.insert({
      value:Math.floor(Math.random() * 25)
    });
  }
}

Template.barChart.events({
  'click #add':function() {
    var highest = Bars.findOne({}, {sort:{position:1}});
    if(highest) {
      var highestPos = highest.position;
    } else {
      var highestPos = 1;
    }
    Bars.insert({
      value:Math.floor(Math.random() * 25),
      position: highestPos
    });
  }
});

Template.barChart.rendered = function() {
  var width = 600;
  var height = 250;

  var xScale = d3.scale.ordinal().rangeRoundBands([0, width], 0.05);
  var yScale = d3.scale.linear().range([0, height]);

  // Define key function, to be used when binding data
  var key = function(d) {
    return d._id;
  };

  // Create SVG element
  var svg = d3.select("#barChart").attr("width", width)
                                  .attr("height", height);

  Deps.autorun(function(){
    var modifier = {fields:{value:1}};

    // Keep a maximum number of columns visible at one time
    var maxVisible = 10;
    if(Bars.find({}).count() > maxVisible) {
      var toRemove = Bars.findOne({}, {sort:{position:1}});
      Bars.remove({_id:toRemove._id});
    }

    var dataset = Bars.find({}, modifier).fetch();

    // Update scale domains
    xScale.domain(d3.range(dataset.length));
    yScale.domain([0, d3.max(dataset, function(d) {return d.value;})]);

    // Select
    var bars = svg.selectAll("rect")
                  .data(dataset, key);

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

    // Update all labels

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
  });
};
