// Function 6
/** adminQuizList
* <Gets all of the relevant information about the current quiz.>
* @param {integer} authUserId - integer representing the user
* ...
* @returns {array} quizzes - an array containing all of the quizzes owned by the currently logged in user
* @returns {integer} quizid - the numerical id for each quiz
* @returns {string} name - the name of each quiz
*/

function adminQuizList(authUserId) {
  return {
    quizzes: [
      {
        quizId: 1,
        name: 'My Quiz',
      }
    ]
  }
}

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

//Mubashir Function 10
/**adminQuizNameUpdate
* <Update the name of the relevant quiz.>
* @param {integer} authUserId - description of paramter
* @param {integer} quizId - description of parameter
* @param {string} name
* ...
* @returns {} - empty object
*/
function adminQuizNameUpdate ( authUserId, quizId, name) {

    return {

    }
}
      
function adminQuizRemove(authUserId, quizId) {
    // empty object
}

// Nafis Function 11
/**adminQuizDescriptionUpdate
 * <Update the description of the relevant quiz.>
 * @param {integer} authUserId - the account user id for the author of a kahoot quiz
 * @param {integer} quizId - the numerical id for each Kahoot quiz
 * @param  {string} description - the description of each quiz
 *  ...
 * @returns {} - empty object
 */
function adminQuizDescriptionUpdate (authUserId, quizId, description) {

  return {

  }
}