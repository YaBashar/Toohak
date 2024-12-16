/*
LOBBY: Players can join in this state, and nothing has started.

QUESTION_COUNTDOWN: This is the question countdown period. It always exists before a question is open.

QUESTION_OPEN: This is when players can see the question, and the answers, and submit their answers (as many times as they like).

QUESTION_CLOSE: This is when players can still see the question, and the answers, but can no longer submit answers.

ANSWER_SHOW: This is when players can see the correct answer, as well as everyone playings' performance in that question, whilst they typically wait to go to the next countdown.

FINAL_RESULTS: This is where the final results are displayed for all players and questions.

END: The game is now over and inactive.
*/

import { getData, setData } from './dataStore';
import { createDataStoreId } from './helper';
import { Results, Player, Game, Answer } from './interface';
import { findQuizById, findUserByToken, checkQuizOwnership, findGameSessionId } from './helper';

export enum States {
  LOBBY,
  QUESTION_COUNTDOWN,
  QUESTION_OPEN,
  QUESTION_CLOSE,
  ANSWER_SHOW,
  FINAL_RESULTS,
  END
}

export enum Actions {
  NEXT_QUESTION,
  SKIP_COUNTDOWN,
  GO_TO_ANSWER,
  GO_TO_FINAL_RESULTS,
  END
}

export enum Status {
  ACTIVE,
  INACTIVE
}

// DEPENDENCIES

// /v1/admin/quiz/{quizid}/session/start
export function adminGameCreateSession(userId: number, quizId: number, autoStartNum: number) {
  const quiz = getData().quizzes.find(x => x.quizId === quizId);
  const gameArr = getData().games;
  const numActive = gameArr.filter(x => x.quizId === quizId && x.status !== States.END);

  if (getData().trash.some(x => x.quizId === quizId)) {
    throw new Error('Quiz is in trash');
  } else if (!quiz) {
    throw new Error('Quiz does not exist');
  } else if (quiz.userId !== userId) {
    throw new Error('User is not an owner of this quiz.');
  } else if (quiz.questions.length < 1) {
    throw new Error('Quiz does not have any questions.');
  } else if (autoStartNum > 50) {
    throw new Error('autoStartNum can not be greater than 50');
  } else if (numActive.length >= 10) {
    throw new Error('10 active sessions for this quiz already exist');
  }

  const newSessId = gameArr.length + 1;
  const results: Results[] = [];
  const players: Player[] = [];

  for (const question of quiz.questions) {
    results.push({
      questionId: question.questionId,
      playersCorrectList: [],
      averageAnswerTime: 0,
      percentageCorrect: 0,
      startTime: 0
    });
  }

  const newSession: Game = {
    sessionId: newSessId,
    status: States.LOBBY,
    quizId: quiz.quizId,
    autoStartNum: autoStartNum,
    players: players,
    activeQuestion: 0,
    numQuestions: quiz.questions.length,
    questionResults: results,
  };

  getData().games.push(newSession);
  setData(getData());
  return { sessionId: newSessId };
}

// /v1/player/join
export function adminGamePlayerJoin(sessionId: number, name: string) {
  const session = getData().games.find(x => x.sessionId === sessionId);

  if (!session) {
    throw new Error('SessionId does not refer to a valid session');
  } else if (session.status !== States.LOBBY) {
    throw new Error('Session is not in lobby state');
  } else if (session.players.some(x => x.name === name)) {
    throw new Error('Name has already been taken');
  }

  const newPlayerId = createDataStoreId();
  session.players.push({
    playerId: newPlayerId,
    name: name,
    atQuestion: 0,
    points: 0,
  });

  setData(getData());
  return { playerId: newPlayerId };
}

export function adminQuizQuestionResults(playerid: number, questionposition: number) {
  const data = getData();
  const gameIndex = data.games.findIndex(game => game.players.some(player => player.playerId === playerid));

  if (gameIndex === -1) {
    throw new Error('Player ID does not exist');
  }

  const game = data.games[gameIndex];

  if (questionposition > game.numQuestions) {
    throw new Error('Question position is invalid');
  }

  if (game.status !== States.ANSWER_SHOW) {
    throw new Error('Session is not in the correct state');
  }

  if (game.activeQuestion !== questionposition) {
    throw new Error('Session is not currently on this question');
  }

  const questionResults = game.questionResults[questionposition - 1];

  const results = {
    questionid: questionResults.questionId,
    playersCorrectList: questionResults.playersCorrectList,
    averageAnswerTime: questionResults.averageAnswerTime,
    percentageCorrect: questionResults.percentageCorrect
  };

  return results;
}

