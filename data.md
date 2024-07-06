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
      description: 'the first quiz',
      timeCreated: 1683125870,
      timeLastEdited: 1683125871,
      authUserId: 1,
    },
  ],

  sessions: [
    {
      sessionId: 467894,
      authUserId: 1,
    }
  ]
};

```
[Optional] short description: 

The object 'data' contains an array of users and an array of quizzes. 
Each object in the array contains key information about the specific user or quiz.