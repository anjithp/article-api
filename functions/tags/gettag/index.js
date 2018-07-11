let fs = require("fs");

let dbClient = require('persistence');

exports.handler = async (event, context, callback) => {
		try {
			let tagName = event.tagName;
			let date = event.date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
			console.log(`Received request to get tag details with the name ${tagName} on date ${date}.`);
			let loadedTemplate = fs.readFileSync(__dirname + "/templates/gettag.json", "utf-8");
			let query = JSON.parse(loadedTemplate);
			setPropertyValue(query, 'tags', tagName);
			setPropertyValue(query, 'date', date);
			let matchingArticles = await dbClient.searchDocuments(query, process.env.ARTICLE_INDEX_NAME);
			let response = { tag: tagName, articles: [], related_tags: [] };
			response.count = matchingArticles.total;
			matchingArticles.hits.forEach(article => {
				response.articles.push(article.id);
				article.tags.forEach(rt => {
					if (rt !== tagName && !response.related_tags.includes(rt)) {
						response.related_tags.push(rt);
					}
				});
			});
			callback(null, response);
		} catch (e) {
			callback(e.message);
		}
};

const setPropertyValue = (obj, targetKey, targetValue) => {
	for (let k in obj) {
		if (typeof obj[k] == "object" && obj[k] !== null) {
			setPropertyValue(obj[k], targetKey, targetValue);
		}
		if (k === targetKey) {
			obj[targetKey] = targetValue;
		}
	}
};
