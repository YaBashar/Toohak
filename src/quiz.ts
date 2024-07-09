/* /////////////////////////////////////////////////////////////////////////////
//////////////////////   TOOHAK ITERATION 1 'QUIZ.JS'  ////////////////////////
///////////////////////////////////////////////////////////////////////////////

COMP1531 24T2 --- Major Project: `Toohak',
<https://nw-syd-gitlab.cseunsw.tech/COMP1531/24T2/groups/W11A_
CRUNCHIE/project-backend/-/blob/master/README.md>

This program was written by
z5478214 | z5599894 | z5525050 | z5362173 | z5478980
on 04/06/2024

quiz.js contains the functions for the implementation of quiz mechanics
in the Toohak project. This includes functions that create, remove, list
and update information regarding quizzes.

*//// //////////////////////////////////////////////////////////////////////////

// DEPENDENCIES

import { getData, setData } from './dataStore.js';

/// ////////////////////////////////////////////////////////////////////////////

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
export function adminQuizList(authUserId: number) {
  const data = getData();
  const user = data.users.find(user => user.authUserId === authUserId);
  // const allQuizzes = [];

  if (!Number.isInteger(authUserId) || !user) {
    return { error: 'invalid user id' };
  }

  const userQuizzes = data.quizzes
    .filter(quiz => quiz.authUserId === authUserId)
    .map(quiz => ({
      quizId: quiz.quizId,
      name: quiz.name,
    }));

  return { quizzes: userQuizzes };
}

/** [2] adminQuizCreate
  *
  * Given basic details about a new quiz, create one for the logged in user.
  *
  * @param {number} authUserId - number representing a unique
  *                              identifier for the user
  * @param {number} name - string containing the name of the quiz
  *
  * @param {string} description - string containing description of the quiz
  * ...
  * @returns {quizId: number} - number representing a unique
  *                             identifier for the quiz
  *
*/

interface Answer {
  answerId: number;
  answer: string;
  colour: string;
  correct: boolean;
}

interface Question {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  answers: Answer[];
}

export interface Quiz {
  quizId: number;
  name: string;
  description: string;
  duration: number;
  timeCreated: number;
  timeLastEdited: number;
  numQuestions: number;
  questions: Question[];
  authUserId: number;
}

export function adminQuizCreate(authUserId: number | { error: string}, name: string, description: string): { quizId: number } | { error: string } {
  const store = getData();
  const userArr = store.users;
  const quizArr = store.quizzes;
  const user = userArr.find((user) => {
    return user.authUserId === authUserId;
  });

  if (!user) return { error: 'Invalid User id' };

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

  const id = uniqueId(quizArr);

  const quiz = {
    quizId: id,
    name: name,
    description: description,
    timeCreated: Math.round(Date.now() / 1000),
    timeLastEdited: Math.round(Date.now() / 1000),
    numQuestions: 0,
    questions: [Array],
    duration: 0,
    authUserId: authUserId,
  };
  store.quizzes.push(quiz);
  setData(store);
  return { quizId: id };
}

