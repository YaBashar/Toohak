///////////////////////////////////////////////////////////////////////////////
//////////////////////   TOOHAK ITERATION 0 'QUIZ.JS'  ////////////////////////
///////////////////////////////////////////////////////////////////////////////

import { getData, setData } from "./dataStore";

/*

	COMP1531 24T2 --- Major Project: `Toohak', 
	<https://nw-syd-gitlab.cseunsw.tech/COMP1531/24T2/groups/W11A_
  CRUNCHIE/project-backend/-/blob/master/README.md>

	This program was written by 
  z5478214 | z5599894 | z5525050 | z5362173 | z5478980
  on 04/06/2024

	quiz.js contains the stub functions for the implementation of quiz mechanics
  in the Toohak project. This includes functions that create, remove, list
  and update information regarding quizzes. 
	
*/


///////////////////////////////////////////////////////////////////////////////
/////////////////////////   GLOBAL DECLARATIONS    ////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/*
DEPENDENCIES
*/

/*
GLOBAL DEFINITIONS
*/

/*
DATA STRUCTURES
*/


///////////////////////////////////////////////////////////////////////////////
//////////////////////////   FUNCTION CONTENTS    /////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// adminQuizList: [1]
// adminQuizCreate: [2]
// adminQuizRemove: [3]
// adminQuizInfo: [4]
// adminQuizNameUpdate: [5]
// adminQuizDescriptionUpdate: [6]


///////////////////////////////////////////////////////////////////////////////
//////////////////////////////   FUNCTIONS   //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/** [1] adminQuizList
  * 
  * Provides a list of all quizzes that are owned by the currently 
  * logged in user.
  * 
  * @param {number} authUserId - number representing a unique 
  *                              identifier for the user
  * ...
  * @returns {
  *   quizzes : [
  *     {
  *      quizId: number,
  *      name: string,
  *     }
  *   ]
  * } - an array containing the names of all quizzes and their quizIds
  * 
*/

export function adminQuizList(authUserId) {
  return {
    quizzes: [
      {
        quizId: 1,
        name: 'My Quiz',
      },
    ]
  };
}



/** [2] adminQuizCreate
  * 
  * Given basic details about a new quiz, create one for the logged in user.
  * 
  * @param {number} authUserId - number representing a unique 
  *                              identifier for the user 
  * @param {number} quizId - number representing a unique 
  *                          identifier for the quiz
  * @param {string} description - string containing description of the quiz
  * ...
  * @returns {quizId: number} - number representing a unique 
  *                             identifier for the quiz 
  * 
*/
export function adminQuizCreate(authUserId, name, description) {
  let store = getData();
  let userArr = store.users;
  let quizArr = store.quizzes;
  const user = userArr.find((user) => user.authUserId === authUserId);
  if (!user) return {error: 'Invalid User id'};
  
  const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '+', '=', '{', '}', '[', ']', 
                        ':', ';', '-', '"', "'", '<', '>', '.', '?', '/', '|', '\\'];
  for (let i = 0; i < specialChars.length; i++) {
    if (name.includes(specialChars[i])) {
      return { error: 'Name contains invalid characters' };
    }
  }
  if (name.length < 3) {
    return { error: 'name is less than 3 characters' };
  }
  if (name.length > 30) {
    return { error: 'name is more than 30 characters' };
  }
  if (description.length > 100) {
    return { error: 'Description is more than 100 characters in length' };
  }
  if (quizArr.find((quiz) => quiz.name === name && quiz.authUserId === authUserId)) {
    return { error: 'Name is already used by current logged in user' };
  }
  
  const id = quizArr.length + 1;
  const quiz = {
    quizId: id,
    name: name,
    description: description,
    authUserId: authUserId,
  };
  store.quizzes.push(quiz);
  setData(store);
  return { quizId: id };
}



