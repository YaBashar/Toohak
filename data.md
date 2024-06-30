```javascript

const data = {
  users: [
    {
      authUserId: 1,
      name: 'Rani Jiang',
      email: 'ranivorous@gmail.com',
      password: '1234',
      numSuccessfulLogins: 0,
      numFailedPasswordSinceLastLogin: 0,
      passwordHistory: ['old password', 'new password'],
    },
  ],

  quizzes: [
    {
      quizId: 1,
      name: 'quiz 1',
      timeCreated: 1683125870,
      timeLastEdited: 1683125871,
      description: 'the first quiz',
      numQuestions: 1,
  
      questions: [
      {
        questionId: 5546,
        question: "Who is the Monarch of England?",
        duration: 4,
        points: 5,
        answers: [
          {
            answerId: 2384,
            answer: "Prince Charles",
            colour: "red",
            correct: true
          }
        ]
      }   
    ],
    
    authUserId: 1,
      
    },
  ],
};

```
[Optional] short description: 

The object 'data' contains an array of users and an array of quizzes. 
Each object in the array contains key information about the specific user or quiz.