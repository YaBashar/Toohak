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
import { getData, setData } from "./dataStore";

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

function adminQuizList(authUserId) {
  return {
    quizzes: [
      {
        quizId: 1,
        name: 'My Quiz',
      },
    ]
  };
}

export {adminQuizList};

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
function adminQuizCreate(authUserId, name, description) {
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

export {adminQuizCreate};

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

function adminQuizRemove(authUserId, quizId) {
  return {
  };
}

export {adminQuizRemove};


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

function adminQuizInfo(authUserId, quizId) {
  return {
    quizId: 1,
    name: 'My Quiz',
    timeCreated: 1683125870,
    timeLastEdited: 1683125871,
    description: 'This is my quiz'
  };
}

export {adminQuizInfo};


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

  const quiz = quizArr.find(quiz => quiz.id === quizId);
  const user = userArr.find(user => user.id === authUserId);



  if (!quiz ) {
    return {error : "Invalid Quiz id"};
  }

  if (!user) {
    return {error : "Invalid User id"};
  }

  

  checkName(name);

  let modifiedQuiz = {
    quizId: quizId,
    name: name,
    description: 'the first quiz',
    timeCreated: 1683125870,
    timeLastEdited: 1683125871,
    authUserId: authUserId,
  };

  setData(modifiedQuiz);

  return {
  };
}

function checkName (name) {
  const findName = data.quizzes.find(quiz => quiz.name === name);
  if (findName === undefined) {
    return {error : "Invalid Quiz Name"}
  } else if (name === ' ') {
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

function adminQuizDescriptionUpdate(authUserId, quizId, description) {
  return {
  };
}

export {adminQuizDescriptionUpdate};
