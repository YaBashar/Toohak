/*/////////////////////////////////////////////////////////////////////////////
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

*//////////////////////////////////////////////////////////////////////////////

// DEPENDENCIES 

import { getData, setData } from './dataStore.js';
import { isEmail } from 'validator';

// INTERFACES
interface SessionId {
  token: String,
}

interface Error {
  error: String,
}

///////////////////////////////////////////////////////////////////////////////

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
  * @returns {SessionId} - string representing a unique 
  *                                 identifier for the session
  * 
*/

export function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): SessionId | Error {

  let store = getData();
  let userArr = store.users;

  const name = nameFirst + ' ' + nameLast;

  // checking for error cases
  if(!isEmail(email)){
    return { error: 'email is not a valid email address' };

  } else if (userArr.some(user => user.email === email)) {
    return { error: 'email is used by another user' };
  } 

  if (/[^A-Za-z'\ \-]/.test(name)) {
    return { error: 'name contains invalid characters' };

  } else if (nameFirst.length < 2 || nameFirst.length > 20) {
    return { error: 'first name must be at least 2 characters and no more than 20' };

  } else if (nameLast.length < 2 || nameLast.length > 20) {
    return { error: 'last name must be at least 2 characters and no more than 20' };
  }

  if (password.length < 8) {
    return { error: 'password must be at least 8 characters' };

  } else if (!(/\d/.test(password) && /[a-zA-Z]/.test(password))) {
    return { error: 'password must contain at least one number and one letter'};
  }

  // registering the user to the database
  const iD = userArr.length + 1;
  const sessionId = createSessionId();

  let newUser = {
    authUserId: iD,
    name: name,
    email: email,
    password: password,
    numSuccessfulLogins: 1,
    numFailedPasswordSinceLastLogin: 0,
    passwordHistory: [password,],  
    sessions: [sessionId,]  
  };

  userArr.push(newUser);
  setData(store);
  return {token: sessionId};
}

function createSessionId () {
  return (Math.random()).toString();
};


