let data = {
  "nodes": [
    { "name": "startA" },
    { "name": "startB" },
    { "name": "process1" },
    { "name": "process2" },
    { "name": "process3" },
    { "name": "process4" },
    { "name": "process5" },
    { "name": "process6" },
    { "name": "process7" },
    { "name": "process8" },
    { "name": "process9" },
    { "name": "process10" },
    { "name": "process11" },
    { "name": "process12" },
    { "name": "process13" },
    { "name": "process14" },
    { "name": "process15" },
    { "name": "process16" },
    { "name": "finishA" },
    { "name": "finishB" }
  ],
  "links": [
    { "source": "startA", "target": "process8", "value": 20, "optimal": "yes" },
    { "source": "startA", "target": "process5", "value": 20, "optimal": "yes" },
    { "source": "startA", "target": "process6", "value": 20, "optimal": "yes" },
    { "source": "startB", "target": "process1", "value": 15, "optimal": "yes" },
    { "source": "startB", "target": "process5", "value": 15, "optimal": "yes" },
    { "source": "process1", "target": "process4", "value": 30, "optimal": "yes" },
    { "source": "process4", "target": "process1", "value": 10, "optimal": "yes" },
    { "source": "process2", "target": "process7", "value": 35, "optimal": "yes" },
    { "source": "process1", "target": "process3", "value": 20, "optimal": "yes" },
    { "source": "process5", "target": "process1", "value": 20, "optimal": "yes" },
    { "source": "process6", "target": "startA", "value": 5, "optimal": "yes" },
    { "source": "process4", "target": "process2", "value": 5, "optimal": "yes" },
    { "source": "process6", "target": "process8", "value": 15, "optimal": "yes" },
    { "source": "process4", "target": "startB", "value": 5, "optimal": "yes" },
    { "source": "process3", "target": "process2", "value": 15, "optimal": "yes" },
    { "source": "process3", "target": "startB", "value": 5, "optimal": "yes" },
    { "source": "process15", "target": "process13", "value": 10, "optimal": "yes" },
    { "source": "process13", "target": "process9", "value": 10, "optimal": "yes" },
    { "source": "process7", "target": "startB", "value": 20, "optimal": "yes" },
    { "source": "process8", "target": "process1", "value": 10, "optimal": "yes" },
     { "source": "process8", "target": "process16", "value": 10, "optimal": "yes" },
    { "source": "process16", "target": "process9", "value": 10, "optimal": "yes" },
    { "source": "process8", "target": "process11", "value": 25, "optimal": "yes" },
    { "source": "process11", "target": "process10", "value": 20, "optimal": "yes" },
    { "source": "process4", "target": "process12", "value": 10, "optimal": "yes" },
    { "source": "process12", "target": "process11", "value": 10, "optimal": "yes" },
    { "source": "process7", "target": "process15", "value": 15, "optimal": "yes" },
    { "source": "process15", "target": "process14", "value": 10, "optimal": "yes" },
    { "source": "process10", "target": "process13", "value": 10, "optimal": "yes" },
    { "source": "process10", "target": "process16", "value": 10, "optimal": "yes" },
    { "source": "process14", "target": "finishB", "value": 10, "optimal": "yes" },
    { "source": "process9", "target": "finishA", "value": 10, "optimal": "yes" },
    { "source": "process16", "target": "process8", "value": 10, "optimal": "yes" },
    { "source": "process9", "target": "finishB", "value": 10, "optimal": "yes" },
    { "source": "process15", "target": "finishB", "value": 10, "optimal": "yes" },
    { "source": "process15", "target": "finishA", "value": 10, "optimal": "yes" },
    { "source": "process11", "target": "process15", "value": 25, "optimal": "yes" }
  ]
};

var margin = { top: 30, right: 30, bottom: 30, left: 30};
    var width = 1100;
    var height = 600;

    var sankey = d3.sankeyCircular()
      .nodeWidth(10)
      .nodePadding(40) //note that this will be overridden by nodePaddingRatio
      .nodePaddingRatio(0.5)
      .size([width, height])
      .nodeId(function (d) {
        return d.name;
      })
      .nodeAlign(d3.sankeyJustify)
      .iterations(32)
      .circularLinkGap(2);

    var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var linkG = g.append("g")
      .attr("class", "links")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.2)
      .selectAll("path");

    var nodeG = g.append("g")
      .attr("class", "nodes")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .selectAll("g");

    //run the Sankey + circular over the data
    let sankeyData = sankey(data);
    let sankeyNodes = sankeyData.nodes;
    let sankeyLinks = sankeyData.links;
    
    console.log(sankeyLinks);

    let depthExtent = d3.extent(sankeyNodes, function (d) { return d.depth; });

    var nodeColour = d3.scaleSequential(d3.interpolateCool)
    .domain([0,width]);

    var node = nodeG.data(sankeyNodes)
      .enter()
      .append("g");

    node.append("rect")
      .attr("x", function (d) { return d.x0; })
      .attr("y", function (d) { return d.y0; })
      .attr("height", function (d) { return d.y1 - d.y0; })
      .attr("width", function (d) { return d.x1 - d.x0; })
      .style("fill", function (d) { return nodeColour(d.x0); })
      .style("opacity", 0.5)
      .on("mouseover", function (d) {

        let thisName = d.name;

        node.selectAll("rect")
          .style("opacity", function (d) {
            return highlightNodes(d, thisName)
          })

        d3.selectAll(".sankey-link")
          .style("opacity", function (l) {
            return l.source.name == thisName || l.target.name == thisName ? 1 : 0.3;
          })

        node.selectAll("text")
          .style("opacity", function (d) {
            return highlightNodes(d, thisName)
          })
      })
      .on("mouseout", function (d) {
        d3.selectAll("rect").style("opacity", 0.5);
        d3.selectAll(".sankey-link").style("opacity", 0.7);
        d3.selectAll("text").style("opacity", 1);
      })

    node.append("text")
      .attr("x", function (d) { return (d.x0 + d.x1) / 2; })
      .attr("y", function (d) { return d.y0 - 12; })
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function (d) { return d.name; });

    node.append("title")
      .text(function (d) { return d.name + "\n" + (d.value); });

    var link = linkG.data(sankeyLinks)
      .enter()
      .append("g")
    
    link.append("path") 
      .attr("class", "sankey-link")
      .attr("d", function(link){
        return link.path;
      })
      .style("stroke-width", function (d) { return Math.max(1, d.width); })
      .style("opacity", 0.7)
      .style("stroke", function (link, i) {
        return link.circular ? "red" : "black"
      })

    link.append("title")
      .text(function (d) {
        return d.source.name + " → " + d.target.name + "\n Index: " + (d.index);
      });


		 var arrowsG = linkG.data(sankeyLinks)
      .enter()
      .append("g")
      .attr("class", "g-arrow")
      .call(appendArrows, 20, 300, 4)

    function highlightNodes(node, name) {

      let opacity = 0.3

      if (node.name == name) {
        opacity = 1;
      }
      node.sourceLinks.forEach(function (link) {
        if (link.target.name == name) {
          opacity = 1;
        };
      })
      node.targetLinks.forEach(function (link) {
        if (link.source.name == name) {
          opacity = 1;
        };
      })

      return opacity;

    }
