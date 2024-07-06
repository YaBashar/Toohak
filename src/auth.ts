/* /////////////////////////////////////////////////////////////////////////////
//////////////////////   TOOHAK ITERATION 2 'AUTH.JS'  ////////////////////////
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

import { getData, setData } from './dataStore.js';
import { isEmail } from 'validator';

// INTERFACES

/// ////////////////////////////////////////////////////////////////////////////

/** [1] adminAuthRegister
  *
  * Registers a user with an email, password, and name,
  * then returns their authUserId value.
  *
  * @param {string} email - user's email address
  * @param {string} password - user's password required for logging
  *                            into the Toohak platform
  * @param {string} nameFirst - user's first name
  * @param {string} nameLast - user's last name
  * ...
  * @returns {authUserId: number} - number representing a unique
  *                                 identifier for the user
  *
*/

export function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): String | { error: String }  {
  const store = getData();
  const userArr = store.users;

  const name = nameFirst + ' ' + nameLast;

  // checking for error cases
  if (!isEmail(email)) {
    return { error: 'email is not a valid email address' };
  } else if (userArr.some(user => user.email === email)) {
    return { error: 'email is used by another user' };
  }

  if (/[^A-Za-z' -]/.test(name)) {
    return { error: 'name contains invalid characters' };
  } else if (nameFirst.length < 2 || nameFirst.length > 20) {
    return { error: 'first name must be at least 2 characters and no more than 20' };
  } else if (nameLast.length < 2 || nameLast.length > 20) {
    return { error: 'last name must be at least 2 characters and no more than 20' };
  }

  if (password.length < 8) {
    return { error: 'password must be at least 8 characters' };
  } else if (!(/\d/.test(password) && /[a-zA-Z]/.test(password))) {
    return { error: 'password must contain at least one number and one letter' };
  }

  // registering the user to the database
  const iD = userArr.length + 1;
  const newUser = {
    authUserId: iD,
    name: name,
    email: email,
    password: password,
    numSuccessfulLogins: 1,
    numFailedPasswordSinceLastLogin: 0,
    passwordHistory: [password],
  };
  userArr.push(newUser);
  const sID = createSessionId();

  // creating token for session
  const session = {
    sessionId: sID,
    authUserId: iD,
  }; 
  store.sessions.push(session);
  return JSON.stringify(session);
}

function createSessionId(): number {
  return Math.random();
}

/** [2] adminAuthLogin
  *
  * Given a registered user's email and password returns
  * their authUserId value.
  *
  * @param {string} email - user's email address
  * @param {string} password - user's password required for logging
  *                            into the Toohak platform
  * ...
  * @returns {authUserId: number} - number representing a unique
  *                                 identifier for the user
  *
*/

export function adminAuthLogin(email: string, password: string) {
  const store = getData();
  const userArr = store.users;

  const user = userArr.find((user) => user.email === email);

  // checking for error cases
  if (!user) {
    return { error: 'Email address does not exist' };
  } else if (user.password !== password) {
    user.numFailedPasswordSinceLastLogin++;
    setData(store);
    return { error: 'Incorrect password' };

  // logging in the user
  } else {
    user.numSuccessfulLogins++;
    user.numFailedPasswordSinceLastLogin = 0;
    setData(store);
    return { authUserId: user.authUserId };
  }
}

/** [3] adminUserDetails
  *
  * Given an admin user's authUserId, returns details about the user.
  *
  * @param {number} authUserId - number representing a unique
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
  * } - an object with information about the user based on their authUserId
  *
*/

export function adminUserDetails(authUserId: {authUserId: number}) {
  const store = getData();
  const userArr = store.users;

  const user = userArr.find((user) => user.authUserId === authUserId.authUserId);

  // checking for error cases
  if (!user) {
    return { error: 'Invalid AuthUserId' };

  // returning object containing user details
  } else {
    return {
      user: {
        userId: user.authUserId,
        name: user.name,
        email: user.email,
        numSuccessfulLogins: user.numSuccessfulLogins,
        numFailedPasswordsSinceLastLogin: user.numFailedPasswordSinceLastLogin,
      }
    };
  }
}

/** [4] adminUserDetailsUpdate
  *
  * Gets all of the relevant information about the current quiz.
  *
  * @param {number} authUserId - number representing a unique
  *                              identifier for the user
  * @param {string} email - user's email address
  * @param {string} nameFirst - user's first name
  * @param {string} nameLast - user's last name
  * ...
  * @returns {} - empty object
*/
import validator from 'validator';

export function adminUserDetailsUpdate(authUserId: {authUserId: number}, email: string, nameFirst: string, nameLast: string) {
  const specialChars = /[@!#$%^&*()_+=[\]{};:"\\|,.<>/?]/;
  const data = getData();

  if (!Number.isInteger(authUserId)) {
    return { error: 'invalid userId' };
  }

  if (data.users.some(user => user.email === email && user.authUserId !== authUserId)) {
    return { error: 'email used by another user' };
  }

  if (!validator.isEmail(email)) {
    return { error: 'invalid email address' };
  }

  if (specialChars.test(nameFirst)) {
    return { error: 'first name contains invalid characters' };
  }

  if (nameFirst.length < 2) {
    return { error: 'first name is too short' };
  }

  if (nameFirst.length > 20) {
    return { error: 'first name is too long' };
  }

  if (specialChars.test(nameLast)) {
    return { error: 'last name contains invalid characters' };
  }

  if (nameLast.length < 2) {
    return { error: 'last name is too short' };
  }

  if (nameLast.length > 20) {
    return { error: 'last name is too long' };
  }

  const userIndex = data.users.findIndex(user => user.authUserId === authUserId);
  if (userIndex === -1) {
    return { error: 'userId does not exist' };
  }

  data.users[userIndex].email = email;
  data.users[userIndex].name = `${nameFirst} ${nameLast}`;
  return {};
}

/** [5] adminUserPasswordUpdate
  *
  * Gets all of the relevant information about the current quiz.
  *
  * @param {number} authUserId - number representing a unique
  *                              identifier for the user
  * @param {string} oldPassword - user's old password
  * @param {string} newPassword - user's new password
  * ...
  * @returns {} - empty object
*/

export function adminUserPasswordUpdate(authUserId: {authUserId: number}, oldPassword: string, newPassword: string) {
  const data = getData();

  const user = data.users.find(user => user.authUserId === authUserId);

  if (!Number.isInteger(authUserId)) {
    return { error: 'invalid userId' };
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

  if (user.password !== oldPassword) {
    return { error: 'incorrect password' };
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