// function to create a random id everytime
function uniqueId(quizArr: { quizId: number }[]): number {
  let uId: number;
  do {
    uId = Date.now();
  } while (quizArr.find(quiz => (quiz.quizId === uId)));
  return uId;
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
export function adminQuizRemove(authUserId: number | { error: string }, quizId: number): Record<string, never> | { error: string } {
  const store = getData();
  const quizArray = store.quizzes;
  const userArray = store.users;
  const user = userArray.find((user) => { return user.authUserId === authUserId; });
  const quiz = quizArray.find((quiz) => { return quiz.quizId === quizId; });
  if (!user) {
    return { error: 'Invalid user id' };
  }
  if (!quiz) {
    return { error: 'Invalid quiz Id entered' };
  }
  if (quiz.authUserId !== authUserId) {
    return { error: 'Quiz Id not owned by the user' };
  }
  const index = quizArray.indexOf(quiz);
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

export interface QuizInfo {
  quizId: number,
  name: string,
  timeCreated: number, // Keeping as number for Unix timestamp
  timeLastEdited: number, // Keeping as number for Unix timestamp
  description: string,
  numQuestions: number,
  questions: {
    questionId: number,
    question: string,
    duration: number,
    points: number,
    answers: {
      answerId: number,
      answer: string,
      colour: string,
      correct: boolean
    }[]
  }[]
  duration : number
}

export function adminQuizInfo(authUserId: number | { error: string}, quizId: number): QuizInfo | { error: string} {
  const store = getData();
  const userArr = store.users;
  const quizArr = store.quizzes;

  const quiz = quizArr.find((quiz) => quiz.quizId === quizId);
  const user = userArr.find((user) => user.authUserId === authUserId);
  const userQuiz = quizArr.find((quiz) => quiz.authUserId === authUserId);

  if (!user) {
    return { error: 'Invalid User id' };
  } else if (!quiz) {
    return { error: 'Invalid Quiz id' };
  } else if (!userQuiz) {
    return { error: 'This Quiz Id does not refer to a quiz that this user owns' };
  }

  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions || 0, // Ensure numQuestions has a default value
    questions: Array.isArray(quiz.questions)
      ? quiz.questions.map((question: {
      questionId: number,
      question: string,
      duration: number,
      points: number,
      answers: {
        answerId: number,
        answer: string,
        colour: string,
        correct: boolean
      }[]
    }) => ({
        questionId: question.questionId,
        question: question.question,
        duration: question.duration,
        points: question.points,
        answers: Array.isArray(question.answers)
          ? question.answers.map((answer: {
        answerId: number,
        answer: string,
        colour: string,
        correct: boolean
      }) => ({
            answerId: answer.answerId,
            answer: answer.answer,
            colour: answer.colour,
            correct: answer.correct
          }))
          : []
      }))
      : [],
    duration: quiz.duration,
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

export function adminQuizNameUpdate(authUserId:number, quizId:number, name: string): Record<string, never> | { error: string} {
  const store = getData();
  const userArr = store.users;
  const quizArr = store.quizzes;

  const quiz = quizArr.find(quiz => quiz.quizId === quizId);
  const user = userArr.find(user => user.authUserId === authUserId);
  const findName = quizArr.find(quiz => quiz.name === name && quiz.authUserId === authUserId);
  const quizUser = quizArr.find((quiz) => quiz.authUserId === authUserId);

  if (!quiz) {
    return { error: 'Invalid Quiz id' };
  } else if (!user) {
    return { error: 'Invalid User id' };
  } else if (!quizUser) {
    return { error: 'Quiz Id not owned by the user' };
  } else if (findName) {
    return { error: 'Name is already used' };
  }

  if (name === ' ') {
    return { error: 'Name cannot be empty' };
  } else if (name.length <= 3) {
    return { error: 'Name is too short' };
  } else if (name.length > 30) {
    return { error: 'Name is too long' };
  } else if (/[!-:-@[-`{-~]/.test(name)) {
    return { error: 'Quiz name cannot have symbols' };
  }

  quiz.name = name;
  quiz.timeLastEdited = Math.round(Date.now() / 1000);
  setData(store);

  return {};
}

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

// My constant define for the 'Description is more than 100 characters' test case
const MAX_DESCRIPTION_LENGTH = 100;

export function adminQuizDescriptionUpdate(authUserId: number | { error: string}, quizId: number, description: string): Record<string, never> | { error: string } {
  const store = getData();
  const userArr = store.users;
  const quizArr = store.quizzes;

  // These two lines finds the Tahook user with both a valid userId and quidId
  const user = userArr.find((user) => user.authUserId === authUserId);
  const quiz = quizArr.find((quiz) => quiz.quizId === quizId);

  // Check if the quiz is owned by the user with the given UserId
  const quizUser = quizArr.find((quiz) => quiz.authUserId === authUserId);

  // Error messages returned if the error tests cases are activated within the program
  // If a person's Tahook quiz does not match the userId, an error will then be returned
  if (!quizUser) {
    return { error: 'Quiz Id not owned by the user' };
  }

  // If the description length exceeds 100 characters, return an error
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: 'Quiz description is more than 100 characters in length' };
  }

  // If the Tahook user does not exist, an error will then be returned
  if (!user) {
    return { error: 'authUserId does not exist' };

    // If a person's Tahook quiz does not exist, an error will then be returned
  } else if (!quiz) {
    return { error: 'Quiz Id not found' };
  } else {
    quiz.description = description;
    quiz.timeLastEdited = Math.round(Date.now() / 1000);
    setData(store);

    return {};
  }
}

export function adminQuizQuestionCreate(authUserId: number | { error: string }, quizid: number, question: Question): { error: string } | { questionId: number } {
  const data = getData();
  const quizArr = data.quizzes;
  const userArr = data.users;
  const quiz = quizArr.find((q) => q.quizId === quizid);
  const user = userArr.find((user) => user.authUserId === authUserId);

  if (!user) {
    return { error: 'Invalid Token' }
  }
  // Question string is less than 5 characters
  if (question.question.length < 5) {
    return { error: 'Question is less than 5 characters' };
  }
  // Question string is greater than 50 characters in length
  if (question.question.length > 50) {
    return { error: 'Question is more than 50 characters' };
  }
  // The question has more than 6 answers
  if (question.answers.length > 6) {
    return { error: 'Question has more than 6 answers' };
  }
  // The question has less than 2 answers
  if (question.answers.length < 2) {
    return { error: 'Question has less than 2 answers' };
  }
  // The question duration is not a positive number
  if (question.duration < 0) {
    return { error: 'Question duration is not a positive number' };
  }
  // The sum of the question durations in the quiz exceeds 3 minutes
  if (question.duration > 180) {
    return { error: 'Sum of question durations in quiz exceeds 3 minutes' };
  }
  // The points awarded for the question are less than 1
  if (question.points < 1) {
    return { error: 'Question points are less than 1' };
  }
  // The points awarded for the question are greater than 10
  if (question.points > 10) {
    return { error: 'Question points are more than 10' };
  }
  // The length of any answer is shorter than 1 character long
  // in answers array there are 2 answers, we need to check every answer and check its length if its less than 1 or not
  if (question.answers.some((answer) => answer.answer.length < 1)) {
    return { error: 'Answer is less than 1 character' };
  }
  // The length of any answer is longer than 30 characters long
  if (question.answers.some((answer) => answer.answer.length > 30)) {
    return { error: 'Answer is more than 30 characters' };
  }
  // Any answer strings are duplicates of one another (within the same question)
  if (question.answers.some((answer) => question.answers.filter((a) => a.answer === answer.answer).length > 1)) {
    return { error: 'Answers are duplicates' };
  }
  // There are no correct answers 
  if (!question.answers.some(answer => answer.correct)) {
    return { error: 'No correct answers' };
  }
  // test to check quiz Id does not refer to a valid quiz
  if (!quiz) {
    return { error: 'Quiz does not exist' };
  }
  // test to check if quiz ID does not refer to a quiz that this user owns
  if (quiz.authUserId !== authUserId) {
    return { error: 'Quiz Id not owned by the user' };
  }
  
  const id = uniqueId(quiz.questions);
  console.log(id);
  const questionBody = {
    questionId: id,
    question: question.question,
    duration: question.duration,
    points: question.points,
    answers: question.answers
  }
  quiz.questions.push(questionBody);
  setData(data);
  return { questionId: id };
}
