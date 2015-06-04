var am;
var paper;

var categoryTags = 
		{
			'Empleo':[1640,11,90,1853,510,1996,1291,255,1923,149,164,347,2211,268,2219,870],
			'Salud':[ 2051,911,1749,125,1803,2151,12,1167,1616],
		 	'Educación':[ 234,1513,551,547,1363,346,2254,2087,1960,1501,571,1892,2408,1907],
		 	'Vivienda':[ 392,943,333,1689,391,991,1297],
		 	'Seguridad y Justicia':[ 207,2299,1138,158,759,2099,147,915,2467,2302,120,517,1117],
		 	'Medio ambiente':[ 1754,966,213,138,209,359,1126]
		};
var categoryColors = 
	{
		'Empleo':Raphael.color('#F26B28'),
		'Salud':Raphael.color('#DB044E'),
	 	'Educación':Raphael.color('#CB8A14'),
	 	'Vivienda':Raphael.color('#5663B2'),
	 	'Seguridad y Justicia':Raphael.color('#3AB2B1'),
	 	'Medio ambiente':Raphael.color('#9CB637')
	};
var defaultColor = Raphael.color('#666666');

var elements = [];
$(document).ready(function(){
	$.get('protests4.json',init);
});

function init(data){
	
	am = new ArticlesModel(data);
	//pm = pm.getTags(['Corrupción']);

	$('#timeslider').slider({'min':0,'max':am.timeline.length-1,'step':1});
	$('#timeslider').on('change',sliderHandler);
	//$('#map').click(function(){$('#tool').hide()})
	paper = Raphael('map',992,684)
	paper.image('images/map2.png',0,0,992,684);
	sliderHandler();
}

function sliderHandler(){
	
	var index  = $('#timeslider').slider('getValue');
	var indexRadius = 10;
	var startIndex	= Math.max(index-indexRadius,0);
	var endIndex	= Math.min(index+indexRadius,am.timeline.length);
	
	var placesDict = {};
	var placeNames = [];
	var articles = [];

	var articleIds = [];

	for(var i=startIndex;i<endIndex;i++){
		
		var date = am.timeline[i];
		var dayArticles = am.getArticlesInDate(date);

		for(var j=0;j<dayArticles.length;j++){
			var article = dayArticles[j];
			articleIds.push(article['id']);
			articles.push(article);

		}
	}
	//quitamos los que desaparecen
	var indexToRemove = [];
	var elementsToKeep   = [];
	var elementsToRemove = [];
	for(var i=0;i<elements.length;i++){
		var element = elements[i];
		var index = articleIds.indexOf(element.data('id'));
		
		if(index==-1){
			// que se tienen que quitar
			elementsToRemove.push(element);
		}else{
			//que estan y que no hay que volver a chequear
			articleIds.splice(index,1);
			articles.splice(index,1);
			elementsToKeep.push(element)
		}
	}
	elements = elementsToKeep;
    //quitamos
   
	for(var i=0;i<elementsToRemove.length;i++){
		var element = elementsToRemove[i];
		element.animate({opacity:0.0},500,'linear',
			function(){
				this.remove();
			});
		
	}

	//añadimos los que faltan
	console.log(articles.length);
	for(var i=0;i<articles.length;i++){
		var article = articles[i];
		drawProtest(article);
	}
	//pack
	packProtests();


	$('#date').text(ArticlesModel.formatDate(am.timeline[startIndex]) + ' - ' + 
				    ArticlesModel.formatDate(am.timeline[endIndex]));
}

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
			
			console.log("before:"+dist+" after:"+distAfter+" min:"+minRadius);
			if(distAfter<minRadius){
				//debugger;
			}
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

	

	for (var i = 0; i < elements.length; i++) {
      for (var j = 0; j < elements.length; j++) {
      	if(i==j){
        	continue;	
        }
        pack(elements[i], elements[j]);
      }
  	}

}


function drawProtest(article){

	var coords,element;
	var radius = 5;
	var color = undefined;
	var tagIds = article['tags'];

	for(var i=0;i<tagIds.length;i++){
		var tagId = tagIds[i];
		for(var category in categoryTags){
			if(categoryTags[category].indexOf(tagId) != -1){
				color = categoryColors[category];
				break;
			}
		}
		if(color != undefined){
			break;
		}
	}
	if(color == undefined){
		color = defaultColor;
	}
	if('things' in article){
		var things = article['things'];
		//nos quedamos con la cosa que tenga indice menos
		var thingIndex=99999;
		for(var thingId in things){
			index = validThings.indexOf(am.things[thingId]);
			if(index > -1 && index<thingIndex){
				thingIndex = index;
				radius = Math.max(5,Math.min(50,mapValue(things[thingId],0,10000,3,50)));
			}
		}
	}

	if('place' in article){
		var places = article['place'];
		var placesDict = {};
		var placeNames = [];
		for(var i=0;i<places.length;i++){
			var place = places[i];
			placesDict[place]=true;
			coords  = getCoordinates(place);
			if(coords==undefined){
				continue;
			}
			element = paper.circle(coords[0],coords[1],radius).attr({'fill': color,'opacity':0.7,'stroke-width': 0});
			element.hover(circleHandler,circleHandler);
			element.attr({opacity:0.0});
			element.animate({opacity:0.3},500);
			element.data('id',article['id']);
			element.data('r',radius);
			element.data('cx',coords[0]);
			element.data('cy',coords[1]);
			elements.push(element);
		}
		for(var placeName in placesDict){
			placeNames.push(placeName);
		}
	}
	
}

function circleHandler(event){
	var BBox = this.getBBox(false);
    var offset  = $('#map').position();
    var toolTip = $('#tool');
    var position = {};
    var articleId = this.data('id');
    var article = am.indexedArticles[articleId];
    var innerHtml = '<h8>'+ArticlesModel.formatDate(article['date'])+'</h8><h6><a href="'+article['url']+'" target = "_blank">'+article.title+'</a></h6>';
    position.top  = Math.max(0,BBox.y-85);
    position.left = -125+(BBox.x+BBox.x2)/2.0;

    console.log(event);
    //toolTip.text(this.paper.mapManager.datamodel.getTooltip(this.node.id));
    toolTip.hide();
    toolTip.css("top",position.top);
    toolTip.css("left",position.left);
    toolTip.html(innerHtml)

    if(event.type == 'mouseout'){
    	toolTip.fadeOut();
	}else{
		toolTip.fadeIn();
		
	}

	//debugger;
}