/** [11] adminQuizDescriptionUpdate
  * 
  * Update The description of the relevant quiz.
  * 
  * @param {number} authUserId - Id number representing a unique 
  *                              identifier for the user
  * @param {number} quizId     - Id number representing a unique
  *                              identifier for the quiz
  * @param {string} description - a string containing the current
  *                               description of the quiz
  * ...
  * @returns {} - empty object if successful
  * 
*/

function adminQuizDescriptionUpdate(authUserId, quizId, description) {
  if (!Number.isInteger(authUserId) || authUserId <= 0) {
    return { error: "Invalid user ID" };
  }

  if (!Number.isInteger(quizId) || quizId <= 0) {
    return { error: "Invalid quiz ID" };
  }

  if (description === undefined) {
    return { error: "Quiz description is required" };
  }

  if (typeof description !== 'string') {
    return { error: "Quiz description must be text" };
  }

  if (description.length === 0) {
    return { error: "Quiz description cannot be empty" };
  }

  if (description.length > 100) {
    return { error: "Quiz description is more than 100 characters in length" };
  }

  return {
    };
  }