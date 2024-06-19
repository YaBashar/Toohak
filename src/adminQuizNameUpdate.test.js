import { adminQuizInfo, adminQuizNameUpdate } from "./quiz.js";
import { adminAuthRegister } from "./auth.js";
import { adminQuizCreate } from "./quiz.js";
import { clear } from "./other.js";

beforeEach(() => {
  clear();
});

describe ("adminQuizNameUpdate Tests", () => {
  describe ("Error Cases", () => {
    let authUserId;
    let quizId;
   
    beforeEach( () => {
      authUserId = adminAuthRegister("email", "password" , "firstname", "lastname");
      quizId = adminQuizCreate(authUserId, "quizname", "description");
      
    });

    test.each([
      {
        testName : "Check fail for quiz with invalid quiz name",
        quizName :  "Name",
        errorMessage : expect.any(String),
      },
      {
        testName : "Check fail for empty input",
        quizName : " ",
        errorMessage : expect.any(String) ,
      },
      {
        testName : "Check fail on short names" ,
        quizName : "a",
        errorMessage : expect.any(String),
      },
      {
        testName : "Check fail on short names" ,
        quizName : "ab",
        errorMessage : expect.any(String),
      },
      {
        testName : "Check fail on short names" ,
        quizName : "abc",
        errorMessage : expect.any(String),
      },
      {
        testName : "Check fail for names longer than 30 characters" ,
        quizName : "abcdefghijklmnopqrstuvwxyzabcde",
        errorMessage : expect.any(String) ,
      },
      {
        testName : "Check fail for quiz name with symbols" ,
        quizName : "&",
        errorMessage : expect.any(String) ,
      }

    ])("Test $# => $testName", ({quizName, errorMessage}) => {
      const name = adminQuizNameUpdate(authUserId, quizId, quizName);
      expect(name).toStrictEqual( {error :  errorMessage});
      
    });

    //Testing Invalid User id and Quiz id
    test ("Invalid User id", () => {
      const name = adminQuizNameUpdate(authUserId + 1, quizId, "Name");
      expect(name).toStrictEqual( {error : expect.any(String)});
    });
  
    test ("Invalid Quiz id", () =>{
      const name = adminQuizNameUpdate(authUserId, quizId + 1, "Name");
      expect(name).toStrictEqual( {error : expect.any(String)});
    });
  });
  

  describe ("Success Cases", () => {
    let authUserId;
    let quizId;
  
    beforeEach( () => {
      authUserId = adminAuthRegister("email", "password" , "firstname", "lastname");
      quizId = adminQuizCreate(authUserId, "quizname", "description");
    });

    test ("Check that function returns empty object", () => {
      const name = adminQuizNameUpdate(authUserId, quizId, "Name");
      expect(name).toStrictEqual({});
    });

    test ("Check name has been updated successfully", () => {
      const name = adminQuizNameUpdate(authUserId, quizId, "newName");
      expect(name).toStrictEqual({authUserId, quizId, name: "newName"});
    });

    test ("QuizInfo gives updated name",() => {
      adminQuizNameUpdate(authUserId, quizId, "newName");
      const quiz = adminQuizInfo(authUserId, quizId);
      expect(quiz).toStrictEqual
      ({ 
        quizId: quizId,
        name: "newName",
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: "description"});
    });
  });
});



