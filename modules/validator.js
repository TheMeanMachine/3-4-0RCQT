
'use strict'

module.exports = class Validator {

    constructor(){
        return this;
    }

    check_MultipleWordsOnlyAlphaNumberic(string){
        if(string.length === 0){
            return false;
        }
        let regex = new RegExp(`^[a-zA-Z0-9 ,."!'\-]*$`);
        return regex.test(string);
    }

    check_FirstName(string){
        let regex = `/^[A-Za-z0-9 ,.'-]+$/i`
    }
}