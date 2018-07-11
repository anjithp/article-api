'use strict';

let AWS = require('aws-sdk');
AWS.config.update({
	region: 'ap-southeast-2'
});

let elasticsearch = require('elasticsearch');
let esClient = new elasticsearch.Client({
	host: process.env.DB_ENDPOINT,
	connectionClass: require('http-aws-es'),
});

let uuid = require('uuid');

let PersistenceError = require('./persistence.error.js');

/**
 * Indexes document in to the database.
 * 
 * @param {object} doc document to be indexed
 * @param {string} indexName name of search index
 * 
 * @return {object} indexed document
 */
module.exports.indexDocument = async (doc, indexName) => {
	let id = uuid.v1();
	try {
		doc.id = id;
		let indexReq = {
			index: indexName,
			type: '_doc',
			refresh: 'true',
			id: id,
			body: doc
		};

		await esClient.index(indexReq);
		console.log(`Successfully indexed document with the id ${id}.`);
		return doc;
	} catch (e) {
		console.log(`Error occurred while indexing document with the id ${id}. Error is: ` + e);
		throw new PersistenceError(prepareErrorMessage(e));
	}
};

/**
 * Indexes document in to the database.
 * 
 * @param {string} id identifier of the document to be retrieved
 * @param {string} indexName name of search index
 * 
 * @return {object}  document from the database
 */
module.exports.getDocument = async (id, indexName) => {
	try {
		let response = await esClient.get({
			index: indexName,
			type: '_doc',
			id: id
		});
		return response['_source'];
	} catch (e) {
		console.log(`Error occurred while getting document with the id ${id}. Error is: ` + e);
		throw new PersistenceError(prepareErrorMessage(e));
	}
};

/**
 * Seaches for documents matching the given query.
 * 
 * @param {object} query search query
 * @param {string} indexName name of search index
 * 
 * @return {object} list of matching documents
 */
module.exports.searchDocuments = async (query, indexName) => {
	try {
		const searchResponseFromDb = await esClient.search({
			index: indexName,
			body: query
		});
		let response = { total: searchResponseFromDb.hits.total, hits: [] };
		searchResponseFromDb.hits.hits.forEach(hit => {
			response.hits.push(hit['_source']);
		});
		return response;
	} catch (e) {
		console.log(`Error occurred while searching documents. Error is: ` + e);
		throw new PersistenceError(prepareErrorMessage(e));
	}
};

const prepareErrorMessage = (error) => {
	let errorMessage = '';
	if (error && error.statusCode === 400) {
		errorMessage = 'Invalid request body or query or path parameters.';
	} else if (error && error.statusCode === 404) {
		errorMessage = 'Invalid id. Given identifier does not exist in the system';
	} else {
		errorMessage = 'Internal error occurred while processing request.';
	}
	return errorMessage;
};