// /v1/admin/quiz/{quizid}/sessions
export function adminGameViewSessions(userId: number, quizId: number) {
  const quiz = getData().quizzes.find(x => x.quizId === quizId);
  const gameArr = getData().games;

  if (!quiz) {
    throw new Error('Quiz does not exist');
  } else if (quiz.userId !== userId) {
    throw new Error('User is not an owner of this quiz.');
  }

  const active: number[] = [];
  const inactive: number[] = [];

  for (const sess of gameArr) {
    if (sess.status === States.END && sess.quizId === quizId) {
      inactive.push(sess.sessionId);
    } else if (sess.status !== States.END && sess.quizId === quizId) {
      active.push(sess.sessionId);
    }
  }

  return {
    activeSessions: active,
    inactiveSessions: inactive
  };
}

export function adminGamePlayerSessionInfo(playerId: number) {
  const store = getData();
  const gameArr = store.games;
  let playerFound = null;
  let gameWithPlayer = null;

  for (let i = 0; i < gameArr.length; i++) {
    const game = gameArr[i];
    console.log(`Checking game ${i} with sessionId ${game.sessionId}`);
    for (let j = 0; j < game.players.length; j++) {
      const player = game.players[j];
      if (player.playerId === playerId) {
        playerFound = player;
        gameWithPlayer = game; // Store the game reference
        break;
      }
    }
    if (playerFound) {
      break;
    }
  }

  if (playerFound) {
    console.log('Player found:', playerFound);
    console.log('Game with player:', gameWithPlayer);
  } else {
    throw new Error('Player Id does not exist');
  }

  const playerInfo = {
    state: States[gameWithPlayer.status],
    numQuestions: gameWithPlayer.numQuestions,
    atQuestion: gameWithPlayer.activeQuestion
  };

  return (playerInfo);
}

// Create a global variable to store all timers
export const timerMap = new Map();

