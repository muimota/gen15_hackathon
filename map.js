var am;
var paper;
var activeCategories = [];

var categoryTags = 
		{
			'Empleo':[1640,11,90,1853,510,1996,1291,255,1923,149,164,347,2211,268,2219,870],
			'Salud':[ 2051,911,1749,125,1803,2151,12,1167,1616],
		 	'Educacion':[ 234,1513,551,547,1363,346,2254,2087,1960,1501,571,1892,2408,1907],
		 	'Vivienda':[ 392,943,333,1689,391,991,1297],
		 	'Seguridad':[ 207,2299,1138,158,759,2099,147,915,2467,2302,120,517,1117],
		 	'Ambiente':[ 1754,966,213,138,209,359,1126]
		};
var categoryColors = 
	{
		'Empleo':Raphael.color('#F26B28'),
		'Salud':Raphael.color('#DB044E'),
	 	'Educacion':Raphael.color('#CB8A14'),
	 	'Vivienda':Raphael.color('#5663B2'),
	 	'Seguridad':Raphael.color('#3AB2B1'),
	 	'Ambiente':Raphael.color('#9CB637')
	};
var defaultColor = Raphael.color('#666666');

var elements = [];
$(document).ready(function(){
	$.get('protests4.json',init);
});

function init(data){
	
	am = new ArticlesModel(data);
	//pm = pm.getTags(['Corrupción']);

	//$('#map').click(function(){$('#tool').hide()})
	paper = Raphael('map',992,684)
	paper.image('images/map.png',0,0,992,684);
	initUI();
}

function initUI(){
	$('#timeslider').slider({'min':0,'max':am.timeline.length-1,'step':1});
	$('#timeslider').on('change',sliderHandler);
	
	$('.dataset').addClass('active');
	$('.dataset').click(layerHandler);

	//populate ActiveCategories
	$('.dataset').each(function() {
	    if($(this).hasClass('active')){
	    	activeCategories.push($(this).attr('id').substring(3));
	    }
	});
	sliderHandler();
}

function layerHandler(event){
	$(event.currentTarget).toggleClass('active');
	activeCategories = [];
	$('.dataset').each(function() {
	    if($(this).hasClass('active')){
	    	activeCategories.push($(this).attr('id').substring(3));
	    }
	});

	for(var i=0;i<elements.length;i++){
		var element = elements[i];
		var opacityValue;
		if($.inArray(element.data('category'),activeCategories)== -1){
			element.data('active',false);
			opacityValue = 0;
		}else{
			element.data('active',true);
			opacityValue = .6;
		}
		element.animate({opacity:opacityValue},500,'linear')
	}
	
	console.log(activeCategories);
	packProtests();
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
		element.animate({opacity:0.0},200,'linear',
			function(){
				this.remove();
			});
		
	}

	//añadimos los que faltan
	//console.log(articles.length);
	for(var i=0;i<articles.length;i++){
		var article = articles[i];
		drawProtest(article);
	}
	//pack
	packProtests();


	$('#date').text(ArticlesModel.formatDate(am.timeline[startIndex]) + ' - ' + 
				    ArticlesModel.formatDate(am.timeline[endIndex]));
}




function drawProtest(article){

	var coords,element;
	
	var color = undefined;
	var tagIds = article['tags'];
	var categoryName = undefined;

	var emptyRadius  = 5;
	var minRadius = 8;
	var maxRadius  =20;

	var radius = emptyRadius;

	for(var i=0;i<tagIds.length;i++){
		var tagId = tagIds[i];
		for(var category in categoryTags){
			if(categoryTags[category].indexOf(tagId) != -1){
				color = categoryColors[category];
				categoryName = category;
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
				radius = Math.max(minRadius,Math.min(maxRadius,mapValue(things[thingId],0,10000,minRadius,maxRadius)));
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
			element = paper.circle(coords[0],coords[1],radius).attr({'fill': color,'opacity':0.0,'stroke-width': 0});
			element.hover(circleHandler,circleHandler);
			element.data('category',categoryName);
			element.data('id',article['id']);
			element.data('r',radius);
			element.data('cx',coords[0]);
			element.data('cy',coords[1]);
			element.data('active',false);
			if($.inArray(categoryName,activeCategories)!=-1){
				element.animate({opacity:0.6},200);
				element.data('active',true);
			}
			
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
    position.top  = Math.max(0,BBox.y-88);
    position.left = -145+(BBox.x+BBox.x2)/2.0;

    //toolTip.text(this.paper.mapManager.datamodel.getTooltip(this.node.id));
    toolTip.hide();
    toolTip.css("top",position.top);
    toolTip.css("left",position.left);
    toolTip.html(innerHtml)

    toolTip.stop(true);
    if(event.type == 'mouseout'){
    	toolTip.fadeOut();
	}else{
		toolTip.fadeIn();
		
	}

	//debugger;
}