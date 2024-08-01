```javascript

const data = {
  users: [
    {
      userId: 1,
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
        thumbnailUrl: 'https:///'
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
    
    userId: 1,
      
    },
  ],

  sessions: [
    {
      sessionId: 467894,
      userId: 1,
    }
  ],


  games: [
    // when a quiz is yet to start. this is what create session will do to the database.
    {
      sessionId: 453,
      status: LOBBY, 
      quizId: 48793,
      autoNumStart: 3,                         // eg auto start game when 3 players join
      players: [], 
      numQuestions: 2,                        
      activeQuestion: 0,                       // no active question yet
      questionResults: [                       // session create will set this up for each q in quiz
        {
          questionId: 45795749, 
          playersCorrectList: [],
          averageAnswerTime: 0, 
          percentageCorrect: 0          
        }, 
        {
          questionId: 90385473, 
          playersCorrectList: [],
          averageAnswerTime: 0, 
          percentageCorrect: 0          
        }, 
      ]
    },

    {
      sessionId: 234,
      status: QUESTION_OPEN,                   // session in the middle of a game
      autoNumStart: 3,                         // eg auto start game when 2 players join
      players: [
        {
          playerId: 3456,
          name: 'player one',
          atQuestion: 2                        // player answering question 2 (starts from 1)
          points: 7                            // current total points
        },
        {
          playerId: 3456,
          name: 'player two',    
          atQuestion: 2                        
          points: 13,                                      
        },      
      ],
      numQuestions: 3,                          // ie there are three questions in this quiz
      activeQuestion: 54798754                 // questionId of current question. matches q2
      questionResults: [
        {
          questionId: 347976, 
          playersCorrectList: [
            'player one'                       // players with correct answers are added here + points update 
          ],
          averageAnswerTime: 35,               
          percentageCorrect: 50,               // 50% got answer right       
        }, 
        {
          questionId: 54798754,                // current question
          playersCorrectList: [
            'player two'                       // players can't see updated results until answer_show
          ],
          averageAnswerTime: 12,               // p2 has more points even because of time scaling + weight
          percentageCorrect: 50,          
        }, 
        {
          questionId: 0387028,                 // next and last question. still empty. 
          playersCorrectList: [],
          averageAnswerTime: 0, 
          percentageCorrect: 0          
        }, 
      ]
    }
  ]


};

```

[Optional] short description: 

The object 'data' contains an array of users and an array of quizzes. 
Each object in the array contains key information about the specific user or quiz.