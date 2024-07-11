
// dataStore
interface User {
  authUserId: number,
  name: string, 
  email: string, 
  password: string, 
  numSuccessfulLogins: number,
  numFailedPasswordSinceLastLogin: number,
  passwordHistory: string[]
}

interface Answer {
  answerId: number,
  answer: string,
  colour: string,
  correct: boolean
}

interface Question {
  questionId: number,
  question: string,
  duration: number,
  points: number,
  answers: Answer[]
}

interface Quiz {
  quizId: number,
  name: string,
  timeCreated: number, 
  timeLastEdited: number,
  description: string, 
  numQuestions: number, 
  questions: Question[],
  authUserId: number
}

interface Session {
  sessionId: number,
  authUserId: number
}

export interface Store {
  users: User[],
  quizzes: Quiz[],
  sessions: Session[],
  trash: Quiz[]
}