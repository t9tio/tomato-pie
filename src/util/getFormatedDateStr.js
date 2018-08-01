const dateFormat = require('dateformat');

/**
 * get date str from date object
 * @param date {Date} date obj
 */
function getFormatedDateStr(date) {
    return dateFormat(new Date(date), "yyyy-mm-dd");
}

// Basic usage
export default getFormatedDateStr;

// console.log(getFormatedDateStr(new Date()))