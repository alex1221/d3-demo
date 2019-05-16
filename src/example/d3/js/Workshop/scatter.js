if(!d3.chart) d3.chart = {};

d3.chart.scatter = function() {
  var g;
  var data;
  var width = 400;
  var height = 400;
  var cx = 10;
  var numberBins = 5;
  var dispatch = d3.dispatch(chart, "hover");

  function chart(container) {
    g = container;

    g.append("g")
    .classed("xaxis", true)

    g.append("g")
    .classed("yaxis", true)

    update();
  }
  chart.update = update;
  function update() {
    var maxCreated = d3.max(data, function(d) { return d.data.created });
    var minCreated = d3.min(data, function(d) { return d.data.created });
    var maxScore = d3.max(data, function(d) { return d.data.score })

    var colorScale = d3.scale.category20();
    var createdScale = d3.time.scale()
        .domain([minCreated, maxCreated])
        .range([cx, width])

    var commentScale = d3.scale.linear()
    .domain(d3.extent(data, function(d) { return d.data.num_comments }))
    .range([3, 15])

    var yScale = d3.scale.linear()
      .domain([0, maxScore])
      .range([height, cx])
  
     var xAxis = d3.svg.axis()
    .scale(createdScale)
    .ticks(3)
    .tickFormat(d3.time.format("%x %H:%M"))

    var yAxis = d3.svg.axis()
    .scale(yScale)
    .ticks(3)
    .orient("left")

    var xg = g.select(".xaxis")
      .classed("axis", true)
      .attr("transform", "translate(" + [0,height] + ")")
      .transition()
      .call(xAxis)

    var yg = g.select(".yaxis")
      .classed("axis", true)
      .classed("yaxis", true)
      .attr("transform", "translate(" + [cx - 5,0] + ")")
      .transition()
      .call(yAxis)

    var circles = g.selectAll("circle")
    .data(data, function(d) { return d.data.id })

    circles.enter()
    .append("circle")

    circles
    .transition()
    .attr({
      cx: function(d,i) { return createdScale(d.data.created) },
      cy: function(d,i) { return yScale(d.data.score) },
      r: function(d) { return commentScale(d.data.num_comments)}
    })

    circles.exit().remove()

    circles.on("mouseover", function(d) {
      d3.select(this).style("stroke", "black")
      dispatch.hover([d])
    })
    circles.on("mouseout", function(d) {
      d3.select(this).style("stroke", "")
      dispatch.hover([])
    })

    var hist = d3.layout.histogram()
    .value(function(d) { return d.data.score })
    .range([0, d3.max(data, function(d){ return d.data.score }) ])
    .bins(numberBins);
    var layout = hist(data);

    for(var i = 0; i < layout.length; i++) {
      var bin = layout[i];
      g.selectAll("circle")
      .data(bin, function(d) { return d.data.id })
      .style("fill", function() {  return colorScale(i) })
    }

  }

  chart.highlight = function(data) {
    var circles = g.selectAll("circle")
    .style("stroke", "")

    circles.data(data, function(d) { return d.data.id })
    .style("stroke", "orange")
    .style("stroke-width", 3)
  }

  chart.data = function(value) {
    if(!arguments.length) return data;
    data = value;
    return chart;
  }
  chart.width = function(value) {
    if(!arguments.length) return width;
    width = value;
    return chart;
  }
  chart.height = function(value) {
    if(!arguments.length) return height;
    height = value;
    return chart;
  }

  return d3.rebind(chart, dispatch, "on");
}