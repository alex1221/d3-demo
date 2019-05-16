function Matrix() {
      /* http://bl.ocks.org/enjalot/65ae9c0fc95337107448
       | a, b, tx |
       | c, d, ty |
       | 0, 0, 1  |
      */
      this.a = 1;
      this.b = 0;
      this.c = 0;
      this.d = 1;
      
      this.tx = 0;
      this.ty = 0;

     this.s = 1;
     this.ra = 1;
     this.rb = 0;
     this.rc = 0;
     this.rd = 1;
    }
    Matrix.prototype.scale = function(s) {
      this.s = s;
      this.a *= s;
      this.d *= s;
      return this;
    }
    Matrix.prototype.translate = function(x,y) {
      this.tx = x;
      this.ty = y;
      return this;
    }
    Matrix.prototype.rotate = function(deg) {
      var sin = Math.sin(deg*Math.PI/180).toFixed(3);
      var cos = Math.cos(deg*Math.PI/180).toFixed(3);
      this.ra = cos;
      this.rb = -sin;
      this.rc = sin;
      this.rd = cos;
      this.update();
      return this;
    }
    Matrix.prototype.update = function() {
      this.a = this.ra * this.s;
      this.b = this.rb * this.s;
      this.c = this.rc * this.s;
      this.d = this.rd * this.s;
      return this;
    }
 
    function transformer(p, m){
      // transform point
      var x = p.x || 0;
      var y = p.y || 0;
      var x2 = m.a*x + m.b*y + m.tx;
      var y2 = m.c*x + m.d*y + m.ty;
      p.x = x2;
      p.y = y2;
      //return {x:x2, y:y2};
    }