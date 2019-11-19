
'use strict'

module.exports = class Validator {

	constructor() {
		return this
	}

	checkMultipleWordsOnlyAlphaNumberic(test) {
		if(test === undefined || test.length === 0) {
			return false
		}
		const regex = new RegExp('^[a-zA-Z0-9 ,."!\'\-]*$')
		return regex.test(test)
	}


}
