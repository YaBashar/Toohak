/*
/////////////////////////////////////////////////////////////////////////////
//////////////////////   TOOHAK ITERATION 2 'QUESTION.TS'  ////////////////////////
///////////////////////////////////////////////////////////////////////////////

COMP1531 24T2 --- Major Project: `Toohak',
<https://nw-syd-gitlab.cseunsw.tech/COMP1531/24T2/groups/W11A_
CRUNCHIE/project-backend/-/blob/master/README.md>

This program was written by
z5478214 | z5599894 | z5525050 | z5362173 | z5478980
on 04/06/2024

quiz.js contains the functions for the implementation of question mechanics
in the Toohak project. This includes functions that create, remove,
and update information regarding questions within a quiz.

*/// ///////////////////////////////////////////////////////////////////////////

// DEPENDENCIES

import { getData, setData } from './dataStore';
import { Answer, Question, QuestionId, ErrorResponse } from './interface';

/** [1] adminQuizQuestionCreate
  *
  * Transfers ownership of quiz to a different user
  *
  * @param {number} token - Id number representing a unique
  *                              identifier for the user
  * @param {number} quizid     - Id number representing a unique
  *                              identifier for the quiz
  * @param {Question} question -  interface
  * ...
  * @returns {number} questionId
  *
*/
export function adminQuizQuestionCreate(token: number, quizid: number, question: Question): ErrorResponse | { questionId: number } {
  const data = getData();
  const quizArr = data.quizzes;
  const userArr = data.users;
  const quiz = quizArr.find((q) => q.quizId === quizid);
  const user = userArr.find((user) => user.userId === token);

  if (!user) {
    return { error: 'Invalid Token' };
  }
  if (question.question.length < 5) {
    return { error: 'Question is less than 5 characters' };
  }
  if (question.question.length > 50) {
    return { error: 'Question is more than 50 characters' };
  }
  if (question.answers.length > 6) {
    return { error: 'Question has more than 6 answers' };
  }
  if (question.answers.length < 2) {
    return { error: 'Question has less than 2 answers' };
  }
  if (question.duration < 0) {
    return { error: 'Question duration is not a positive number' };
  }
  if (question.duration > 180) {
    return { error: 'Sum of question durations in quiz exceeds 3 minutes' };
  }
  if (question.points < 1) {
    return { error: 'Question points are less than 1' };
  }
  if (question.points > 10) {
    return { error: 'Question points are more than 10' };
  }
  // in answers array there are 2 answers, we need to check every answer and
  // check its length if its less than 1 or not
  if (question.answers.some((answer) => answer.answer.length < 1)) {
    return { error: 'Answer is less than 1 character' };
  }

  if (question.answers.some((answer) => answer.answer.length > 30)) {
    return { error: 'Answer is more than 30 characters' };
  }
  if (question.answers.some((answer) => question.answers.filter((a) => a.answer === answer.answer).length > 1)) {
    return { error: 'Answers are duplicates' };
  }
  if (!question.answers.some(answer => answer.correct)) {
    return { error: 'No correct answers' };
  }
  if (!quiz) {
    return { error: 'Quiz does not exist' };
  }
  if (quiz.userId !== token) {
    return { error: 'Quiz Id not owned by the user' };
  }

  const id = uniqueQuestionId(quiz.questions);
  const questionBody = {
    questionId: id,
    question: question.question,
    duration: question.duration,
    points: question.points,
    answers: question.answers
    // Set the answer id in answer and we have to set a random colour for each answer
  };
  quiz.questions.push(questionBody);
  setData(data);
  return { questionId: id };
}

/** [2] adminQuizQuestion Duplicate
  *
  * Duplicates a question within the same Quiz
  *
  * @param {number} token - Id number representing a unique
  *                              identifier for the user
  * @param {number} quizId     - Id number representing a unique
  *                              identifier for the quiz
  * @param {string} questionId - Id number representing a unique
  *                              identifier for the quiz question
  * ...
  * @returns {number} newQuestionId - a new Question id for the duplicated question to differentiate it
  *
*/

