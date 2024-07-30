// dataStore
import { States } from './game';

export interface User {
  userId: number,
  name: string,
  email: string,
  password: string,
  numSuccessfulLogins: number,
  numFailedPasswordsSinceLastLogin: number,
  passwordHistory: string[]
}

export interface UserDetails {
  user: {
    userId: number,
    name: string,
    email: string,
    numSuccessfulLogins: number,
    numFailedPasswordsSinceLastLogin: number,
  }
}

export interface Answer {
  answerId: number,
  answer: string,
  colour: string,
  correct: boolean
}

export interface Question {
  questionId: number,
  question: string,
  duration: number,
  points: number,
  answers: Answer[],
  thumbnailUrl?: string
}

export interface QuestionId {
  newQuestionId: number
}

export interface Quiz {
  quizId: number,
  name: string,
  timeCreated: number,
  timeLastEdited: number,
  description: string,
  numQuestions: number,
  questions: Question[],
  duration: number,
  userId: number
  thumbnailUrl?: string
}

export interface QuizList {
    quizId: number,
    name: string,
}

export interface QuizInfo {
  quizId: number,
  name: string,
  timeCreated: number, // Keeping as number for Unix timestamp
  timeLastEdited: number, // Keeping as number for Unix timestamp
  description: string,
  numQuestions: number,
  questions: Question[];
  duration : number
  thumbnailUrl? : string
}

export interface Session {
  sessionId: number,
  userId: number
}

export interface ErrorResponse {
  error : string
}

export interface Player {
  playerId: number,
  name: string,
  atQuestion: number,
  points: number,
}

export interface PlayerScore {
  name: string;
  score: number;
}

export interface QuestionResult {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}

export interface QuizSessionFinalResult {
  usersRankedByScore: PlayerScore[];
  questionResults: QuestionResult[];
}
export interface Results {
  questionId: number,
  playersCorrectList: string[],
  averageAnswerTime: number,
  percentageCorrect: number
}

export interface Game {
  sessionId: number,
  status: States,
  quizId: number,
  autoStartNum: number,
  players: Player[],
  numQuestions: number,
  activeQuestion: number,
  questionResults: Results[],
}

export interface Store {
  users: User[],
  quizzes: Quiz[],
  sessions: Session[],
  trash: Quiz[],
  games: Game[],
}