/** [3] adminQuizRemove
  * 
  * Given a particular quiz, permanently remove the quiz.
  * 
  * @param {number} authUserId - number representing a unique 
  *                              identifier for the user  
  * @param {number} quizId - number representing a unique 
  *                          identifier for the quiz  
  * ...
  * @returns {} - empty object
  * 
*/

export function adminQuizRemove(authUserId, quizId) {
  let store = getData();
  let quizArray = store.quizzes;
  let userArray = store.users;
  let user = userArray.find(user => user.authUserId === authUserId);
  let quiz = quizArray.find(quiz => quiz.quizId === quizId);
  if (!user) {
    return { error: 'Invalid user id' };
  }
  if (!quiz) {
    return { error: 'Invalid quiz Id entered' };
  }
  if (quiz.authUserId !== authUserId) {
    return { error: 'Quiz Id not owned by the user' };
  }
  let index = quizArray.indexOf(quiz);
  quizArray.splice(index, 1);
  store.quizzes = quizArray;
  setData(store);
  return {};
}



/** [4] adminQuizInfo
  * 
  * Gets all of the relevant information about the current quiz.
  * 
  * @param {number} authUserId - number representing a unique 
  *                              identifier for the user   
  * @param {number} quizId - number representing a unique 
  *                          identifier for the quiz 
  * ...
  * @returns {
  *   quizId: number,
  *   name: string,
  *   timeCreated: number,
  *   timeLastEdited: number,
  *   description: string,
  * } - an object with information about the quiz based on the quizId
  * 
*/

export function adminQuizInfo(authUserId, quizId) {
  let store = getData();
  let userArr = store.users;
  let quizArr = store.quizzes;

  const quiz = quizArr.find((quiz) => quiz.quizId === quizId);
  const user = userArr.find((user) => user.authUserId === authUserId);
  const userQuiz = quizArr.find((quiz) => quiz.authUserId === authUserId);

  if (!quiz ) {
    return {error: "Invalid Quiz id"};
  } else if (!user) {
    return {error: "Invalid User id"};
  } else if (!userQuiz) {
    return {error : "This Quiz Id does not refer to a quiz that this user owns"}
  }

  return {
    quizId: quizId,
    name: quiz.name,
    timeCreated: 1683125870,
    timeLastEdited: 1683125871,
    description: quiz.description
  };
}



/** [5] adminQuizNameUpdate
  * 
  * Update the name of the relevant quiz.
  * 
  * @param {number} authUserId - number representing a unique 
  *                              identifier for the user 
  * @param {number} quizId - number representing a unique 
  *                          identifier for the quiz 
  * @param {string} name - string containing the current name of the quiz
  * ...
  * @returns {} - empty object
  * 
*/

export function adminQuizNameUpdate(authUserId, quizId, name) {
  let store = getData();
  let userArr = store.users;
  let quizArr = store.quizzes;

  const quiz = quizArr.find(quiz => quiz.quizId === quizId);
  const user = userArr.find(user => user.authUserId === authUserId);
  
  if (!quiz ) {
    return {error : "Invalid Quiz id"};
  } else if (!user) {
    return {error : "Invalid User id"};
  } else if (quizArr.some(quiz => quiz.name === name)) {
    return {error : "Quiz does not exist with name"};
  }

  quiz.name = name;
  setData(store);
  
  return {};

}


function checkName (name) {
  
  if (name === ' ') {
    return {error : "Name cannot be empty"};
  } else if (name.length <= 3) {
    return {error : "Name is too short"};
  } else if (name.length > 30) {
    return {error : "Name is too long"};
  } else if (/[!-\/:-@[-`{-~]/.test(name)) {
    return {error : "Quiz name cannot have symbols"};
  } 
}



/** [6] adminQuizDescriptionUpdate
  * 
  * Update The description of the relevant quiz.
  * 
  * @param {number} authUserId - number representing a unique 
  *                              identifier for the user
  * @param {string} description - a string containing the current
  *                               description of the quiz
  * ...
  * @returns {} - empty object
  * 
*/

export function adminQuizDescriptionUpdate(authUserId, quizId, description) {
  return {
  };
}

