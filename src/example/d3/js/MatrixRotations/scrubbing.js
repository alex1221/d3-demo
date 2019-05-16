// Make inputs scrubbable
var Mouse = {};
var scrubInput = null;
var scrubPosition = {x:0, y:0};
var scrubStartValue = 0;
var scrubId;
function makeScrubbable(input){
  input.onmousedown = function(e){
    scrubInput = e.target;
    scrubPosition.x = e.clientX;
    scrubPosition.y = e.clientY;
    scrubStartValue = parseFloat(input.value);
  }
  input.onclick = function(e){
    e.target.select();
  }
}
function setupScrubbing(cb) {
  window.onmousemove = function(e){
    // Mouse
    Mouse.x = e.clientX;
    Mouse.y = e.clientY;
    // Scrubbing
    if(!scrubInput) return;
    scrubInput.blur();
    var deltaX = e.clientX - scrubPosition.x;
    deltaX = Math.round(deltaX/10)*0.1; // 0.1 for every 10px
    var val = scrubStartValue + deltaX;
    scrubInput.value = (Math.round(val*10)/10).toFixed(1);
    scrubId = null;
    cb();
  }
  window.onmouseup = function(){
    scrubInput = null;
  }
}