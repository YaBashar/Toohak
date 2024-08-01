
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

// AdminPlayerSessionChatSend
export function adminPlayerSessionChatSend(playerId: number, messageBody: string) {
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
  if (/^\s*$/.test(messageBody)) {
    throw new Error('Message body contains only whitespace');
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
  if (!gameWithPlayer.chat) {
    gameWithPlayer.chat = [];
  }

  // Save the chat message to the game session
  gameWithPlayer.chat.push({
    playerId,
    message: messageBody,
    timestamp: new Date().toISOString(),
  });

  // Optionally log the successful operation
  console.log('Chat message saved successfully:', {
    playerId,
    messageBody,
    timestamp: new Date().toISOString()
  });

  return {};
}
