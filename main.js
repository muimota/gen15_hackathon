
var am;

$(document).ready(function(){
	$.get('protests4.json',init);
});

function init(data){
	
	am = new ArticlesModel(data);
	//pm = pm.getTags(['Corrupción']);

	$('#timeslider').slider({'min':0,'max':am.timeline.length-1,'step':1});
	$('#timeslider').on('change',updateUI);
	updateUI();
	
}

function updateUI(){
	
	var index  = $('#timeslider').slider('getValue');
	
	var date = am.timeline[index];
	var articles = am.getArticlesInDate(date);
	var manifestaciones = $('.manifestacion');

	var manidiv = manifestaciones.first().clone();

	$('#manifestaciones').empty();

	var year  = date.substring(0,4);
	var month = date.substring(4,6);
	var day   = date.substring(6,8); 

	$('#date').text(day+'/'+month+'/'+year);

	for(var i=0;i<articles.length;i++){
	
		var article = articles[i];
		var manifestacion = manidiv.clone();
		
		manifestacion.find('.title>a').text(article['title']).attr("href", article['url']);
		//manifestacion.find('.summary').text(article['subtitles'][0] || "");
		manifestacion.find('.place').text(article['place'].join(','));
		
		
		manifestacion.find('.tags').empty();
		for(var j=0;j<article.tags.length;j++){
			var tagName = am.tagNames[article['tags'][j]];
			var spanTag = $('<span />').addClass('label').addClass(' label-info').html(tagName);
			manifestacion.find('.tags').append(spanTag);		
		}
		manifestacion.find('.things').empty();
		if('things' in article){
		
			for(var thingId in article.things){
				
				var thingName = am.things[thingId];
				var spanTag = $('<span />').addClass('label').addClass(' label-success').html(thingName+':'+article.things[thingId]);
				
				manifestacion.find('.tags').append(spanTag);	

			}

		}


		$('#manifestaciones').append(manifestacion);
	}		
}

