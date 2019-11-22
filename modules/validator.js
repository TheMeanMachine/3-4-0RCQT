
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
		if(test === null || test === undefined || test.length === 0) {
			return false
		}
		const regex = new RegExp('^[a-zA-Z0-9 ,."!\'\-]*$')
		return regex.test(test)
	}

	/**
     * Function to check an ID
     *
     * @name checkID
     * @param ID the ID to check
	 * @param name the name to use in error messages
	 * @throws if ID is undefined, null or not a number
	 * @returns true if successful
     */
	checkID(ID, name) {
		if(ID === undefined || ID === null || isNaN(ID)) {
			throw new Error(`Must supply ${name}`)
		}
		return true
	}

	/**
     * Function to check if string exists
     *
     * @name checkStringExists
     * @param test the test to check
	 * @param name the name to use in error messages
	 * @throws if test is null, undefined or length is 0
	 * @returns true if successful
     */
	checkStringExists(test, name) {
		if(test === null || test === undefined || test.length === 0) {
			throw new Error(`Must supply ${name}`)
		}
		return true
	}
}
