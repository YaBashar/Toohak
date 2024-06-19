/** [12] clear
  *
  * Reset the state of the application back to the start.
  *
  * @param {} - no parameters
  * ...
  * @returns {} - empty object
  *
*/
import { getData, setData } from "./dataStore";

export function clear () {
  let store = getData();    

  store.users = [];
  store.quizzes = [];       

  setData(store);           
  return {};          
}
