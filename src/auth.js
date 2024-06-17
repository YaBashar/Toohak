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

/*
GLOBAL DEFINITIONS
*/

/*
DATA STRUCTURES
*/

///////////////////////////////////////////////////////////////////////////////
//////////////////////////   FUNCTION CONTENTS    /////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// adminAuthRegister: [1]
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

function adminAuthRegister(email, password, nameFirst, nameLast) {
  return {
    authUserId: 1,
  };
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

import validator from 'validator';

function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {
  const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '+', '=', '{', '}', '[', ']', 
                          ':', ';', '"', "'", '<', '>', '.', '?', '/', '|', '\\'];
  let index = data.users.indexOf(authUserId);
  if (typeof(authUserId) !== number) {
    return { error: 'invalid userId' };
  } else if (data.users.authUserId.includes(authUserId) === false) {
    return { error: 'userId not found' };
  } else if (1) {
    data.users.forEach(element => {
    if (element.email === email && element.authUserId !== authUserId) {
      return { error: 'email used by another user' };
    };
    });
  } else if (validator.isEmail(email) !== true) {
    return { error: 'invalid email address' };
  } else if (regex.specialChars(nameFirst) === true) {
    return { error: 'first name contains invalid characters'}
  } else if (nameFirst.length < 2) {
    return { error: 'first name is too short'};
  } else if (nameFirst.length > 20) {
    return { error: 'first name is too long'};
  } else if (regex.specialChars(nameLast) === true) {
    return { error: 'first name contains invalid characters'}
  } else if (nameLast.length < 2) {
    return { error: 'first name is too short'};
  } else if (nameLast.length > 20) {
    return { error: 'first name is too long'};
  } else {
    data.users[index].email = email;
    data.users[index].name = nameFirst.concat(" ", nameLast);
    return {};
  }
  return {};
}

export { adminUserDetailsUpdate };

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

function adminUserPasswordUpdate(authUserId, oldPassword, newPassword) {
  
}

export { adminUserPasswordUpdate };


