let dbClient = require('persistence');

exports.handler = async (event, context, callback) => {
	let articleId = event.id;
	console.log(`Received request to get an article with the id ${articleId}.`);
	try {
		let articleFromDb = await dbClient.getDocument(articleId, process.env.ARTICLE_INDEX_NAME);
		callback(null, articleFromDb);
	} catch (e) {
		callback(e.message);
	}

};
