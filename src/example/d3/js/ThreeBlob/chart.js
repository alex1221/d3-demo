// from github.com/usfvgl/defaults-centroid/
function getClassCentroid(data, selectedclass, xDomain, yDomain){
  var classData = data.filter(function(d){
      return d.class == selectedclass;
  });
  var xAvg = d3.mean(classData, function(d) {return d[xDomain]})
  var yAvg = d3.mean(classData, function(d) {return d[yDomain]})
  centroid = {"xAvg": xAvg,
        "yAvg": yAvg,
        "class": selectedclass}
  return centroid;
}

function chart() {
  var centroid_clicked = false;
  var isMouseDown = false;
  var isFaded = false,
      startX,
      startY,
      dragX,
      dragY,
      tutorial = false,
      timer,
      circle_on,
      selectedClass,
      width,
      height,
      centroids = {},
      radius = 35, // size of point
      radiusWidth = 2,  //width of open circle stroke
      xDomain = "carat",
      yDomain = "price",
      zDomain = "cut",
      autoPlay = false,
      playing = false,
      currentI = 0,
      rpw = 10, //rows per second to animate
      loop,
      pause,
      datasetSize,
      drawPoints,
      drawAnimationProgress,
      play,
      drawData = {
        color: {},
        point : {
          solid: true,
          opencircle: false,
          alpha: false
        },
        buffers: {
          solid: {},
          opencircle: {},
          alpha: {}
        },
        alpha: 0.3
      };
  var centroid_circles = [];
  var margin = {top: 30, right: 20, bottom: 30, left: 20};
  var canvasWidth = 900;
  var canvasHeight = 450;
  width = 900 - margin.right - margin.left, // default width
  height = 450 - margin.top - margin.bottom; // default height

  var blending_modes = {
    "source-over": true,
    "multiply": false,
    "screen": false,
    "overlay": false,
    "darken": false,
    "lighten": false,
    "color-dodge": false,
    "color-burn": false,
    "hard-light": false,
    "soft-light": false,
    "difference": false,
    "exclusion": false,
    "hue": false,
    "saturation": false,
    "color": false,
    "luminosity": false
  }



  function my(selection) {
    my.clicks = 0;
    my.startTime = null;
    my.endTime = null;
    selection.each(function(data) {

      //scales
      var x = d3.scaleLinear().range([margin.left, width]);
      var y = d3.scaleLinear().range([height, margin.bottom]);
      var z = d3.scaleOrdinal(["rgb(215,25,28)", "rgb(253,174,97)", "rgb(171,221,164)", "rgb(43,131,186)", "rgb(255,255,191)"]);
      var z2 = d3.scaleOrdinal(["rgba(215,25,28, 0.5)", "rgba(253,174,97, 0.5)", "rgba(171,221,164, 0.5)", "rgba(43,131,186, 0.5)", "rgba(255,255,191, 0.5)"]);
      var legendX = d3.scaleLinear().rangeRound([0, margin.right - 70]);
      var progressX = d3.scaleLinear().range([0, 2*Math.PI]);

      //generate chart;
      var root = this;

      canvas = root.appendChild(document.createElement("canvas")),
      context = canvas.getContext("2d");
      canvas.id = "chart-canvas"

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      events_canvas = root.appendChild(document.createElement("canvas"));
      econtext = events_canvas.getContext("2d");
      events_canvas.id = "events-canvas";

      events_canvas.width = canvasWidth;
      events_canvas.height = canvasHeight;


      // generate controls
      var node = document.createElement("div");
      var visual_controls_node = document.createElement("form");
      var visual_controls = root.appendChild(visual_controls_node);

      //point functions
      var point = d3.symbol()
          .size(radius)
          .context(context);

      var openpoint = d3.symbol()
          .size(radius + radiusWidth)
          .context(context);

      var animation_circle = d3.symbol()
          .size(750)
          .context(context);

      context.translate(margin.left, margin.top);
      context.font = "12px sans-serif";

      x.domain([0,10]);
      y.domain([0,10]);
      z.domain(d3.map(data, function(d){return d[zDomain];}).keys());

      datasetSize = data.length;

      z.domain().forEach(function (d, i){
        //set initial values for <label>
        drawData.color[d] = {
          selected: true,
          x: margin.left + width + 5,
          y: margin.top + ((height -30*z.domain().length) /2) + 5 + i*30,
          count: 0
        };
        // also set values for event canvas circles
        var xCor = 80 + 60*i;
        var yCor = 0;
        centroid_circles.push({
          x: xCor,
          y: yCor,
          class: d,
          fill: z2(d),
          radius: 20,
          isDragging: false
        })
        // get actual centroid
        centroids[d] = getClassCentroid(data, d, xDomain, yDomain);
        centroids[d].x = Math.floor(x(centroids[d].xAvg));
        centroids[d].y = Math.floor(y(centroids[d].yAvg));
        centroids[d].fill = z2(centroids[d].class);
        centroids[d].solidFill = z(centroids[d].class);
      });

      //define buffers
      Object.keys(drawData.buffers).forEach(function(pointType){
        Object.keys(drawData.color).forEach(function(d) {
          var grayOffScreenCanvas= document.createElement('canvas');
          grayOffScreenCanvas.width= width + radius + 2;
          grayOffScreenCanvas.height= height;
          var graycontext= grayOffScreenCanvas.getContext("2d");

          var offScreenCanvas= document.createElement('canvas');
          offScreenCanvas.width= width + radius + 2;
          offScreenCanvas.height= height;
          var colorcontext= offScreenCanvas.getContext("2d");

          drawData.buffers[pointType][d] = {
            gray: {
              context: graycontext,
              canvas: grayOffScreenCanvas,
              image: null
            },
            color: {
              context: colorcontext,
              canvas: offScreenCanvas,
              image: null
            }
          }
        });
      })

      //draw initial points and buffers
      var selectedPoint = getSelectedPointType();

      data.forEach(function(d) {
        d.x = Math.floor(x(d[xDomain]));
        d.y = Math.floor(y(d[yDomain]));

        drawData.color[d[zDomain]].count += 1;

        //draw point in context
        context.translate(d.x, d.y);
        if (selectedPoint === "solid") {
          context.fillStyle = z(d[zDomain]);
          context.strokeStyle = "white";
          context.beginPath();
          point(d);
          context.closePath();
          context.fill();
          context.stroke();

        } else if (selectedPoint === "opencircle") {
          context.strokeStyle = z(d[zDomain]);
          context.beginPath();
          openpoint(d);
          context.closePath();
          context.stroke();
        } else if (selectedPoint === "alpha") {
          context.fillStyle = z(d[zDomain])
          context.globalAlpha = drawData.alpha;
          context.beginPath();
          point(d);
          context.closePath();
          context.fill();
          context.globalAlpha = 1.0;
        }
        context.translate(-d.x, -d.y);
      });

      // define image data
      var defineImageData = function(callback){
        Object.keys(drawData.buffers).forEach(function(pointType) {
          Object.keys(drawData.buffers[pointType]).forEach(function(d) {
            drawData.buffers[pointType][d].gray.image = new Image();
            drawData.buffers[pointType][d].gray.image.src = drawData.buffers[pointType][d].gray.canvas.toDataURL();

           drawData.buffers[pointType][d].color.image = new Image();
            drawData.buffers[pointType][d].color.image.src = drawData.buffers[pointType][d].color.canvas.toDataURL();
          });
        })
        legendX.domain([0, d3.max(Object.keys(drawData.color), function (d) { return drawData.color[d].count; })]);
        progressX.domain([0, datasetSize]);
        drawCentroidCircles();
        callback();
      }
      // draw axises
      xAxis();
      yAxis();

      var drawBuffers = function (d) {
        var selectedPointType = getSelectedPointType();
        //redraw points from correct buffers
        //draw gray buffers first
        Object.keys(drawData.color).forEach(function(c) {
          if(!drawData.color[c].selected && (!d || c !== d)) {
            context.drawImage(drawData.buffers[selectedPointType][c].gray.image, 0, 0);
          }
        })

        //draw color buffers
        Object.keys(drawData.color).forEach(function(c) {
          if(drawData.color[c].selected && (!d || c !== d)) {
            context.drawImage(drawData.buffers[selectedPointType][c].color.image, 0, 0);
          }
        })

        if (d){
          //draw the color that was clicked on, last
          if(drawData.color[d].selected) {
            context.drawImage(drawData.buffers[selectedPointType][d].color.image, 0, 0);
          } else {
            context.drawImage(drawData.buffers[selectedPointType][d].gray.image, 0, 0);
          }
        }
      }
      // define draw animation progress
      drawAnimationProgress = function() {
        context.save();
        context.globalCompositeOperation = "source-over";
        context.translate(width - 120, -20);
        //clear progress area
        context.clearRect(-5, -5, 50, 50);

        context.fillStyle = "gray";
        context.lineWidth = 5;
        context.beginPath();
        context.arc(20,20,18,0,2*Math.PI);
        context.strokeStyle = "gray";
        context.stroke();

        context.strokeStyle = "white";
        context.beginPath();
        context.arc(20,20,18,progressX(currentI), progressX(currentI) + 0.2);
        context.stroke();
        context.lineWidth = 1;
        context.restore();
      }

      function drawCentroidCircles() {
        econtext.clearRect(0,0, events_canvas.width, events_canvas.width);
        econtext.save();
        econtext.translate(margin.left, margin.top);
        for (var i = 0; i < centroid_circles.length; i++) {
          var circle = centroid_circles[i];

          if(circle.isDragging){
            econtext.beginPath();
            econtext.arc(circle.x + dragX, circle.y + dragY, circle.radius + 3, 0, 2 * Math.PI, false);
            econtext.fillStyle = "rgba(255,255,255,0.5)";
            econtext.fill();
            econtext.closePath();
            econtext.beginPath();
            econtext.arc(circle.x + dragX, circle.y + dragY, circle.radius, 0, 2 * Math.PI, false);
            econtext.fillStyle = circle.fill;
            econtext.fill();
            econtext.closePath();
            drawCrosshairs(circle.x + dragX, circle.y + dragY);
          } else {
            econtext.beginPath();
            econtext.arc(circle.x, circle.y, circle.radius + 3, 0, 2 * Math.PI, false);
            econtext.fillStyle = "rgba(255,255,255,0.5)";
            econtext.fill();
            econtext.closePath();
            econtext.beginPath();
            econtext.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
            econtext.fillStyle = circle.fill;
            econtext.fill();
            econtext.closePath();
            drawCrosshairs(circle.x, circle.y);
          }

        };
        econtext.restore();
      }

      function drawCrosshairs(x, y) {
        // draw cross hairs
        econtext.strokeStyle = "gray";
        econtext.beginPath();
        econtext.moveTo(x-5,y);
        econtext.lineTo(x+5,y);
        econtext.stroke();
        econtext.beginPath();
        econtext.moveTo(x,y-5);
        econtext.lineTo(x,y+5);
        econtext.stroke();

      }

      //define loop function
      loop = function() {
        timer = d3.interval(function (elapsed) {
          if (playing) {
            drawAnimationProgress();

            for (var i = 0; i < rps; i++) {
              var d = data[currentI];
              d.x= Math.round(x(d[xDomain]));
              d.y = Math.round(y(d[yDomain]));
              context.translate(d.x, d.y);
              var selectedPointType = getSelectedPointType();
              if (selectedPointType === "solid") {
                if(drawData.color[d[zDomain]].selected) {
                  context.fillStyle = z(d[zDomain]);
                } else {
                  context.fillStyle = "lightgray";
                }
                context.strokeStyle = "white";
                context.beginPath();
                point(d);
                context.closePath();
                context.fill();
                context.stroke();
              } else if (selectedPointType === "opencircle") {
                if(drawData.color[d[zDomain]].selected) {
                  context.strokeStyle = z(d[zDomain]);
                } else {
                  context.strokeStyle = "lightgray";
                }
                context.beginPath();
                openpoint(d);
                context.closePath();
                context.stroke();
              } else if (selectedPointType === "alpha") {
                context.globalAlpha = drawData.alpha;
                if(drawData.color[d[zDomain]].selected) {
                  context.fillStyle = z(d[zDomain]);
                } else {
                  context.fillStyle = "lightgray";
                }
                context.beginPath();
                point(d);
                context.closePath();
                context.fill();
                context.globalAlpha = 1.0;
              }
              context.translate(-d.x, -d.y);
              incrementCurrentI();
            }
          } else  {
            timer.stop();
          }
        }, 100)
        }

      // draw starting canvas after image data has been defined
      defineImageData(function() {});

      //https://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
      function getCursorPosition(canvas, event) {
          var rect = events_canvas.getBoundingClientRect();
          var x = event.clientX - rect.left;
          var y = event.clientY - rect.top;
          return [x, y];
      }

      //https://stackoverflow.com/questions/17424623/canvas-drag-and-drop-with-multiple-items
      //https://stackoverflow.com/questions/16792841/detect-if-user-clicks-inside-a-circle
    function setDragging(x,y){
        var dx = x - margin.left;
        var dy = y - margin.top;
        for(var i = 0; i < centroid_circles.length; i++){
            var circle = centroid_circles[i];
            if(Math.sqrt((dx-circle.x)*(dx-circle.x) + (dy-circle.y)*(dy-circle.y)) < circle.radius){
                for (var j = 0; j < centroid_circles.length; j++) {
                  centroid_circles[j].isDragging = false;
                };
                circle.isDragging = true;
                break;
            }
        }
    }

    function clearDragging(x, y){
        for(var i = 0; i < centroid_circles.length;i++){
            var circle = centroid_circles[i];
            if(circle.isDragging){
                circle.isDragging = false;
                circle.x += dragX;
                circle.y += dragY;
            }
        }
    }

    function handleMouseDown(e){
      if(my.clicks == 0){
        my.startTime = Date.now()
      }
      my.clicks += 1;
      mouse = getCursorPosition(events_canvas, e);
      mouseX = mouse[0];
      mouseY = mouse[1];

      startX = mouseX;
      startY = mouseY;
      setDragging(startX,startY);
      isMouseDown=true;
    }

    function handleMouseUp(e){
      my.endTime = Date.now();
      mouse = getCursorPosition(events_canvas, e);
      mouseX = mouse[0];
      mouseY = mouse[1];

      isMouseDown=false;
      clearDragging();

      var isValid = true;

      for (var i = 0; i < centroid_circles.length; i++) {
        var circle = centroid_circles[i]
        isValid = isValid && isValidCoor(circle.x, circle.y);
      };

      my.valid = isValid;

      if(my.valid){
        document.getElementById('warning').innerHTML = "";
        experimentr.release();
      } else {
        document.getElementById('warning').innerHTML = "Warning: The \"Next\" button will only be enabled when the highlighted region is on the plot.";
        experimentr.hold();
      }
    }

    function handleMouseOut(e){
      mouse = getCursorPosition(events_canvas, e);
      mouseX = mouse[0];
      mouseY = mouse[1];

      isMouseDown=false;
      clearDragging();
    }

    function handleMouseMove(e){
      mouse = getCursorPosition(events_canvas, e);
      mouseX = mouse[0];
      mouseY = mouse[1];

      if(isMouseDown){
          dragX = mouseX - startX;
          dragY = mouseY - startY;
          drawCentroidCircles(mouseX,mouseY);
      }

    }

    events_canvas.addEventListener("mousedown", handleMouseDown);
    events_canvas.addEventListener("mousemove", handleMouseMove);
    events_canvas.addEventListener("mouseup", handleMouseUp);
    events_canvas.addEventListener("mouseout", handleMouseOut);


    var togglePoints = function() {
      var wasPlaying = false;
      if (playing) {
        pause();
        wasPlaying = true;
      }

      var pointType = this.getAttribute("value");

      Object.keys(drawData.point).forEach(function(p) {
        drawData.point[p] = false;
      });
      drawData.point[pointType] = true;

      // clear canvas
      context.clearRect(1,0,width + margin.right ,height + 2);

      //redraw points from correct buffers
      //draw gray buffers first
      Object.keys(drawData.color).forEach(function(c) {
        if(!drawData.color[c].selected) {
          context.drawImage(drawData.buffers[pointType][c].gray.image, 0, 0);
        }
      })

      //draw color buffers
      Object.keys(drawData.color).forEach(function(c) {
        if(drawData.color[c].selected) {
          context.drawImage(drawData.buffers[pointType][c].color.image, 0, 0);
        }
      })

      if (wasPlaying) {
        play();
      } else {
        //redraw animation progress
        drawAnimationProgress();
      }
    }

    function getSelectedPointType() {
      var selected;
      Object.keys(drawData.point).forEach(function(p) {
        if (drawData.point[p]) {
          selected = p;
        }
      });
      return selected;
    }

    function xAxis() {
      var tickCount = 10,
          tickSize = 6,
          ticks = x.ticks(tickCount),
          tickFormat = x.tickFormat();
      context.save();
      context.beginPath();

      ticks.forEach(function(d) {
        context.moveTo(x(d), height);
        context.lineTo(x(d), height + tickSize);
      });
      context.strokeStyle = "gray";
      context.stroke();

      context.fillStyle = "gray";
      context.beginPath();
      context.moveTo(13, height);
      context.lineTo(width, height);
      context.strokeStyle = "gray";
      context.stroke();

      context.textAlign = "center";
      context.textBaseline = "top";
      ticks.forEach(function(d) {
        context.fillText(tickFormat(d), x(d), height + 3 + tickSize);
      });
      context.restore();
    }

    function yAxis() {
      var tickCount = 10,
          tickSize = 6,
          tickPadding = 3,
          ticks = y.ticks(tickCount),
          tickFormat = y.tickFormat(tickCount);
      context.save();
      context.beginPath();
      ticks.forEach(function(d) {
        context.moveTo(margin.left, y(d));
        context.lineTo(margin.left-6, y(d));
      });
      context.strokeStyle = "gray";
      context.stroke();
      context.fillStyle = "gray";
      context.beginPath();
      context.moveTo(margin.left, margin.top);
      context.lineTo(margin.left, height);
      context.lineTo(margin.left-tickSize, height);
      context.strokeStyle = "gray";
      context.stroke();

      context.textAlign = "right";
      context.textBaseline = "middle";
      ticks.forEach(function(d) {
        context.fillText(tickFormat(d), margin.left - tickSize - tickPadding, y(d));
      });
      context.restore();
    }

    function incrementCurrentI () {
      currentI = (currentI + 1) % datasetSize;
    }
    function pause () {
      playing = false;
    }

    function play () {
      playing = true;
      loop();
    }

    if (autoPlay) {
      play();
    }
  });

  }

  var isValidCoor = function(x, y) {
    if (x > 0 && x < 0+width && y > 0 && y < 0 + height) {
      return true;
    } else {
      return false;
    }
  }

  my.centroidInfo = function() {
    var centroidInfo = {}
    centroidInfo.actual = centroids;
    centroidInfo.guess = {};
    for (var i = 0; i < centroid_circles.length; i++) {
      var circle = centroid_circles[i];
      centroidInfo.guess[circle.class] = {
        x: circle.x,
        y: circle.y
      }
    };
    return centroidInfo;
  };

  my.width = function(value) {
    if (!arguments.length) return width;
    canvasWidth = value;
    width = value - margin.right - margin.left;
    return my;
  };

  my.height = function(value) {
    if (!arguments.length) return height;
    canvasHeight = value;
    height = value - margin.top - margin.bottom;
    return my;
  };

  my.autoPlay = function(value) {
    if (!arguments.length) return autoPlay;
    autoPlay = value;
    return my;
  }

  my.animationSpeed = function(value) {
    if (!arguments.length) return rps;
    rps = value;
    return my;
  }

  my.pointType = function(value) {
    if (!arguments.length) return drawData.point[value];
    drawData.point = {
          solid: false,
          opencircle: false,
          alpha: false
        }
    drawData.point[value] = true;
    return my;
  }

  my.radius = function(value) {
    if (!arguments.length) return radius;
    radius = value;
    return my;
  }

  my.xDomain = function(newXDomain) {
    if (!arguments.length) return xDomain;
    xDomain = newXDomain;
    return my;
  }

  my.yDomain = function(newYDomain) {
    if (!arguments.length) return yDomain;
    yDomain = newYDomain;
    return my;
  }

  my.zDomain = function(newZDomain) {
    if (!arguments.length) return zDomain;
    zDomain = newZDomain;
    return my;
  }

  my.selectedClass = function(newclass) {
    if (!arguments.length) return selectedClass;
    selectedClass = newclass;
    return my;
  }

  my.tutorial = function(booleanval) {
    if (!arguments.length) return tutorial;
    tutorial = booleanval;
    return my;
  }

  my.stop = function() {
    if (timer) {
      timer.stop();
    }
  }

  my.faded = function (value) {
    if (!arguments.length) return isFaded;
    isFaded = value;
    return my;
  }

  my.realCentroid = function() {
    if (tutorial) {
      var canvas = document.getElementById("chart-canvas")
      var ecanvas = document.getElementById("events-canvas")
      var econtext = ecanvas.getContext("2d");
      var context = canvas.getContext("2d");
      //code to fade tutorial canvas
      // if (!my.faded()) {
      //   context.save();
      //   context.beginPath();
      //   context.rect(0,0, canvas.width, canvas.height)
      //   context.closePath();
      //   context.fillStyle = "rgba(255,255,255,0.5)";
      //   context.fill();
      //   context.restore();
      //   my.faded(true);
      // }

      //draw centroid circles without crosshair
      econtext.clearRect(0,0, events_canvas.width, events_canvas.width);
      econtext.save();
      econtext.translate(margin.left, margin.top);
      for (var i = 0; i < centroid_circles.length; i++) {
        var circle = centroid_circles[i];
        econtext.beginPath();
        if(circle.isDragging){
          econtext.arc(circle.x + dragX, circle.y + dragY, circle.radius, 0, 2 * Math.PI, false);
          econtext.fillStyle = circle.fill;
          econtext.fill();
          drawCrosshairs(circle.x + dragX, circle.y + dragY);
        } else {
          econtext.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
          econtext.fillStyle = circle.fill;
          econtext.fill();
        }

      };

      econtext.globalCompositeOperation = "multiply";

      Object.keys(centroids).forEach(function (d, i) {
        //draw tutorials
        econtext.beginPath();
        econtext.arc(centroids[d].x, centroids[d].y, 20, 0, 2 * Math.PI, false);
        econtext.lineWidth = 6;
        econtext.strokeStyle = "white";
        econtext.stroke();
        econtext.beginPath();
        econtext.moveTo(centroids[d].x-3,centroids[d].y);
        econtext.lineTo(centroids[d].x+3,centroids[d].y);
        econtext.stroke();
        econtext.beginPath();
        econtext.moveTo(centroids[d].x,centroids[d].y-3);
        econtext.lineTo(centroids[d].x,centroids[d].y+3);
        econtext.stroke();

        econtext.beginPath();
        econtext.arc(centroids[d].x, centroids[d].y, 20, 0, 2 * Math.PI, false);
        econtext.lineWidth = 1;
        econtext.strokeStyle = centroids[d].solidFill;
        econtext.stroke();
        econtext.stroke();
        econtext.beginPath();
        econtext.moveTo(centroids[d].x-3,centroids[d].y);
        econtext.lineTo(centroids[d].x+3,centroids[d].y);
        econtext.stroke();
        econtext.stroke();
        econtext.beginPath();
        econtext.moveTo(centroids[d].x,centroids[d].y-3);
        econtext.lineTo(centroids[d].x,centroids[d].y+3);
        econtext.stroke();
        econtext.stroke();
      })
      econtext.restore();
    }
  }

  return my;
}