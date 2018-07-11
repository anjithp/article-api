let dbClient = require('persistence');

exports.handler = async (event, context, callback) => {
	let articleToCreate = event.body;
	articleToCreate.lastUpdatedTime = Date.now();
	console.log(`Received request to create an article with the title ${articleToCreate.title}`);
	try {
		let createdArticle = await dbClient.indexDocument(articleToCreate, process.env.ARTICLE_INDEX_NAME);
		callback(null, createdArticle);
	} catch (e) {
		callback(e.message);
	}

};
