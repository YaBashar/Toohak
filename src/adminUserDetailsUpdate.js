// Function 4
/** adminUserDetailsUpdate
* <Update the properties of the logged in admin user>
* @param {integer} authUserId - integer representing the user
* @param {string} email
* @param {string} nameFirst 
* @param {string} nameLast
*/
function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {
  return {
  }
}

// Function 5
/** adminUserPasswordUpdate
* <Update the password of the logged in user>
* @param {integer} authUserId - integer representing the user
* @param {string} oldPassword
* @param {string} newPassword 
*/
function adminUserPasswordUpdate(authUserId, oldPassword, newPassword) {
  return {
  }
}


// Function 6
/** adminQuizList
* <Gets all of the relevant information about the current quiz.>
* @param {integer} authUserId - integer representing the user
* ...
* @returns {} quizzes - an array containing all of the quizzes owned by the currently logged in user
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
