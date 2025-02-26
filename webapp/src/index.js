import React from 'react';
import i18n from './i18n/i18next.js';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Game from './components/game/Game.js';
import reportWebVitals from './reportWebVitals';
import { UserPofile } from './components/userMenu/UserProfile';


const root = ReactDOM.createRoot(document.getElementById('root'));

const answers = [
  {
    text: "React",
    isCorrect: true
  },
  {
    text: "Angular",
    isCorrect: false
  },
  {
    text: "Vue",
    isCorrect: false
  },
  {
    text: "Svelte",
    isCorrect: false
  }
];

const question = {
  text: "¿Qué librería web es esta?",
  image: "/logo512.png"
};

const gameHistory = [
  {
    "points": 1450,
    "correctAnswers": 18,
    "totalQuestions": 30,
    "date": "15/02/25",
    "questions": [
      {
        "imageUrl": "/logo512.png",
        "answers": [
          { "text": "Respuesta 1", "isCorrect": false },
          { "text": "Respuesta 2", "isCorrect": true },
          { "text": "Respuesta 3", "isCorrect": false },
          { "text": "Respuesta 4", "isCorrect": false }
        ]
      },
      {
        "imageUrl": "/logo512.png",
        "answers": [
          { "text": "Respuesta A", "isCorrect": false },
          { "text": "Respuesta B", "isCorrect": false },
          { "text": "Respuesta C", "isCorrect": true },
          { "text": "Respuesta D", "isCorrect": false }
        ]
      }
    ]
  },
  {
    "points": 1250,
    "correctAnswers": 14,
    "totalQuestions": 30,
    "date": "12/02/25",
    "questions": [
      {
        "imageUrl": "/logo512.png",
        "answers": [
          { "text": "Opción 1", "isCorrect": true },
          { "text": "Opción 2", "isCorrect": false },
          { "text": "Opción 3", "isCorrect": false },
          { "text": "Opción 4", "isCorrect": false }
        ]
      }
    ]
  }
];


root.render(
  <React.StrictMode>
    {/*<App /> */}
    <UserPofile userName={"uo294420"} numberOfGamesPlayed={5}/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
