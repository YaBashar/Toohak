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
import { findUserByToken, checkQuizOwnership, findQuizIndexFromQuizId, findQuestionIndex, createQuestionId } from './helper';

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
export function adminQuizQuestionCreate(token: number, quizid: number, question: Question, isVersion2: boolean): ErrorResponse | { questionId: number } {
  const data = getData();
  const quizArr = data.quizzes;
  const userArr = data.users;
  const quiz = quizArr.find((q) => q.quizId === quizid);
  const user = userArr.find((user) => user.userId === token);

  if (!user) {
    throw new Error('Invalid Token');
  }
  if (question.question.length < 5) {
    throw new Error('Question is less than 5 characters');
  }
  if (question.question.length > 50) {
    throw new Error('Question is more than 50 characters');
  }
  if (question.answers.length > 6) {
    throw new Error('Question has more than 6 answers');
  }
  if (question.answers.length < 2) {
    throw new Error('Question has less than 2 answers');
  }
  if (question.duration < 0) {
    throw new Error('Question duration is not a positive number');
  }
  if (question.duration === 0) {
    throw new Error('Question duration is 0');
  }
  if (question.duration > 180) {
    throw new Error('Sum of question durations in quiz exceeds 3 minutes');
  }
  if (question.points < 1) {
    throw new Error('Question points are less than 1');
  }
  if (question.points > 10) {
    throw new Error('Question points are more than 10');
  }
  // in answers array there are 2 answers, we need to check every answer and
  // check its length if its less than 1 or not
  if (question.answers.some((answer) => answer.answer.length < 1)) {
    throw new Error('Answer is less than 1 character');
  }
  if (question.answers.some((answer) => answer.answer.length > 30)) {
    throw new Error('Answer is more than 30 characters');
  }
  if (question.answers.some((answer) => question.answers.filter((a) => a.answer === answer.answer).length > 1)) {
    throw new Error('Answers are duplicates');
  }
  if (!question.answers.some(answer => answer.correct)) {
    throw new Error('No correct answers');
  }
  if (!quiz) {
    throw new Error('Quiz does not exist');
  }
  if (quiz.userId !== token) {
    throw new Error('Quiz Id not owned by the user');
  }
  if (question.thumbnailUrl === '') {
    throw new Error('ThumbnailUrl is empty');
  }
  if (question.thumbnailUrl) {
    if (!question.thumbnailUrl.match(/\.(jpeg|jpg|png)$/i)) {
      throw new Error('The thumbnailUrl does not end with one of the following filetypes (case insensitive): jpg, jpeg, png');
    }
    if (!question.thumbnailUrl.match(/^https?:\/\//)) {
      throw new Error('The thumbnailUrl does not begin with http:// or https://');
    }
  }
  const id = uniqueId(quiz.questions);
  const colourArray = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink'];

  // add the color and answerId here
  const answerBody = question.answers.map((answer, index) => ({
    answerId: uniqueAnswerId(question.answers),
    answer: answer.answer,
    colour: colourArray[index % colourArray.length],
    correct: answer.correct
  }));

  let questionBody;
  if (isVersion2) {
    questionBody = {
      questionId: id,
      question: question.question,
      duration: question.duration,
      thumbnailUrl: question.thumbnailUrl,
      points: question.points,
      answers: answerBody,
    };
  } else {
    questionBody = {
      questionId: id,
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answerBody,
    };
  }

  quiz.questions.push(questionBody);
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);
  return { questionId: id };
}

// function to create a random id everytime
function uniqueId(questArr: Question[]): number {
  let uId: number;
  do {
    uId = Date.now();
  } while (questArr.find(quiz => (quiz.questionId === uId)));
  return uId;
}

