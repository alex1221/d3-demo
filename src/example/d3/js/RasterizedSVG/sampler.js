var Sampler = function() {}

Sampler.getSamples = function(path, num) {
  //accomodate scale (this only works if no rotation applied)
  var absBBox = path.getBoundingClientRect();
  var bbox = path.getBBox();
  var scale = absBBox.width/bbox.width;
  // use point along path to trace our path
  var len = path.getTotalLength()
  var p, t;
  var result = []
  for(var i = 0; i < num; i++) {
    p = path.getPointAtLength(i * len/num);
    t = Sampler.getTangent(path, i/num * 100);
    result.push({
      x: p.x * scale,
      y: p.y * scale,
      point: p, 
      tangent: t,
      perp: Sampler.rotate2d(t.v, 90)
    });
  }
  return result
}

Sampler.getTangent = function(path, percent) {
  // returns a normalized vector that describes the tangent
  // at the point that is found at *percent* of the path's length
  var fraction = percent/100;
  if(fraction < 0) fraction = 0;
  if(fraction > 0.99) fraction = 1;
  
  var len = path.getTotalLength();
  var point1 = path.getPointAtLength(fraction * len - 0.1);
  var point2 = path.getPointAtLength(fraction * len + 0.1);
 
  var vector = { x: point2.x - point1.x, y: point2.y - point1.y }
  var magnitude = Math.sqrt(vector.x*vector.x + vector.y*vector.y);
  vector.x /= magnitude;
  vector.y /= magnitude;

  return {p: point1, v: vector };
}

Sampler.rotate2d = function(vector, angle) {
  //rotate a vector 
  angle *= Math.PI/180; //convert to radians
  return {
    x: vector.x * Math.cos(angle) - vector.y * Math.sin(angle),
    y: vector.x * Math.sin(angle) + vector.y * Math.cos(angle)
  }
}

// we average the location of all the array's points to get the center
function centroid(samples) {
  var avg = {x:0, y:0};
  for(var i = 0; i < samples.length; i++) {
    avg.x += samples[i].x;
    avg.y += samples[i].y;
  }
  avg.x /= samples.length;
  avg.y /= samples.length;
  return avg;
}

// The PolyK library expects a flat array like [x,y,x,y...]
function toPolyK(samples) {
  var poly = []
  for(var i = 0; i < samples.length; i++) {
    poly.push(samples[i].x);
    poly.push(samples[i].y);
  }
  return poly;
}

