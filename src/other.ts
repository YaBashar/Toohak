/* /////////////////////////////////////////////////////////////////////////////
//////////////////////   TOOHAK ITERATION 2 'OTHER.TS'  ///////////////////////
///////////////////////////////////////////////////////////////////////////////

COMP1531 24T2 --- Major Project: `Toohak',
<https://nw-syd-gitlab.cseunsw.tech/COMP1531/24T2/groups/W11A_
CRUNCHIE/project-backend/-/blob/master/README.md>

This program was written by
z5478214 | z5599894 | z5525050 | z5362173 | z5478980
on 04/06/2024

other.js contains miscellanious stub functions for the Toohak project
back-end. This currently includes the clear function to reset the
application.

*//// //////////////////////////////////////////////////////////////////////////

// DEPENDENCIES

import { getData, setData } from './dataStore';

/// ////////////////////////////////////////////////////////////////////////////

/** [1] clear
  *
  * Reset the state of the application back to the start.
  *
  * @param {} - no parameters
  * ...
  * @returns {} - empty object
  *
*/
export function clear (): Record<string, never> {
  const store = getData();

  const fs = require('fs');
  fs.truncate('./data.json', 0, function() {});

  store.users = [];
  store.quizzes = [];
  store.sessions = [];
  store.trash = [];
  store.games = [];

  setData(store);
  return {};
}
