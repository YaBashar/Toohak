
/*
LOBBY: Players can join in this state, and nothing has started.

QUESTION_COUNTDOWN: This is the question countdown period. It always exists before a question is open.

QUESTION_OPEN: This is when players can see the question, and the answers, and submit their answers (as many times as they like).

QUESTION_CLOSE: This is when players can still see the question, and the answers, but can no longer submit answers.

ANSWER_SHOW: This is when players can see the correct answer, as well as everyone playings' performance in that question, whilst they typically wait to go to the next countdown.

FINAL_RESULTS: This is where the final results are displayed for all players and questions.

END: The game is now over and inactive.
*/

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
import { getData } from './dataStore';
import { findQuizById, findUserByToken, checkQuizOwnership, findGameSessionId } from './helper';

export function gameUpdateQuizSessionState(token : number, quizId : number, sessionId : number, action : Actions) {
  const store = getData();
  const userArr = store.users;
  const quizArr = store.quizzes;
  const quiz = findQuizById(quizId, quizArr);
  const user = findUserByToken(token, userArr);
  const quizUser = checkQuizOwnership(token, quizArr);

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

  const currentState = game.status;
  if (Actions.NEXT_QUESTION) {
    if (currentState === States.LOBBY || currentState === States.ANSWER_SHOW || currentState === States.QUESTION_CLOSE) {
      game.status = States.QUESTION_COUNTDOWN;
    } else {
      throw new Error('Action Next Question not applicable in this state');
    }
  }

  if (Actions.SKIP_COUNTDOWN) {
    if (currentState === States.QUESTION_COUNTDOWN) {
      game.status = States.QUESTION_OPEN;
    } else {
      throw new Error('Action Skip Countdown not applicable in this state');
    }
  }

  if (Actions.GO_TO_ANSWER) {
    if (currentState === States.QUESTION_OPEN || currentState === States.QUESTION_CLOSE) {
      game.status = States.ANSWER_SHOW;
    } else {
      throw new Error('Action Go to answer is not applicable in this state');
    }
  }

  if (Actions.GO_TO_FINAL_RESULTS) {
    if (currentState === States.ANSWER_SHOW || currentState === States.QUESTION_CLOSE) {
      game.status = States.FINAL_RESULTS;
    } else {
      throw new Error('Action Go to final results is not applicable in this state');
    }
  }

  if (Actions.END) {
    game.status = States.END;
  }

  if (!Actions.NEXT_QUESTION && !Actions.SKIP_COUNTDOWN && !Actions.GO_TO_ANSWER && !Actions.GO_TO_FINAL_RESULTS && !Actions.END) {
    throw new Error('Action not a valid enum');
  }
}
