
'use strict'

module.exports = class Validator {

	constructor() {
		return this
	}
	/**
     * Function to check a given string to ensure it's only multiple words and only alphanumberic
     *
     * @name checkMultipleWordsOnlyAlphaNumberic
     * @param test The string to test
	 * @throws If test is undefined or empty
     * @returns true if it matches regex
     *
     */
	checkMultipleWordsOnlyAlphaNumberic(test) {
		if(test === undefined || test.length === 0) {
			return false
		}
		const regex = new RegExp('^[a-zA-Z0-9 ,."!\'\-]*$')
		return regex.test(test)
	}


}