export function gameUpdateQuizSessionState(token : number, quizId : number, sessionId : number, action : number) {
  const data = getData();
  const userArr = data.users;
  const quizArr = data.quizzes;
  const quiz = findQuizById(quizId, quizArr);
  const user = findUserByToken(token, userArr);
  const quizUser = checkQuizOwnership(token, quizArr);
  const game = findGameSessionId(data, sessionId, quizId);

  if (!user) {
    throw new Error('Invalid User id');
  }
  if (!quiz) {
    throw new Error('Invalid Quiz id');
  }
  if (!quizUser) {
    throw new Error('Quiz Id not owned by the user');
  }
  if (!game) {
    throw new Error('Session Id does not exist');
  }

  if (action === Actions.NEXT_QUESTION) {
    if (game.status === States.LOBBY || game.status === States.QUESTION_CLOSE) {
      game.status = States.QUESTION_COUNTDOWN;
      game.activeQuestion += 1;
      setData(data);

      // Clear any existing timer
      const existingTimer = timerMap.get(sessionId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Countdown 3 Seconds to Move from Question_Countdown to Question_Open
      // Transition to Question_Close once the question has been opened for its duration
      // which was set in quizCreate
      const countdownInterval: ReturnType<typeof setTimeout> = setTimeout(() => {
        game.status = States.QUESTION_OPEN;
        game.questionResults[game.activeQuestion - 1].startTime = Math.floor(Date.now() / 1000);
        setData(data);

        const testTime = quiz.questions[game.activeQuestion - 1].duration * 1000;
        setTimeout(() => {
          game.status = States.QUESTION_CLOSE;
          setData(data);
        }, testTime);
      }, 3000);
      timerMap.set(sessionId, countdownInterval);
    } else {
      throw new Error('Action Next Question not applicable in this state');
    }
  }

  if (action === Actions.SKIP_COUNTDOWN) {
    if (game.status === States.QUESTION_COUNTDOWN) {
      // Delete existing timer created when countdown started from NEXT_QUESTION action
      const existingTimer = timerMap.get(sessionId);
      if (existingTimer) {
        clearTimeout(existingTimer);
        timerMap.delete(sessionId);
        game.status = States.QUESTION_OPEN;
        game.questionResults[game.activeQuestion - 1].startTime = Math.floor(Date.now() / 1000);
        setData(data);
      }

      const testTime = quiz.questions[game.activeQuestion - 1].duration * 1000;
      setTimeout(() => {
        game.status = States.QUESTION_CLOSE;
        setData(data); // Persist changes immediately
      }, testTime);
    } else {
      throw new Error('Action Skip Countdown not applicable in this state');
    }
  }

  if (action === Actions.GO_TO_ANSWER) {
    if (game.status === States.QUESTION_OPEN || game.status === States.QUESTION_CLOSE) {
      game.status = States.ANSWER_SHOW;
      setData(data);
    } else {
      throw new Error('Action Go to answer is not applicable in this state');
    }
  }

  if (action === Actions.GO_TO_FINAL_RESULTS) {
    if (game.status === States.ANSWER_SHOW || game.status === States.QUESTION_CLOSE) {
      game.status = States.FINAL_RESULTS;
      setData(data);
    } else {
      throw new Error('Action Go to final results is not applicable in this state');
    }
  }

  if (action === Actions.END) {
    game.status = States.END;
    setData(data);
  }

  if (action !== Actions.NEXT_QUESTION && action !== Actions.SKIP_COUNTDOWN &&
    action !== Actions.GO_TO_ANSWER && action !== Actions.GO_TO_FINAL_RESULTS && action !== Actions.END) {
    throw new Error('Action not a valid enum');
  }

  setData(getData());
  return {};
}

export function adminGameQuizSessionStatusInfo(userId: number, quizId : number, sessionId : number) {
  const store = getData();
  const userArr = store.users;
  const quizArr = store.quizzes;
  const quiz = findQuizById(quizId, quizArr);
  const user = findUserByToken(userId, userArr);
  const quizUser = checkQuizOwnership(userId, quizArr);

  const game = findGameSessionId(store, sessionId, quizId);

  if (!user) {
    throw new Error('Invalid User id');
  }
  if (!quiz) {
    throw new Error('Invalid Quiz id');
  }
  if (!quizUser) {
    throw new Error('Quiz Id not owned by the user');
  }
  if (!game) {
    throw new Error('Session Id does not exist');
  }

  const filteredQuestions = quiz.questions.filter(q => q !== null);
  const totalDuration = quiz.questions.reduce((acc, question) => acc + question.duration, 0);
  const currentState = States[game.status];

  const gameSessionInfo = {
    state: currentState,
    atQuestion: game.activeQuestion, // some number
    players: game.players.map(player => player.name),

    metadata: {
      quizId: quiz.quizId,
      name: quiz.name,
      timeCreated: quiz.timeCreated,
      timeLastEdited: quiz.timeLastEdited,
      description: quiz.description,
      // Update numQuestions based on filtered questions
      numQuestions: filteredQuestions.length,
      questions: filteredQuestions,
      duration: totalDuration,
      thumbnailUrl: quiz.thumbnailUrl
    }
  };

  return (gameSessionInfo);
}

// AdminPlayerSessionChatSend
export function adminPlayerSendMessage(playerId: number, messageBody: string) {
  const store = getData();
  const gameArr = store.games;
  let playerFound: Player | null = null;
  let gameWithPlayer: Game | null = null;

  // Validation checks
  if (messageBody.trim().length === 0) {
    throw new Error('Message body is less than 1 character');
  }
  if (messageBody.length > 100) {
    throw new Error('Message body is more than 100 characters');
  }

  // Find the game session where the player is involved
  for (let i = 0; i < gameArr.length; i++) {
    const game = gameArr[i];
    for (let j = 0; j < game.players.length; j++) {
      const player = game.players[j];
      if (player.playerId === playerId) {
        playerFound = player;
        gameWithPlayer = game;
        break;
      }
    }
    if (playerFound) {
      break;
    }
  }

  if (!playerFound) {
    throw new Error('Player ID does not exist');
  }

  // Initialize chat array if it doesn't exist
  if (!gameWithPlayer.messages) {
    gameWithPlayer.messages = [];
  }

  // Save the chat message to the game session
  gameWithPlayer.messages.push({
    messageBody: messageBody,
    playerId: playerId,
    playerName: playerFound.name,
    timeSent: Math.floor(Date.now() / 1000),
  });

  // Optionally log the successful operation
  console.log('Chat message saved successfully:', {
    playerId,
    messageBody,
    timestamp: new Date().toISOString()
  });

  setData(store);
  return {};
}

// AdminPlayerSessionChatGet
export function adminPlayerGetMessage(playerId: number) {
  const store = getData();
  const gameArr = store.games;
  let playerFound: Player | null = null;
  let gameWithPlayer: Game | null = null;

  for (const game of gameArr) {
    for (const player of game.players) {
      if (player.playerId === playerId) {
        playerFound = player;
        gameWithPlayer = game;
        break;
      }
    }
    if (playerFound) {
      break;
    }
  }
  if (!playerFound) {
    throw new Error('Player ID does not exist');
  }

  if (!gameWithPlayer.messages) {
    return { messages: [] };
  }

  const messages = [];

  for (const chat of gameWithPlayer.messages) {
    const message = {
      messageBody: chat.messageBody,
      playerId: chat.playerId,
      playerName: chat.playerName,
      timeSent: chat.timeSent
    };
    messages.push(message);
  }

  console.log(messages);
  return { messages: messages };
}

// adminQuizSubmitAnswer
export function adminQuizSubmitAnswer(answerids: number[], playerid: number, questionposition: number) {
  const data = getData();
  const gameIndex = data.games.findIndex(game => game.players.some(player => player.playerId === playerid));

  if (gameIndex === -1) {
    throw new Error('Player ID does not exist');
  }

  const game = data.games[gameIndex];

  const quiz = data.quizzes.find(quiz => quiz.quizId === game.quizId);

  if (questionposition > game.numQuestions) {
    throw new Error('Question position is invalid');
  }

  const question = quiz.questions[questionposition - 1];

  if (game.status !== States.QUESTION_OPEN) {
    throw new Error('Session is not in the correct state');
  }

  if (game.activeQuestion !== questionposition) {
    throw new Error('Session is not currently on this question');
  }

  const validAnswerIds = question.answers.map((answer: Answer) => answer.answerId);
  for (const answerId of answerids) {
    if (!validAnswerIds.includes(answerId)) {
      throw new Error('Invalid answer ID');
    }
  }

  if (hasDuplicateAnswerIds(answerids)) {
    throw new Error('Duplicate answers provided');
  }

  if (answerids.length < 1) {
    throw new Error('No answer provided');
  }

  const correctAnswerIds = question.answers
    .filter((answer: Answer) => answer.correct)
    .map((answer: Answer) => answer.answerId);

  const correct = correctAnswerIds.every((correctId: number) => answerids.includes(correctId));

  const results = game.questionResults[questionposition - 1];
  if (correct) {
    const playerIndex = game.players.findIndex((player) => playerid === player.playerId);
    const playerName = game.players[playerIndex].name;
    results.playersCorrectList.push(playerName);
    results.percentageCorrect = ((results.percentageCorrect / 100) + 1 / (game.players.length)) * 100;
  }

  setData(data);
  return {};
}

function hasDuplicateAnswerIds(answerIds: number[]): boolean {
  const seen = new Set<number>();

  for (const answerId of answerIds) {
    if (seen.has(answerId)) {
      return true;
    }
    seen.add(answerId);
  }
  return false;
}

export function adminQuizQuestionInfo(playerid: number, questionposition: number) {
  const data = getData();
  const gameIndex = data.games.findIndex(game => game.players.some(player => player.playerId === playerid));

  if (gameIndex === -1) {
    throw new Error('Player ID does not exist');
  }

  const game = data.games[gameIndex];
  const quiz = data.quizzes.find(quiz => quiz.quizId === game.quizId);

  if (questionposition > game.numQuestions) {
    throw new Error('Question position is invalid');
  }

  const question = quiz.questions[questionposition - 1];

  if (game.status === States.LOBBY || game.status === States.QUESTION_COUNTDOWN || game.status === States.FINAL_RESULTS || game.status === States.END) {
    throw new Error('Session is not in the correct state');
  }

  if (game.activeQuestion !== questionposition) {
    throw new Error('Session is not currently on this question');
  }

  const answers = [];
  for (let i = 0; i < question.answers.length; i++) {
    answers.push({
      answerId: question.answers[i].answerId,
      answer: question.answers[i].answer,
      colour: question.answers[i].colour
    });
  }

  const questionInfo = {
    questionId: question.questionId,
    question: question.question,
    duration: question.duration,
    thumbnailUrl: question.thumbnailUrl,
    points: question.points,
    answers: answers
  };
  console.log(questionInfo);

  return questionInfo;
}

export function adminQuizFinalResults (playerid: number) {
  const data = getData();
  const gameIndex = data.games.findIndex(game => game.players.some(player => player.playerId === playerid));

  if (gameIndex === -1) {
    throw new Error('Player ID does not exist');
  }

  const game = data.games[gameIndex];
  if (game.status !== States.FINAL_RESULTS) {
    throw new Error('session not in correct state');
  }

  const users = game.players.sort((a, b) => b.points - a.points);
  const usersRankedByScore = users.map(user => ({
    name: user.name,
    score: user.points
  }));

  const questions = game.questionResults;
  const questionResults = questions.map(question => ({
    questionId: question.questionId,
    playersCorrectList: question.playersCorrectList,
    averageAnswerTime: question.averageAnswerTime,
    percentCorrect: question.percentageCorrect
  }));

  const results = {
    usersRankedByScore: usersRankedByScore,
    questionResults: questionResults
  };

  return results;
}
