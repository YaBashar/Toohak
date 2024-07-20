import { getData } from './dataStore';
import { User, Quiz } from './interface';

export function getUserIdFromToken(sessionId: string): number {
  const result = parseFloat(sessionId);
  const store = getData();

  const sessArr = store.sessions;
  const session = sessArr.find((x) => {
    return x.sessionId === result;
  });
  if (!session) {
    return -1;
  }

  return session.authUserId;
}

export function findUserByToken(token: number, users: Array<User>): User | null {
  return users.find(user => user.authUserId === token) || null;
}

export function findQuizById(quizId: number, quizzes: Array<Quiz>): Quiz | null {
  return quizzes.find(quiz => quiz.quizId === quizId) || null;
}

export function checkQuizOwnership(token: number, quizzes: Array<Quiz>): boolean {
  return quizzes.some(quiz => quiz.authUserId === token);
}

export function isQuizNameAvailable(name: string, token: number, quizzes: Array<Quiz>): boolean {
  return !quizzes.some(quiz => quiz.name === name && quiz.authUserId === token);
}

export function validateQuizName(name: string): string | null {
  if (name.trim() === '') {
    return 'Name cannot be empty';
  }
  if (name.length > 30) {
    return 'Name is too long';
  }
  if (name.length <= 3) {
    return 'Name is too short';
  }
  if (/[!-:-@[-`{-~]/.test(name)) {
    return 'Quiz name cannot have symbols';
  }
  return null;
}
