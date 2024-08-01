// dataStore
import { States } from './game';

// Define the ChatMessage interface
export interface ChatMessage {
  messageBody: string;
  playerId: number;
  playerName: string;
  timeSent: string;
}

// Define the User interface
export interface User {
  userId: number;
  name: string;
  email: string;
  password: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  passwordHistory: string[];
}

// Define the UserDetails interface
export interface UserDetails {
  user: {
    userId: number;
    name: string;
    email: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
  };
}

// Define the Answer interface
export interface Answer {
  answerId: number;
  answer: string;
  colour: string;
  correct: boolean;
}

// Define the Question interface
export interface Question {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  answers: Answer[];
  thumbnailUrl?: string;
}

// Define the QuestionId interface
export interface QuestionId {
  newQuestionId: number;
}

// Define the Quiz interface
export interface Quiz {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: Question[];
  duration: number;
  userId: number;
  thumbnailUrl?: string;
}

// Define the QuizList interface
export interface QuizList {
  quizId: number;
  name: string;
}

// Define the QuizInfo interface
export interface QuizInfo {
  quizId: number;
  name: string;
  timeCreated: number; // Keeping as number for Unix timestamp
  timeLastEdited: number; // Keeping as number for Unix timestamp
  description: string;
  numQuestions: number;
  questions: Question[];
  duration: number;
  thumbnailUrl?: string;
}

// Define the Session interface
export interface Session {
  sessionId: number;
  userId: number;
}

// Define the ErrorResponse interface
export interface ErrorResponse {
  error: string;
}

// Define the Player interface
export interface Player {
  playerId: number;
  name: string;
  atQuestion: number;
  points: number;
}

// Define the Results interface
export interface Results {
  questionId: number,
  playersCorrectList: string[],
  averageAnswerTime: number,
  percentageCorrect: number,
  startTime: number
}

// Update the Game interface to include chat
export interface Game {
  sessionId: number;
  status: States;
  quizId: number;
  autoStartNum: number;
  players: Player[];
  numQuestions: number;
  activeQuestion: number;
  questionResults: Results[];
  chat?: ChatMessage[]; 
}

// Define the Store interface
export interface Store {
  users: User[];
  quizzes: Quiz[];
  sessions: Session[];
  trash: Quiz[];
  games: Game[];
}