export function adminQuizQuestionDuplicate(token : number, quizId: number, questionId: number): QuestionId | ErrorResponse {
  const store = getData();

  const userArr = store.users;
  const quizArr = store.quizzes;

  const user = userArr.find(user => user.userId === token);
  if (!user) {
    return { error: 'Invalid User id' };
  }
  const quizUser = quizArr.find((quiz) => quiz.userId === token);
  if (!quizUser) {
    return { error: 'Quiz Id not owned by the user' };
  }

  const findQuiz = quizArr.findIndex(quiz => quiz.quizId === quizId);
  if (findQuiz === -1) {
    return { error: 'Invalid Quiz id' };
  }
  const quiz = store.quizzes[findQuiz];

  const findQuestion = store.quizzes[findQuiz].questions.findIndex(question => question.questionId === questionId);
  if (findQuestion === -1) {
    return { error: 'Question id does not refer to valid question in quiz' };
  }

  const question = quizArr[findQuiz].questions[findQuestion];
  const newQuestionId = uniqueQuestionId(quiz.questions);

  quiz.timeLastEdited = Math.round(Date.now() / 1000);

  const duplicatedQuestion = {
    questionId: newQuestionId,
    question: question.question,
    duration: question.duration,
    points: question.points,
    answers: question.answers
  };

  quiz.questions.push(duplicatedQuestion);
  setData(store);
  return { questionId: newQuestionId };
}

/** [3] adminQuizQuestionDelete
  *
  * Duplicates a question within the same Quiz
  *
  * @param {number} token - Id number representing a unique
  *                              identifier for the user
  * @param {number} quizId     - Id number representing a unique
  *                              identifier for the quiz
  * @param {string} questionId - Id number representing a unique
  *                              identifier for the quiz question
  * ...
  * @returns {} - empty object
  *
*/
export function adminQuizQuestionDelete(token: number, quizId: number, questionId: number): Record<string, never> | ErrorResponse {
  const store = getData();
  const quizArr = store.quizzes;
  const userArr = store.users;
  const quiz = quizArr.find((quiz) => quiz.quizId === quizId);
  const user = userArr.find((user) => user.userId === token);

  if (!user) {
    return { error: 'Invalid Token' };
  }
  if (!quiz) {
    return { error: 'Invalid Quiz Id' };
  }
  if (quiz.userId !== token) {
    return { error: 'Quiz Id not owned by the user' };
  }
  const question = quiz.questions.find((question: Question) => question.questionId === questionId);
  if (!question) {
    return { error: 'Invalid Question Id' };
  }
  const index = quiz.questions.indexOf(question);
  quiz.questions.splice(index, 1);
  setData(store);
  return {};
}

// function to create a random id everytime
function uniqueQuestionId(questArr: Question[]): number {
  let uId: number;
  do {
    uId = Date.now();
  } while (questArr.find(quiz => (quiz.questionId === uId)));
  return uId;
}

