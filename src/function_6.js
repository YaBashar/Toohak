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