// function to create a random answerId everytime
function uniqueAnswerId(answerArr: Answer[]): number {
  let uId: number;
  do {
    uId = Math.floor(Math.random() * 5001);
  } while (answerArr.find(answer => answer.answerId === uId));
  return uId;
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

export function adminQuizQuestionDuplicate(token: number, quizId: number, questionId: number): QuestionId | ErrorResponse {
  const store = getData();

  const userArr = store.users;
  const quizArr = store.quizzes;

  const findQuiz = findQuizIndexFromQuizId(quizId);
  const user = findUserByToken(token, userArr);
  const quizUser = checkQuizOwnership(token, quizArr);

  if (!user) {
    throw new Error('Invalid User id');
  }
  if (findQuiz === -1) {
    throw new Error('Invalid Quiz id');
  }
  if (!quizUser) {
    throw new Error('Quiz Id not owned by the user');
  }

  const findQuestion = findQuestionIndex(quizArr, quizId, questionId);
  if (findQuestion === -1) {
    throw new Error('Question id does not refer to valid question in quiz');
  }

  const quiz = quizArr[findQuiz];
  const question = quiz.questions[findQuestion];
  const newQuestionId = createQuestionId(quiz.questions);

  quiz.timeLastEdited = Math.round(Date.now() / 1000);

  const duplicatedQuestion = {
    questionId: newQuestionId,
    question: question.question,
    duration: question.duration,
    points: question.points,
    answers: question.answers,
    thumbnailUrl: question.thumbnailUrl
  };

  quiz.questions.push(duplicatedQuestion);
  setData(store);
  return { newQuestionId: newQuestionId };
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
    throw new Error('Invalid Token');
  }
  if (!quiz) {
    throw new Error('Invalid Quiz Id');
  }
  if (quiz.userId !== token) {
    throw new Error('Quiz Id not owned by the user');
  }
  const question = quiz.questions.find((question: Question) => question.questionId === questionId);
  if (!question) {
    throw new Error('Invalid Question Id');
  }
  const index = quiz.questions.indexOf(question);
  quiz.questions.splice(index, 1);
  setData(store);
  return {};
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
      answers:Answer[],
      thumbnailUrl: string
    }
) : Record<string, never> | { error: string } {
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
  const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId);
  if (!question) {
    throw new Error('question id does not exist in this quiz');
  }

  if (questionBody.question.length < 5) {
    throw new Error('question is too short');
  }
  if (questionBody.question.length > 50) {
    throw new Error('question is too long');
  }
  if (questionBody.answers.length > 6) {
    throw new Error('question has too many answers');
  }
  if (questionBody.answers.length < 2) {
    throw new Error('question does not have enough answers');
  }
  if (questionBody.duration <= 0 || typeof (questionBody.duration) !== 'number') {
    throw new Error('duration is not a positive number');
  }
  let duration = 0;

  // Iterate over the questions array to sum up the durations
  for (let i = 1; i < quiz.questions.length; i++) {
    duration += quiz.questions[i].duration;
  }
  duration -= question.duration;
  duration += questionBody.duration;

  if (duration > 180) {
    throw new Error('total duration of quiz is too long');
  }
  if (questionBody.points < 1 || typeof (questionBody.points) !== 'number') {
    throw new Error('points is not a positive number');
  }
  if (questionBody.points > 10) {
    throw new Error('points awarded is too big');
  }
  if (questionBody.answers.some((answer) => answer.answer.length < 1)) {
    throw new Error('answer is too short');
  }
  if (questionBody.answers.some((answer) => answer.answer.length > 30)) {
    throw new Error('answer is too long');
  }
  if (questionBody.answers.some((answer) => questionBody.answers.filter((a) => a.answer === answer.answer).length > 1)) {
    throw new Error('question contains a duplicate answer');
  }
  if (!questionBody.answers.some(answer => answer.correct)) {
    throw new Error('no correct answer for this question');
  }

  if (questionBody.thumbnailUrl === '') {
    throw new Error('thumbnail is empty');
  }
  if (questionBody.thumbnailUrl) {
    if (!questionBody.thumbnailUrl.match(/\.(jpeg|jpg|png)$/i)) {
      throw new Error('thumbnail is the wrong type');
    }
    if (!questionBody.thumbnailUrl.match(/^https?:\/\//)) {
      throw new Error('thumbnailUrl is not a url');
    }
  }

  const colourArray = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink'];

  // add the color and answerId here
  const answerBody = question.answers.map((answer, index) => ({
    answerId: uniqueAnswerId(question.answers),
    answer: answer.answer,
    colour: colourArray[index % colourArray.length],
    correct: answer.correct
  }));
  
  const quest: Question = quiz.questions[questionIndex];
  quest.question = questionBody.question;
  quest.duration = questionBody.duration;
  quest.points = questionBody.points;
  quest.answers = questionBody.answerBody;
  quest.thumbnailUrl = questionBody.thumbnailUrl;
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
