///////////////////////////////////////////////////////////////////////////////
//////////////////////   TOOHAK ITERATION 0 'AUTH.JS'  ////////////////////////
///////////////////////////////////////////////////////////////////////////////

/*

	COMP1531 24T2 --- Major Project: `Toohak', 
	<https://nw-syd-gitlab.cseunsw.tech/COMP1531/24T2/groups/W11A_
  CRUNCHIE/project-backend/-/blob/master/README.md>

	This program was written by 
  z5478214 | z5599894 | z5525050 | z5362173 | z5478980
  on 04/06/2024

	auth.js currently contains the authentification stub functions for the 
  Toohak project backend. These functions manage the authentification 
  process of the site, including user details, login mechanics, and updating 
  passwords and usernames. 
	
*/

///////////////////////////////////////////////////////////////////////////////
/////////////////////////   GLOBAL DECLARATIONS    ////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/*
DEPENDENCIES
*/
import { getData, setData } from "./dataStore.js";
import { isEmail } from "validator";

/*
GLOBAL DEFINITIONS
*/

/*
DATA STRUCTURES
*/

///////////////////////////////////////////////////////////////////////////////
//////////////////////////   FUNCTION CONTENTS    /////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/* adminAuthRegister: [1]
    - checkEmail                 (1.1)
    - checkName                  (1.2)
    - checkPassword              (1.3)
*/

// adminAuthLogin: [2]
// adminUserDetails: [3]
// adminUserDetailsUpdate: [4]
// adminUserPasswordUpdate: [5]


///////////////////////////////////////////////////////////////////////////////
//////////////////////////////   FUNCTIONS   //////////////////////////////////
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
  * @returns {authUserId: number} - number representing a unique 
  *                                 identifier for the user
  * 
*/

export function adminAuthRegister(email, password, nameFirst, nameLast) {

  let store = getData();
  let userArr = store.users;

  const name = nameFirst + ' ' + nameLast;

  if(!checkEmail(email, userArr)) {
    return {error: 
      'email is invalid or has already been registered'
    };
  }

  if(!checkName(name)) {
    return {error: 
      'name contains invalid characters'
    };
  }

  if(!checkPassword(password)) {
    return {error: 
      'password must be at least 8 characters and include one letter and number'
    }
  }

  // TODO: change id creation method to ensure unique id is created each time
  const iD = userArr.length + 1;

  let newUser = {
    authUserId: iD,
    name: name,
    email: email,
    password: password,
    numSuccessfulLogins: 0,
    numFailedPasswordSinceLastLogin: 0,
    passwordHistory: [password,],    
  };

  userArr.push(newUser);
  setData(store);

  return {authUserId: iD};
}


function checkEmail(email, userArr) {
  if (!isEmail(email) || userArr.some((user) => user.email === email)) {
    return false;
  } else {
    return true;
  }
}

function checkName(name) {
  if (/[^A-Za-z0-9'\ \-]/.test(name)) {
    return false;
  } else {
    return true;
  }
}

function checkPassword(password) {
  if (password.length < 8 || !(/\d/.test(password) && /[a-zA-z]/.test(password))) {
    return false;
  } else {
    return true;
  }
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

function adminAuthLogin(email, password) {
  return {
    authUserId: 1,
  };
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

function adminUserDetails(authUserId) {
  return {
    user: 
      {
        userId: 1,
        name: 'Hayden Smith',
        email: 'hayden.smith@unsw.edu.au',
        numSuccessfulLogins: 3,
        numFailedPasswordsSinceLastLogin: 1,
      }
  };
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

function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {
  
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

export function adminUserPasswordUpdate(authUserId, oldPassword, newPassword) {
  let data = getData();

  const user = data.users.findIndex(user => user.authUserId === authUserId);

  if (!Number.isInteger(user.authUserId)) {
    return { error: 'invalid userId' };
  };

  if (user.password !== oldPassword) {
    return { error: 'incorrect password' };
  };
  
  if (oldPassword === newPassword) {
    return { error: 'new password is the same as old password' };
  };
  
  if (user.passwordHistory.includes(newPassword)) {
    return { error: 'password has already been used' };
  };
  
  if (newPassword.length < 8) {
    return { error: 'password is too short' };
  };

  if (user.password !== oldPassword) {
    return { error: 'incorrect password' };
  };
  
  const hasNumber = /\d/.test(newPassword);
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  if (!hasNumber || !hasLetter) {
    return { error: 'new password should contain at least one letter and one number' };
  }

  user.passwordHistory.push(newPassword);
  user.password = newPassword;

  return {};
}