/** [4] adminQuizQuestionUpdate
  *
  * Duplicates a question within the same Quiz
  *
  * @param {number} token - Id number representing a unique
  *                              identifier for the user
  * @param {number} quizId     - Id number representing a unique
  *                              identifier for the quiz
  * @param {string} questionId - Id number representing a unique
  *                              identifier for the quiz question
  * ...
  * @returns {} - empty object
  *
*/
export function adminQuizQuestionUpdate (token: number, quizId: number, questionId: number,
  questionBody:
    {
      question: string,
      duration: number,
      points: number,
      answers:Answer[]
    }
) : Record<string, never> | { error: string } {
  const data = getData();
  const user = data.users.find(user => user.userId === token);

  if (!user) {
    return { error: 'invalid token' };
  }
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (quizIndex === -1) {
    return { error: 'quiz does not exist for this user' };
  }
  const quiz = data.quizzes[quizIndex];
  if (!quiz) {
    return { error: 'quiz does not exist for this user' };
  }

  if (quiz.userId !== token) {
    return { error: 'quiz does not exist for this user' };
  }

  if (!doesQuestionExistInQuiz(quiz.questions, questionId)) {
    return { error: 'question id does not exist in this quiz' };
  }

  const question = quiz.questions.find(question => question.questionId === questionId);
  const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId);
  if (!question) {
    return { error: 'question id does not exist in this quiz' };
  }

  if (questionBody.question.length < 5) {
    return { error: 'question is too short' };
  }
  if (questionBody.question.length > 50) {
    return { error: 'question is too long' };
  }
  if (questionBody.answers.length > 6) {
    return { error: 'question has too many answers' };
  }
  if (questionBody.answers.length < 2) {
    return { error: 'question does not have enough answers' };
  }
  if (questionBody.duration < 0 || typeof (questionBody.duration) !== 'number') {
    return { error: 'duration is not a positive number' };
  }
  let duration = 0;

  // Iterate over the questions array to sum up the durations
  for (let i = 1; i < quiz.questions.length; i++) {
    duration += quiz.questions[i].duration;
  }
  duration -= question.duration;
  duration += questionBody.duration;

  if (duration > 180) {
    return { error: 'total duration of quiz is too long' };
  }
  if (questionBody.points < 1 || typeof (questionBody.points) !== 'number') {
    return { error: 'points is not a positive number' };
  }
  if (questionBody.points > 10) {
    return { error: 'points awarded is too big' };
  }
  if (questionBody.answers.some((answer) => answer.answer.length < 1)) {
    return { error: 'answer is too short' };
  }
  if (questionBody.answers.some((answer) => answer.answer.length > 30)) {
    return { error: 'answer is too long' };
  }
  if (questionBody.answers.some((answer) => questionBody.answers.filter((a) => a.answer === answer.answer).length > 1)) {
    return { error: 'question contains a duplicate answer' };
  }
  if (!questionBody.answers.some(answer => answer.correct)) {
    return { error: 'no correct answer for this question' };
  }

  const quest: Question = quiz.questions[questionIndex];
  quest.question = questionBody.question;
  quest.duration = questionBody.duration;
  quest.points = questionBody.points;
  quest.answers = questionBody.answers;
  quiz.timeLastEdited = Math.round(Date.now() / 1000);

  setData(data);
  return {};
}

/** [5] adminQuizQuestionMove
  *
  * Duplicates a question within the same Quiz
  *
  * @param {number} token - Id number representing a unique
  *                              identifier for the user
  * @param {number} questionId    - Id number representing a unique
  *                              identifier for the question
  * @param {string} newPosition - newPosition
  *
  * ...
  * @returns {} - empty object
  *
*/
export function adminQuizQuestionMove(token: number, quizId: number, questionId: number, newPosition: number): Record<string, never> | ErrorResponse {
  const data = getData();
  const user = data.users.find(user => user.userId === token);

  if (!user) {
    throw new Error('invalid token');
  }

  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (quizIndex === -1) {
    throw new Error('quiz does not exist for this user');
  }

  const quiz = data.quizzes[quizIndex];
  if (!quiz) {
    throw new Error('quiz does not exist for this user');
  }

  if (quiz.userId !== token) {
    throw new Error('quiz does not exist for this user');
  }

  if (!doesQuestionExistInQuiz(quiz.questions, questionId)) {
    throw new Error('question id does not exist in this quiz');
  }

  const question = quiz.questions.find(question => question.questionId === questionId);
  if (!question) {
    throw new Error('question id does not exist in this quiz');
  }

  if (newPosition < 0) {
    throw new Error('position value is less than zero');
  }

  if (quiz.questions.indexOf(question) === newPosition) {
    throw new Error('new position is current position');
  }

  if (newPosition > quiz.questions.length - 1) {
    throw new Error('new position is too big');
  }

  quiz.timeLastEdited = Math.round(Date.now() / 1000);
  quiz.questions.splice(quiz.questions.indexOf(question), 1);
  quiz.questions.splice(newPosition, 0, question);
  setData(data);
  return {};
}

// Helper function to check if a question exists in the quiz
function doesQuestionExistInQuiz(quesArr: Question[], questionId: number | {error: string}): boolean {
  return quesArr.some(question => question.questionId === questionId);
}
