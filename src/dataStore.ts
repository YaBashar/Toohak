// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
 
// Interfaces which define User, quiz and session data
export interface UserData {
  authUserId: number;
  name: string;
  email: string;
  password: string;
  numSuccessfulLogins: number;
  numFailedPasswordSinceLastLogin: number;
  passwordHistory: string[];
}
 
export interface QuizData {
  quizId: number;
  name: string;
  description: string;
  timeCreated: number;
  timeLastEdited: number;
  authUserId: number;
}
 
export interface SessionData {
  sessionId: number,
  authUserId: number,
}
 
export interface AppData {
  users: UserData[];
  quizzes: QuizData[];
  sessions: SessionData[];
}
 
// Interfaces specific to the return type of respective functions
 
export interface AdminAuthRegister {
  token : number;
}
 
export interface AdminAuthLogin {
  authUserId : number;
}
 
export interface AdminUserDetails {
  user : {
  authUserId: number;
  name: string;
  email: string;
  numSuccessfulLogins: number;
  numFailedPasswordSinceLastLogin: number;
  }
}
 
export interface ErrorResponse {
  error : string;
}
 
export interface QuizList {
  quizId: number;
  name: string;
}
 
export interface QuizInfo {
  quizId: number;
  name: string;
  description: string;
  timeCreated: number;
  timeLastEdited: number;
}
 
let data: AppData = {
  users: [],
  quizzes: [],
  sessions: [],
};
 
// YOU SHOULD MODIFY THIS OBJECT ABOVE ONLY
 
// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1
 
/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }
 
    names = store.names
 
    names.pop()
    names.push('Jake')
 
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/
 
// Use get() to access the data
function getData() {
  return data;
}
 
// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData : AppData) {
  data = newData;
}
 
export { getData, setData };
 
 