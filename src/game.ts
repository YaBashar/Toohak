
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
import { Results, Player, Game } from './interface';
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

// enum Status {
//   ACTIVE,
//   INACTIVE
// }

// DEPENDENCIES

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

  const newSessId = createDataStoreId();
  const results: Results[] = [];
  const players: Player[] = [];

  for (const question of quiz.questions) {
    results.push({
      questionId: question.questionId,
      playersCorrectList: [],
      averageAnswerTime: 0,
      percentageCorrect: 0,
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
  return { sessionId: newSessId };
}

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

  return { playerId: newPlayerId };
}

export const timerMap = new Map();

export function gameUpdateQuizSessionState(token : number, quizId : number, sessionId : number, action : Actions) {
  const store = getData();
  const userArr = store.users;
  const quizArr = store.quizzes;
  const quiz = findQuizById(quizId, quizArr);
  const user = findUserByToken(token, userArr);
  const quizUser = checkQuizOwnership(token, quizArr);
  const game = findGameSessionId(sessionId, quizId);
  // console.log('game', game);

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

  const testTime = quiz.questions[game.activeQuestion - 1].duration * 1000;

  if (action === Actions.NEXT_QUESTION) {
    if (game.status === States.LOBBY || game.status === States.ANSWER_SHOW || game.status === States.QUESTION_CLOSE) {
      game.status = States.QUESTION_COUNTDOWN;
      game.activeQuestion += 1;

      // Clear any existing timer
      const existingTimer = timerMap.get(sessionId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // THIS WORKS
      const countdownInterval: ReturnType<typeof setTimeout> = setTimeout(() => {
        game.status = States.QUESTION_OPEN;

        setTimeout(() => {
          console.log('Inner timeout fired');
          game.status = States.QUESTION_CLOSE;
          console.log('Closing question', States[game.status]);
          setData(store);
        }, testTime);
      }, 3000);
      timerMap.set(sessionId, countdownInterval);
    } else {
      throw new Error('Action Next Question not applicable in this state');
    }
  }

  if (action === Actions.SKIP_COUNTDOWN) {
    if (game.status === States.QUESTION_COUNTDOWN) {
      const existingTimer = timerMap.get(sessionId);
      if (existingTimer) {
        clearTimeout(existingTimer);
        timerMap.delete(sessionId);
        game.status = States.QUESTION_OPEN;
      }

      setTimeout(() => {
        console.log('Inner timeout fired');
        game.status = States.QUESTION_CLOSE;
        console.log('Closing question', States[game.status]);
        setData(store);
      }, testTime);
    } else {
      throw new Error('Action Skip Countdown not applicable in this state');
    }
  }

  if (action === Actions.GO_TO_ANSWER) {
    if (game.status === States.QUESTION_OPEN || game.status === States.QUESTION_CLOSE) {
      game.status = States.ANSWER_SHOW;
    } else {
      throw new Error('Action Go to answer is not applicable in this state');
    }
  }

  if (action === Actions.GO_TO_FINAL_RESULTS) {
    if (game.status === States.ANSWER_SHOW || game.status === States.QUESTION_CLOSE) {
      game.status = States.FINAL_RESULTS;
    } else {
      throw new Error('Action Go to final results is not applicable in this state');
    }
  }

  if (action === Actions.END) {
    game.status = States.END;
  }

  if (action !== Actions.NEXT_QUESTION && action !== Actions.SKIP_COUNTDOWN &&
    action !== Actions.GO_TO_ANSWER && action !== Actions.GO_TO_FINAL_RESULTS && action !== Actions.END) {
    throw new Error('Action not a valid enum');
  }

  return {};
}

export function adminGameQuizSessionStatusInfo(userId: number, quizId : number, sessionId : number) {
  const store = getData();
  const userArr = store.users;
  const quizArr = store.quizzes;
  const quiz = findQuizById(quizId, quizArr);
  const user = findUserByToken(userId, userArr);
  const quizUser = checkQuizOwnership(userId, quizArr);

  const game = findGameSessionId(sessionId, quizId);

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
