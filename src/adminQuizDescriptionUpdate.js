/** [6] adminQuizDescriptionUpdate
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
    return { error: "Description is required" };
  }

  if (typeof description !== 'string' || description.length > 100) {
    if (description.length > 100) {
      return { error: "Description is more than 100 characters in length" };
    } else {
      return { error: "Invalid description type" };
    }
  }

  return {
    };
  }dd