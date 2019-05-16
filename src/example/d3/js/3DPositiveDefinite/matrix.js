d3.layout.matrix = matrixLayout;
d3.svg.matrix = matrixComponent;
function matrixComponent() {
  var g;
  var data = [[]];
  var mapping = [[]];
  var nodes = [];
  var layout = d3.layout.matrix();
  var margin = layout.margin();
  var cellWidth = layout.cellWidth();
  var cellHeight = layout.cellHeight();
  /*
  TODO
    make scrubbing configurable, per-cell
  */
  var dispatch = d3.dispatch("change")

  this.update = function(group) {
    if(group) g = group;
    nodes = layout.nodes(data);

    var line = d3.svg.line()
    .x(function(d) { return d[0] })
    .y(function(d) { return d[1] })

    var brackets = g.selectAll("path.bracket")
    .data([1, -1])
    brackets.enter().append("path").classed("bracket", true)
    .attr("d", function(d) {
      var nRows = data.length;
      var x0 = d * cellWidth/4;
      var x1 = -margin[0]/2;
      var y0 = -margin[1]/2;
      var y1 = (cellHeight + margin[1]) * nRows - margin[1]/2
      if(d === 1) {
        return line([
          [x0, y0],
          [x1, y0], 
          [x1, y1], 
          [x0, y1]
        ])
      } else {
        var dx = (cellWidth + margin[0]) * data[0].length - margin[0]/2
        x0 -= margin[0]/2
        return line([
          [x0 + dx, y0],
          [dx, y0], 
          [dx, y1], 
          [x0 + dx, y1]
        ])
      }
    }).attr({
      stroke: "#111",
      fill: "none"
    })

    var cells = g.selectAll("g.number").data(nodes)
    var enter = cells.enter().append("g").classed("number", true)

    enter.append("rect").classed("bg", true)
    cells.select("rect.bg")
    .attr({
      width: cellWidth,
      height: cellHeight,
      x: function(d) { return d.x },
      y: function(d) { return d.y },
      fill: "#fff"
    })
    enter.append("text")
    cells.select("text").attr({
      x: function(d) { return d.x + cellWidth/2 },
      y: function(d) { return d.y + cellHeight/2 },
      "alignment-baseline": "middle",
      "text-anchor": "middle",
      "line-height": cellHeight, 
      "fill": "#091242"
    }).text(function(d) { return d.data })

    var step = 0.1;
    var that = this;
    var drag = d3.behavior.drag()
    .on("drag", function(d) {
      var oldData = d.data;
      var val = d.data + d3.event.dx * step
      val = +(Math.round(val*10)/10).toFixed(1)
      set(val, d.i, d.j);
      //data[d.i][d.j] = val;
      that.update()
      dispatch.change(d, oldData)
    })
    cells.call(drag)

    return this;
  }

  function set(val, i, j) {
    var m = mapping[i][j];
    if(m){
      mapping.forEach(function(row, mi) {
        row.forEach(function(col, mj) {
          if(col === m) {
            data[mi][mj] = val;
          }
        })
      })
    }
    data[i][j] = val;
  }
  this.mapping = function(val) {
    if(val) {
      // TODO make sure dims match
      mapping = val;
      return this;
    }
    return mapping;
  }

  this.data = function(val) {
    if(val) {
      data = val;
      nodes = layout.nodes(data);
      return this;
    }
    return data;
  }

  this.margin = function(val) {
    if(val) {
      margin = val;
      layout.margin(margin);
      return this;
    }
    return margin;
  }

  this.cellWidth = function(val) {
    if(val) {
      cellWidth = val;
      layout.cellWidth(cellWidth);
      return this;
    }
    return cellWidth;
  }
  this.cellHeight = function(val) {
    if(val) {
      cellHeight = val;
      layout.cellHeight(cellHeight);
      return this;
    }
    return cellHeight;
  }

  d3.rebind(this, dispatch, "on")
  return this;

}

function matrixLayout() {
  /*
    We accept our matrix data as a list of rows:
    [ [a, b],
      [c, d] ]
  */
  var data = [[]];
  var nodes;
  var margin = [0, 0];
  var cellWidth = 20;
  var cellHeight = 20;
  var nRows;

  function getX(i) {
    return i * (cellWidth + margin[0])
  }
  function getY(j) {
    return j * (cellHeight + margin[1])
  }

  function newNodes() {
    nRows = data.length;
    nodes = [];
    data.forEach(function(rows,i) {
      rows.forEach(function(col, j) {
        var node = {
          x: getX(j),
          y: getY(i),
          data: col,
          i: i,
          j: j,
          index: i * nRows + j
        }
        nodes.push(node);
      })
    })
  }

  function calculate() {
    nRows = data.length;
    data.forEach(function(rows,i) {
      rows.forEach(function(col, j) {
        var node = nodes[i * nRows + j];
        if(!node) return;

        node.data = col;
        node.x = getX(j);
        node.y = getY(i);            
      })
    })
  }

  this.nodes = function(val) {
    if(val) {
      this.data(val);
    }
    return nodes;
  }

  this.data = function(val) {
    if(val) {
      if(val.length === data.length && val[0].length === data[0].length) {
        // if the same size matrix is being updated, 
        // just update the values by reference
        // the positions shouldn't change
        data = val;            
        calculate();
      } else {
        data = val;
        newNodes();
      }
      nRows = data.length;
      return this;
    }
    return data;
  }

  this.margin = function(val) {
    if(val) {
      margin = val;
      calculate();
      return this;
    }
    return margin;
  }

  this.cellWidth = function(val) {
    if(val) {
      cellWidth = val;
      calculate();
      return this;
    }
    return cellWidth;
  }
  this.cellHeight = function(val) {
    if(val) {
      cellHeight = val
      calculate();
      return this;
    }
    return cellHeight;
  }

  return this;
}