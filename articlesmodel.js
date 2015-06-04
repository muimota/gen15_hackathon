
function ArticlesModel(data,minTagCardinality,maxTagCardinality){
	

	this.indexedArticles = data['articles'];
	this.tagNames 		 = data['tagNames'];
	this.tagMap   		 = data['tagMap'];
	this.things	  		 = data['things'];

	this.minTagCardinality = minTagCardinality|0;
	this.maxTagCardinality = maxTagCardinality|999999;

	this.articles = [];
	this.datedArticles = {};
	this.timeline = [];

	this.length   = 0;

	//create dateArticles and timeline
	var date = "00000000"
	for(var i  in this.indexedArticles) {
		this.length++;
		var article = this.indexedArticles[i];

		this.articles.push(article);
		
		if(date != article['date']){
			date = article['date'];
			this.timeline.push(date)
			this.datedArticles[date] = [article];	
		}else{
			this.datedArticles[date].push(article);	
		}
	}
	this.timeline.sort();

	//create tagMap
	var tagMap = {}
	for(tagId in this.tagMap){
		var tagCount = this.tagMap[tagId].length;
		if(tagCount<=this.minTagCardinality || tagCount>=this.maxTagCardinality){
			continue;
		}
		var taggedArticles = []
		for(var i=0;i<this.tagMap[tagId].length;i++){
			var articleIndex = this.tagMap[tagId][i];
			if(articleIndex in this.indexedArticles){
				taggedArticles.push(articleIndex);
			}
		}
		if(taggedArticles.length>0){
			tagMap[tagId] = taggedArticles;
		}
	}
	this.tagMap = tagMap;

}

ArticlesModel.formatDate = function(date){
	var year  = date.substring(0,4);
	var month = date.substring(4,6);
	var day   = date.substring(6,8);
	return day + '/'+month+'/'+year;

}


ArticlesModel.sortTagStats = function(tagStats,maxcount){
	
	var tagIds = [],tagId;
	var tagCounts = []

	for(tagId in tagStats){
		tagCount = tagStats[tagId];
		tagCounts.push(tagCount);
	}
	
	if(maxcount==undefined){
		maxcount = tagCounts.length;
	}

	//http://www.w3schools.com/jsref/jsref_sort.asp
	tagCounts = tagCounts.sort(function(a, b){return b-a});
	
	for(var i=0;i<maxcount && i<tagCounts.length;i++){
		
		for(tagId in tagStats){
			if(tagStats[tagId] == tagCounts[i] && tagIds.indexOf(tagId) == -1){
				tagIds.push(tagId);
				break;
			}
		}
	}

	return tagIds;
}


ArticlesModel.prototype.getArticlesInDate = function(date){

	return this.datedArticles[date];
}


ArticlesModel.prototype.getArticlesInDateRange = function(startDate,endDate){
	
	var articles = {};
	var date;

	for(var i in this.indexedArticles ){
		var article = this.indexedArticles[i]
		date = article['date'];

		if(date >= startDate){
			
			if(date > endDate){
				break;
			}
		
			articles[i] = article;
			
		}

	}
	
	return new ArticlesModel({'articles':articles,'tagNames':this.tagNames,'tagMap':this.tagMap,'things':this.things});
}

ArticlesModel.prototype.getArticlesWithTagIds = function(tagIds){

	var articles = {}
	var date,article,tagId;
	
	for(var i in this.articles ){
			
		article = this.articles[i];
		
		for(var k = 0 ; k < tagIds.length ; k++ ){
			
			tagId = tagIds[k];

			if(article['tags'].indexOf(tagId) != -1){
				
					articles[i] = article;
					break;
				
			}
		}
	}

	return new ArticlesModel({'articles':articles,'tagNames':this.tagNames,'tagMap':this.tagMap,'things':this.things});
}

ArticlesModel.prototype.getArticlesWithTags = function(tags){
	
	var tagIds=[];
	var tagId;

	for(var i = 0 ; i < tags.length ; i++ ){
		tagId = this.tagNames.indexOf(tags[i]);
		if(tagId != -1){
			tagIds.push(tagId);
		}
	}
	return this.getArticlesWithTagIds(tagIds);

}

//return tags count of tags present in the model {tagId0:tagCount0,...,tagIdn:tagCountn }

ArticlesModel.prototype.getTagStats = function(){
	
	var date;
	var article,articleTags;
	var tagStats = {};
	

	for(var tagId in this.tagMap){
		tagStats[tagId]=this.tagMap[tagId].length;
	}

	return tagStats;
}