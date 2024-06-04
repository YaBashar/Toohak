function adminQuizCreate(authUserId, name, description) {
    quizId: 2
}

//Mubashir Function 9
/**adminQuizInfo
* <Gets all of the relevant information about the current quiz.>

* @param {integer} authUserId - description of paramter
* @param {integer} quizId - description of parameter
* ...
* @returns {integer} quizid - description of condition for return
* @returns {string} name - description of condition for return
* @returns {integer} timecreated
* @returns {integer} timeLastEdited
* @returns {string} description
*/

function adminQuizInfo (authUserId, quizId ) {
    return {
        quizId: 1,
        name: 'My Quiz',
        timeCreated: 1683125870,
        timeLastEdited: 1683125871,
        description: 'This is my quiz'
    }
}
      
function adminQuizRemove(authUserId, quizId) {
    // empty object
}
