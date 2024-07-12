// dataStore
export interface User {
  authUserId: number,
  name: string,
  email: string,
  password: string,
  numSuccessfulLogins: number,
  numFailedPasswordSinceLastLogin: number,
  passwordHistory: string[]
}

export interface UserDetails {
  user: {
    authUserId: number,
    name: string,
    email: string,
    numSuccessfulLogins: number,
    numFailedPasswordSinceLastLogin: number,
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
  answers: Answer[]
}

export interface QuestionId {
  questionId: number
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
  authUserId: number
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
}

export interface Session {
  sessionId: number,
  authUserId: number
}

export interface Store {
  users: User[],
  quizzes: Quiz[],
  sessions: Session[],
  trash: Quiz[]
}
