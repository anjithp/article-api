class PersistenceError extends Error {
	constructor(message) {
	  super(message); 
	  this.name = "PersistenceError";
	}
}

module.exports = PersistenceError;
