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
import { UserDetails } from './interface';
import {
  uniqueId, registerErrorChecking, loginErrorChecking,
  updateDetailsErrorChecking, updatePasswordErrorChecking
} from './helper';

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
export function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): { token: string } | { error: string } {
  const store = getData();
  const userArr = store.users;
  const name = nameFirst + ' ' + nameLast;

  const check = registerErrorChecking(email, password, nameFirst, nameLast);

  if (check !== 'passed') {
    return { error: check };
  }

  // registering the user to the database
  const newUserId = userArr.length + 1;
  const newUser = {
    authUserId: newUserId,
    name: name,
    email: email,
    password: password,
    numSuccessfulLogins: 1,
    numFailedPasswordSinceLastLogin: 0,
    passwordHistory: [password],
  };
  userArr.push(newUser);
  const sID = uniqueId(store.sessions);

  // creating token for sessions
  const session = {
    sessionId: sID,
    authUserId: newUserId,
  };
  store.sessions.push(session);
  return { token: sID.toString() };
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
  * @returns {token: number} - number representing a unique
  *                                 identifier for the user
  *
*/

export function adminAuthLogin(email: string, password: string): { token: string} | { error: string} {
  const store = getData();
  const userArr = store.users;

  const user = userArr.find((user) => user.email === email);
  const check = loginErrorChecking(email, password);

  if (check !== 'passed') {
    return { error: check };
  }

  // logging in the user
  user.numSuccessfulLogins++;
  user.numFailedPasswordSinceLastLogin = 0;

  const sID = uniqueId(store.sessions);

  // creating token for session
  const session = {
    sessionId: sID,
    authUserId: user.authUserId,
  };

  store.sessions.push(session);
  return { token: sID.toString() };
}

/** [3] adminUserDetails
  *
  * Given an admin user's authUserId, returns details about the user.
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
  * } - an object with information about the user based on their authUserId
  *
*/

export function adminUserDetails(token: number): UserDetails| { error: string} {
  const store = getData();
  const userArr = store.users;
  const user = userArr.find((user) => user.authUserId === token);

  // checking for error cases
  if (!user) {
    return { error: 'invalid token' };
  // returning object containing user details
  } else {
    return {
      user: {
        authUserId: user.authUserId,
        name: user.name,
        email: user.email,
        numSuccessfulLogins: user.numSuccessfulLogins,
        numFailedPasswordSinceLastLogin: user.numFailedPasswordSinceLastLogin,
      }
    };
  }
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

export function adminUserDetailsUpdate(token: number, email: string, nameFirst: string, nameLast: string) : Record<string, never> | { error : string} {
  const data = getData();

  const check = updateDetailsErrorChecking(token, email, nameFirst, nameLast);
  if (check !== 'passed') {
    return { error: check };
  }

  const userIndex = data.users.findIndex(user => user.authUserId === token);
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
export function adminUserPasswordUpdate(token: number, oldPassword: string, newPassword: string): Record<string, never> | { error : string} {
  const data = getData();
  const user = data.users.find(user => user.authUserId === token);

  const check = updatePasswordErrorChecking(token, oldPassword, newPassword);
  if (check !== 'passed') {
    return { error: check };
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
export function adminAuthLogout(token: string): Record<string, never> | { error : string} {
  const result = parseFloat(token);
  const store = getData();
  const sessArr = store.sessions;

  const session = sessArr.find((x) => x.sessionId === result);

  if (!session) {
    return { error: 'invalid token' };
  }

  const index = sessArr.indexOf(session);
  sessArr.splice(index);

  return {};
}
