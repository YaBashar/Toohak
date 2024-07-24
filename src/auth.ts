/* /////////////////////////////////////////////////////////////////////////////
//////////////////////   TOOHAK ITERATION 2 'AUTH.TS'  ////////////////////////
///////////////////////////////////////////////////////////////////////////////

COMP1531 24T2 --- Major Project: `Toohak',
<https://nw-syd-gitlab.cseunsw.tech/COMP1531/24T2/groups/W11A_
CRUNCHIE/project-backend/-/blob/master/README.md>

This program was written by
z5478214 | z5599894 | z5525050 | z5362173 | z5478980
on 04/06/2024

auth.ts contains functions for the Toohak project backend. These functions
manage the authentification process of the site, including user details,
login mechanics, and updating passwords and usernames.

*//// //////////////////////////////////////////////////////////////////////////

// DEPENDENCIES

import { getData } from './dataStore';
import validator from 'validator';
import {
  UserDetails, ErrorResponse
} from './interface';
import {
  createDataStoreId, findUserIndexFromUserId, findUserIndexFromEmail,
  checkAdminAuthRegister, checkAdminAuthLogin
} from './helper';

// INTERFACES

/// ////////////////////////////////////////////////////////////////////////////

/** [1] adminAuthRegister
  *
  * Registers a user with an email, password, and name,
  * then returns a string containing their session id.
  *
  * @param {string} email - user's email address
  * @param {string} password - user's password required for logging
  *                            into the Toohak platform
  * @param {string} nameFirst - user's first name
  * @param {string} nameLast - user's last name
  * ...
  * @returns {string} - string representing a unique
  *                                 identifier for the session
  *
*/
export function adminAuthRegister(email: string, password: string,
  nameFirst: string, nameLast: string): string {
  const store = getData();
  const userArr = store.users;

  // checking for error cases
  try {
    checkAdminAuthRegister(email, password, nameFirst, nameLast);
  } catch (e) {
    throw new Error(e.message);
  }

  // registering the user and session to the database
  const newUserId = createDataStoreId();
  const newSessId = createDataStoreId();
  const newUser = {
    userId: newUserId,
    name: nameFirst + ' ' + nameLast,
    email: email,
    password: password,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    passwordHistory: [password],
  };
  userArr.push(newUser);

  const session = {
    sessionId: newSessId,
    userId: newUserId,
  };
  store.sessions.push(session);

  return newSessId.toString();
}

/** [2] adminAuthLogin
  *
  * Given a registered user's email and password returns
  * their sessionId
  *
  * @param {string} email - user's email address
  * @param {string} password - user's password required for logging
  *                            into the Toohak platform
  * ...
  * @returns {string} - string representing a unique
  *                                 identifier for the session
  *
*/
export function adminAuthLogin(email: string, password: string): string {
  const store = getData();
  const userArr = store.users;
  const user = userArr[findUserIndexFromEmail(email)];

  // checking for error cases
  try {
    checkAdminAuthLogin(email, password);
  } catch (e) {
    throw new Error(e.massage);
  }

  // logging in the user
  user.numSuccessfulLogins++;
  user.numFailedPasswordsSinceLastLogin = 0;

  // creating sessiionId
  const newSessId = createDataStoreId();
  const session = {
    sessionId: newSessId,
    userId: user.userId,
  };

  store.sessions.push(session);
  return newSessId.toString();
}

/** [3] adminUserDetails
  *
  * Given an admin user's userId, returns details about the user.
  *
  * @param {number} token - number representing a unique
  *                              identifier for the user
  * ...
  * @returns {
  *   user: {
  *     userId: number,
  *     name: string,
  *     email: string,
  *     numSuccessfulLogins: number,
  *     numFailedPasswordsSinceLastLogin: number,
  *   }
  * } - an object with information about the user based on their userId
  *
*/

export function adminUserDetails(userId: number): UserDetails {
  const user = getData().users[findUserIndexFromUserId(userId)];

  // checking for error cases
  if (!user) {
    throw new Error('Invalid UserId');
  }
  // returning object containing user details
  return {
    user: {
      userId: user.userId,
      name: user.name,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
    }
  };
}

/** [4] adminUserDetailsUpdate
  *
  * Gets all of the relevant information about the current quiz.
  *
  * @param {number} token - number representing a unique
  *                              identifier for the user
  * @param {string} email - user's email address
  * @param {string} nameFirst - user's first name
  * @param {string} nameLast - user's last name
  * ...
  * @returns {} - empty object
*/

export function adminUserDetailsUpdate(token: number, email: string, nameFirst: string, nameLast: string): Record<string, never> | ErrorResponse {
  const specialChars = /[@!#$%^&*()_+=[\]{};:"\\|,.<>/?]/;
  const data = getData();

  if (!Number.isInteger(token)) {
    throw new Error('invalid userId');
  }

  const userIndex = data.users.findIndex(user => user.userId === token);
  if (userIndex === -1) {
    throw new Error('userId does not exist');
  }

  if (!validator.isEmail(email)) {
    throw new Error('invalid email address');
  }

  if (data.users.some(user => user.email === email && user.userId !== token)) {
    throw new Error('email used by another user');
  }

  if (specialChars.test(nameFirst)) {
    throw new Error('first name contains invalid characters');
  }

  if (nameFirst.length < 2) {
    throw new Error('first name is too short');
  }

  if (nameFirst.length > 20) {
    throw new Error('first name is too long');
  }

  if (specialChars.test(nameLast)) {
    throw new Error('last name contains invalid characters');
  }

  if (nameLast.length < 2) {
    throw new Error('last name is too short');
  }

  if (nameLast.length > 20) {
    throw new Error('last name is too long');
  }

  data.users[userIndex].email = email;
  data.users[userIndex].name = `${nameFirst} ${nameLast}`;
  return {};
}

/** [5] adminUserPasswordUpdate
  *
  * Gets all of the relevant information about the current quiz.
  *
  * @param {number} token - number representing a unique
  *                              identifier for the user
  * @param {string} oldPassword - user's old password
  * @param {string} newPassword - user's new password
  * ...
  * @returns {} - empty object
*/
export function adminUserPasswordUpdate(token: number, oldPassword: string, newPassword: string): Record<string, never> | ErrorResponse {
  const data = getData();
  const user = data.users.find(user => user.userId === token);

  if (!user) {
    return { error: 'userId does not exist' };
  }

  if (user.password !== oldPassword) {
    return { error: 'incorrect password' };
  }

  if (oldPassword === newPassword) {
    return { error: 'new password is the same as old password' };
  }

  if (user.passwordHistory.includes(newPassword)) {
    return { error: 'password has already been used' };
  }

  if (newPassword.length < 8) {
    return { error: 'password is too short' };
  }

  const hasNumber = /\d/.test(newPassword);
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  if (!hasNumber || !hasLetter) {
    return { error: 'new password should contain at least one letter and one number' };
  }

  user.passwordHistory.push(newPassword);
  user.password = newPassword;

  return {};
}

/** [6] adminAuthLogout
  *
  * Logs out an admin user who has an active user session.
  *
  * @param {number} token - number representing a unique
  *                              identifier for the user
  * ...
  * @returns {} - empty object
*/
export function adminAuthLogout(token: string): Record<string, never> | ErrorResponse {
  const result = parseFloat(token);

  const store = getData();
  const sessArr = store.sessions;

  const session = sessArr.find((x) => {
    return x.sessionId === result;
  });

  if (!session) {
    return { error: 'invalid token' };
  }

  const index = sessArr.indexOf(session);
  sessArr.splice(index, 1);

  return {};
}
