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

function adminUserPasswordUpdate(authUserId, oldPassword, newPassword) {
  let index = data.users.indexOf(authUserId);
  const alphabet = [a-zA-Z];
  const numbers = [0-9];
  if (typeof(authUserId) !== number) {
    return { error: 'invalid userId' };
  } else if (data.users.authUserId.includes(authUserId) === false) {
      return { error: 'userId not found' };
  } else if (data.users[index].password !== oldPassword) {
    return { error: 'incorrect password' };
  } else if (oldPassword === newPassword) {
    return { error: 'new password is the same as old password' };
  } else if (1) {
    data.users.passwordHistory.forEach(element => {
    if (element === newPassword) {
      return { error: 'password has already been used' };
    };
    });
  } else if (newPassword.length < 8) {
    return { error: 'password is too short' };
  } else if (regex.alphabet(newPassword) !== true || regex.numbers(newPassword) !== true) {
    return { error: 'new password should contain at least one letter and one number'}
  } else {
    data.users.passwordHistory.push(oldPassword);
    data.users[index].password = newPassword;
    return {};
  }
  return {};
}

export { adminUserPasswordUpdate };


