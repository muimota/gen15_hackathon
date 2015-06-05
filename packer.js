function packProtests(){

    // if the radii intersect, push them apart
	var pack = function(elemA, elemB) {

		var a = {x:elemA.data('cx'),y:elemA.data('cy'),r:elemA.data('r')}
		var b = {x:elemB.data('cx'),y:elemB.data('cy'),r:elemB.data('r')}
		
		if(distance(a.x,a.y,b.x,b.y)==0){
			var angle = Math.random()*Math.PI*2;
			b.x+=Math.cos(angle)*4;
			b.y+=Math.sin(angle)*4;
		}
		var dist = distance(a.x,a.y,b.x,b.y);
		
	    if (intersects(a, b)) {
			
			v.x = b.x - a.x;
			v.y = b.y - a.y;
			
			v.normalize();
			var magnitude = a.r + b.r - dist +1;
			v.mult(magnitude);

			
			b.x += v.x;
			b.y += v.y;
			var distAfter = distance(a.x,a.y,b.x,b.y);
			var minRadius = a.r + b.r;
			
			elemB.data('cx',b.x);
			elemB.data('cy',b.y);
			elemB.animate({'cx':b.x,'cy':b.y},250,'easeOut');	
    }
	};
  
	// vector
	var v = {};
	v.normalize = function() {
		v.magnitude = Math.sqrt((v.x * v.x) + (v.y * v.y));

		v.x = v.x / v.magnitude;
		v.y = v.y / v.magnitude;
	};

	v.mult = function(m) {
		v.x *= m;
		v.y *= m;
		v.magnitude = Math.sqrt((v.x * v.x) + (v.y * v.y));
	};

	var distance = function(ax, ay, bx, by) {
		var dx = ax - bx;
		var dy = ay - by;
		var d = Math.sqrt((dx*dx) + (dy*dy));
		return d;
	};

	var intersects = function(a, b) {
	var d  = distance(a.x, a.y, b.x, b.y);
		return (d < (a.r + b.r));
	};

	var compareElem = function(elemA,elemB){
		return elemA.data('r')-elemB.data('r');
	}

	var activeElements = [];
	
	for (var i = 0; i < elements.length; i++) {
		var element  = elements[i];
		if(element.data('active')){
			activeElements.push(element);
		}
	}

	activeElements.sort(compareElem);
	
	for(var k=0;k<2;k++){
		for (var i = 0; i < activeElements.length; i++) {
	      for (var j = 0; j < activeElements.length; j++) {
	      	if(i==j){
	        	continue;	
	        }
	        pack(activeElements[i], activeElements[j]);
	      }
	  	}
  	}
}