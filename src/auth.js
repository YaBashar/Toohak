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

	auth.js contains the stub functions for... 

	
*/

///////////////////////////////////////////////////////////////////////////////
/////////////////////////   GLOBAL DECLARATIONS    ////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/*
INCLUDED PACKAGES
*/

/*
GLOBAL DEFINITIONS
*/

/*
DATA STRUCTURES
*/

///////////////////////////////////////////////////////////////////////////////
/////////////////////////   FUNCTION PROTOTYPES    ////////////////////////////
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
  * <Registers a user with an email, password, and name, 
  *  then returns their authUserId value.>
  * 
  * @param {string} email - string containing user's email address
  * @param {string} password - string containing user's password
  * @param {string} nameFirst - string containing user's first name
  * @param {string} nameLast - string containing user's last name
  * ...
  * 
  * @returns {integer} - integer representing authUserId
  * 
*/

function adminAuthRegister(email, password, nameFirst, nameLast) {
    return {
        authUserId: 1,
    };
}


/** [2] adminAuthLogin
  * 
  * <Given a registered user's email and password returns 
  * their authUserId value.>
  * 
  * @param {string} email - string containing user's email address
  * @param {string} password - string containing user's password
  * ...
  * 
  * @returns {integer} - integer representing authUserId
  * 
*/

function adminAuthLogin(email, password) {
    return {
        authUserId: 1,
    };
}


/** [2] adminUserDetails
  * 
  * <Given an admin user's authUserId, returns details about the user.>
  * 
  * @param {integer} authUserId - integer representing authUserId
  * ...
  * 
  * @returns {integer} - authUserId: user's id number
  * @returns {string} - name: user's full name
  * @returns {string} - email: user's email address
  * @returns {integer} - numSuccessfulLogins: number of successful logins
  * @returns {integer} - numFailedPasswordsSinceLastLogin: number of failed
  *                      logins
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