
/*
LOBBY: Players can join in this state, and nothing has started.

QUESTION_COUNTDOWN: This is the question countdown period. It always exists before a question is open.

QUESTION_OPEN: This is when players can see the question, and the answers, and submit their answers (as many times as they like).

QUESTION_CLOSE: This is when players can still see the question, and the answers, but can no longer submit answers.

ANSWER_SHOW: This is when players can see the correct answer, as well as everyone playings' performance in that question, whilst they typically wait to go to the next countdown.

FINAL_RESULTS: This is where the final results are displayed for all players and questions.

END: The game is now over and inactive.
*/

import { getData } from './dataStore';
import { createDataStoreId } from './helper';
import { Results, Player, Game } from './interface';

export enum States {
  LOBBY,
  QUESTION_COUNTDOWN,
  QUESTION_OPEN,
  QUESTION_CLOSE,
  ANSWER_SHOW,
  FINAL_RESULTS,
  END
}

// enum Actions {
//   NEXT_QUESTION,
//   SKIP_COUNTDOWN,
//   GO_TO_ANSWER,
//   GO_TO_FINAL_RESULTS,
//   END
// }

// enum Status {
//   ACTIVE,
//   INACTIVE
// }

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
    players: players,
    autoStartNum: autoStartNum,
    activeQuestion: 0,
    questionResults: results,
  };

  getData().games.push(newSession);
  return { sessionId: newSessId };
}
