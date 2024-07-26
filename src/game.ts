
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
