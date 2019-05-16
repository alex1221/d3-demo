let data = {
  "nodes": [
    { "name": "start" },
    { "name": "bt" },
    { "name": "pb" },
    //{ "name": "end" },
    { "name": "pg" },
    { "name": "sd" },
    { "name": "s" }
  ],
//   "links": [{"source":"bt","target":"pb","value":129689},
//             {"source":"bt","target":"end","value":128495},
//             {"source":"bt","target":"s","value":67366},
//             {"source":"bt","target":"pg","value":58121},
//             {"source":"s","target":"bt","value":111715},
//             {"source":"pb","target":"end","value":157660},
//             {"source":"pb","target":"bt","value":157660},
//             {"source":"s","target":"end","value":53594,},
//             {"source":"s","target":"sd","value":53594},
//             {"source":"pg","target":"end","value":53594},
//             {"source":"pg","target":"bt","value":53594}]
  
  "links": [{"source":"s","target":"s","value":16879,"id":"start_search_0","control":true},{"source":"sd","target":"s","value":22305,"id":"suggestionDetails_search_0","control":true},{"source":"bt","target":"s","value":22305,"id":"browseTitles_search_0","control":true},{"source":"pb","target":"s","value":16879,"id":"playback_search_0","control":true},{"source":"s","target":"sd","value":6690,"id":"start_suggestionDetails_0","control":true},{"source":"pb","target":"bt","value":19207,"id":"playback_browseTitles_0","control":true},{"source":"s","target":"bt","value":16393,"id":"search_browseTitles_0","control":true},{"source":"start","target":"bt","value":19207,"id":"start_browseTitles_0","control":true},{"source":"pg","target":"bt","value":12442,"id":"profilesGate_browseTitles_0","control":true},{"source":"start","target":"pb","value":3107,"id":"start_playback_0","control":true},{"source":"bt","target":"pb","value":3107,"id":"browseTitles_playback_0","control":true},{"source":"bt","target":"pg","value":401,"id":"browseTitles_profilesGate_0","control":true}]
};

var margin = { top: 30, right: 30, bottom: 30, left: 30};
    var width = 800;
    var height = 600;

    var sankey = d3.sankeyCircular()
      .nodeWidth(10)
      .nodePaddingRatio(0.7)
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

		let arrows = pathArrows()
    	.arrowLength(10)
  		.gapLength(150)
    	.arrowHeadSize(4)
    	.path(function(link){ return link.path })

		 var arrowsG = linkG.data(sankeyLinks)
      .enter()
      .append("g")
      .attr("class", "g-arrow")
      .call(arrows)

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
