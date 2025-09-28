import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { 
  calculateEarnedBadges, 
  saveBadgesToStorage, 
  getBadgeAchievementMessage 
} from '../utils/badgeSystem';
import { useButtonSounds } from '../utils/useButtonSounds';

const Flashcards = ({ category, difficulty, activity, onComplete }) => {
  const navigate = useNavigate();
  const { getButtonSoundHandlers } = useButtonSounds();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showCorrect, setShowCorrect] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    startTime: new Date(),
    questionTimes: [],
    firstQuestionCorrect: false
  });
  const [showBadgePreview, setShowBadgePreview] = useState(false);
  const [previewBadge, setPreviewBadge] = useState(null);
  
  // Cashier game specific state
  const [cashierScore, setCashierScore] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [gameStep, setGameStep] = useState(1); // 1: customer speaks, 2: cashier selects items, 3: complete
  const [showThoughtBubble, setShowThoughtBubble] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState('customer'); // 'customer' or 'cashier'
  const [speechText, setSpeechText] = useState('');

  // Hygiene game specific state
  const [hygieneScore, setHygieneScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [usedScenarios, setUsedScenarios] = useState([]);
  const [showCharacter, setShowCharacter] = useState(true);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successAnimationText, setSuccessAnimationText] = useState('');
  const [currentScenario, setCurrentScenario] = useState(null);
  const [isHygieneGameActive, setIsHygieneGameActive] = useState(false);

  // Safe Street Crossing game specific state
  const [streetScore, setStreetScore] = useState(0);
  const [streetRound, setStreetRound] = useState(1);
  const [streetScenario, setStreetScenario] = useState(null);
  const [isStreetGameActive, setIsStreetGameActive] = useState(false);
  const [showWalkingAnimation, setShowWalkingAnimation] = useState(false);
  const [showStreetFeedback, setShowStreetFeedback] = useState(false);
  const [streetFeedbackMessage, setStreetFeedbackMessage] = useState('');
  const [streetFeedbackType, setStreetFeedbackType] = useState(''); // 'safe' or 'unsafe'

  // Social Greetings game specific state
  const [greetingsScore, setGreetingsScore] = useState(0);
  const [greetingsRound, setGreetingsRound] = useState(1);
  const [currentGreetingScenario, setCurrentGreetingScenario] = useState(null);
  const [isGreetingsGameActive, setIsGreetingsGameActive] = useState(false);
  const [showGreetingAnimation, setShowGreetingAnimation] = useState(false);
  const [showGreetingFeedback, setShowGreetingFeedback] = useState(false);
  const [greetingFeedbackMessage, setGreetingFeedbackMessage] = useState('');
  const [greetingFeedbackType, setGreetingFeedbackType] = useState(''); // 'correct' or 'incorrect'
  const [characterSpeech, setCharacterSpeech] = useState('');
  const [showCharacterThought, setShowCharacterThought] = useState(false);
  const [greetingAnswered, setGreetingAnswered] = useState(false);
  const [greetingSelectedChoice, setGreetingSelectedChoice] = useState(null);

  // Money Value Game specific state
  const [moneyScore, setMoneyScore] = useState(0);
  const [moneyRound, setMoneyRound] = useState(1);
  const [currentBudget, setCurrentBudget] = useState(0);
  const [currentMoneyItems, setCurrentMoneyItems] = useState([]);
  const [isMoneyGameActive, setIsMoneyGameActive] = useState(false);
  const [selectedPurchases, setSelectedPurchases] = useState([]);
  const [moneyFeedbackMessage, setMoneyFeedbackMessage] = useState('');
  const [showMoneyFeedback, setShowMoneyFeedback] = useState(false);
  const [moneyFeedbackType, setMoneyFeedbackType] = useState(''); // 'correct' or 'wrong'
  const [showPurchaseAnimation, setShowPurchaseAnimation] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);
  const [showBadgeCompletion, setShowBadgeCompletion] = useState(false);
  const [isRoundComplete, setIsRoundComplete] = useState(false);

    const videoRef = useRef(null);
  const audioRef = useRef(null);
  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);
  const badgeAudioRef = useRef(null);

  const celebrationSound = "/src/assets/sounds/Activitycompletion.mp3"; // Place your sound file here
  const correctSound = "/src/assets/sounds/correct.mp3"; 
  const wrongSound = "/src/assets/sounds/wrong.mp3";
  const badgeCelebrationSound = "/src/assets/sounds/Activitycompletion.mp3";

  // Pause video and play sound when modal appears
  useEffect(() => {
    if (showModal) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    }
  }, [showModal]);

    useEffect(() => {
    if (showCorrect && correctAudioRef.current) {
      correctAudioRef.current.currentTime = 0;
      correctAudioRef.current.play();
    }
  }, [showCorrect]);

  useEffect(() => {
    if (showWrong && wrongAudioRef.current) {
      wrongAudioRef.current.currentTime = 0;
      wrongAudioRef.current.play();
    }
  }, [showWrong]);

  // Sample questions data - you can organize this by category, difficulty, and activity
  const questionsData = {
    Academic: {
      Easy: {
        Identification: [
          {
            questionText: "What are they doing?", 
            videoSrc: "/src/assets/flashcards/brushyourteeth.mp4",
            answerChoices: ["Sleeping", "Eating", "Reading a Book", "Brushing Teeth"],
            correctAnswer: "Brushing Teeth"   
          },
          {
            questionText: "What animal is this?",
            videoSrc: "/src/assets/flashcards/dog_academic.mp4",
            answerChoices: ["Dog", "Cat", "Fish", "Bird"],
            correctAnswer: "Dog"
          },
          {
            questionText: "What number is this?",
            videoSrc: "/src/assets/flashcards/Easy-identificaction/number9.mp4",
            answerChoices: ["Eight", "Seven", "Nine", "Ten"],
            correctAnswer: "Nine"
          },
          {
            questionText: "What number is this?",
            videoSrc: "/src/assets/flashcards/Easy-identificaction/number4.mp4",
            answerChoices: ["Four", "Eight", "Six", "Ten"],
            correctAnswer: "Four"
          },
          {
            questionText: "What number is this?",
            videoSrc: "/src/assets/flashcards/Easy-identificaction/number8.mp4",
            answerChoices: ["Six", "Nine", "Eight", "Three"],
            correctAnswer: "Eight"
          }
        ],
        Numbers: [
          {
            questionText: "How many cows are there?",
            imageSrc: "/src/assets/cow.png",
            answerChoices: ["Six", "Seven", "Eight", "Five"],
            correctAnswer: "Seven"
          },
          {
            questionText: "What number is missing?",
            videoSrc: "/src/assets/flashcards/Easy-Numbers/numbers-4-easy.mp4",
            answerChoices: ["One", "Two", "Three", "Four"],
            correctAnswer: "Four"
          },
          {
            questionText: "What number are missing?",
            videoSrc: "/src/assets/flashcards/Easy-Numbers/numbers-1-easy.mp4",
            answerChoices: ["Three", "Four", "Two", "One"],
            correctAnswer: "One"
          },
          {
            questionText: "What numbers are missing?",
            videoSrc: "/src/assets/flashcards/Easy-Numbers/number6&7-easy.mp4",
            answerChoices: ["Six and Seven", "Six and Eight", "Five and Seven", "Five and Eight"],
            correctAnswer: "Six and Seven"
          },
          {
            questionText: "What number is missing?",
            videoSrc: "/src/assets/flashcards/Easy-Numbers/numbers-2-easy.mp4",
            answerChoices: ["Two", "Five", "Three", "Six"],
            correctAnswer: "Two"
          },
        ],
        Colors: [
          {
            questionText: "What color is this?",
            imageSrc: "/src/assets/flashcards/blue_circle.jpg",
            answerChoices: ["Red", "Blue", "Green", "Yellow"],
            correctAnswer: "Blue"
          }
        ],
        Shapes: [
          {
            questionText: "Which shape is this?",
            imageSrc: "/src/assets/flashcards/triangle.png",
            answerChoices: ["Circle", "Triangle", "Square", "Rectangle"],
            correctAnswer: "Triangle"
          }
        ],
        MatchingType: [
          {
            questionText: "How do you spell this word?",
            imageSrc: "/src/assets/flashcards/cat.jpg",
            answerChoices: ["CAT", "COT", "CUT", "BAT"],
            correctAnswer: "CAT"
          }
        ]
      },
      Medium: {
        // Add medium difficulty questions here
      },
      Hard: {
        // Add hard difficulty questions here
      }
    },
    "Social / Daily Life Skill": {
      Easy: {
        "Cashier Game": [
          {
            questionText: "I want a burger and fries, please!",
            orderItems: ["Burger", "Fries"],
            menuOptions: [
              { name: "Burger", image: "🍔", price: "$3.99" },
              { name: "Fries", image: "🍟", price: "$2.49" },
              { name: "Pizza", image: "🍕", price: "$4.99" },
              { name: "Hot Dog", image: "🌭", price: "$2.99" },
              { name: "Drink", image: "🥤", price: "$1.99" },
              { name: "Ice Cream", image: "🍦", price: "$2.99" }
            ],
            correctAnswer: ["Burger", "Fries"],
            gameType: "cashier"
          },
          {
            questionText: "Can I have a pizza slice and a drink?",
            orderItems: ["Pizza", "Drink"],
            menuOptions: [
              { name: "Burger", image: "🍔", price: "$3.99" },
              { name: "Fries", image: "🍟", price: "$2.49" },
              { name: "Pizza", image: "🍕", price: "$4.99" },
              { name: "Hot Dog", image: "🌭", price: "$2.99" },
              { name: "Drink", image: "🥤", price: "$1.99" },
              { name: "Ice Cream", image: "🍦", price: "$2.99" }
            ],
            correctAnswer: ["Pizza", "Drink"],
            gameType: "cashier"
          },
          {
            questionText: "I'll take a hot dog, please!",
            orderItems: ["Hot Dog"],
            menuOptions: [
              { name: "Burger", image: "🍔", price: "$3.99" },
              { name: "Fries", image: "🍟", price: "$2.49" },
              { name: "Pizza", image: "🍕", price: "$4.99" },
              { name: "Hot Dog", image: "🌭", price: "$2.99" },
              { name: "Drink", image: "🥤", price: "$1.99" },
              { name: "Ice Cream", image: "🍦", price: "$2.99" }
            ],
            correctAnswer: ["Hot Dog"],
            gameType: "cashier"
          },
          {
            questionText: "I want fries and ice cream, please!",
            orderItems: ["Fries", "Ice Cream"],
            menuOptions: [
              { name: "Burger", image: "🍔", price: "$3.99" },
              { name: "Fries", image: "🍟", price: "$2.49" },
              { name: "Pizza", image: "🍕", price: "$4.99" },
              { name: "Hot Dog", image: "🌭", price: "$2.99" },
              { name: "Drink", image: "🥤", price: "$1.99" },
              { name: "Ice Cream", image: "🍦", price: "$2.99" }
            ],
            correctAnswer: ["Fries", "Ice Cream"],
            gameType: "cashier"
          },
          {
            questionText: "Can I get a burger, fries, and a drink?",
            orderItems: ["Burger", "Fries", "Drink"],
            menuOptions: [
              { name: "Burger", image: "🍔", price: "$3.99" },
              { name: "Fries", image: "🍟", price: "$2.49" },
              { name: "Pizza", image: "🍕", price: "$4.99" },
              { name: "Hot Dog", image: "🌭", price: "$2.99" },
              { name: "Drink", image: "🥤", price: "$1.99" },
              { name: "Ice Cream", image: "🍦", price: "$2.99" }
            ],
            correctAnswer: ["Burger", "Fries", "Drink"],
            gameType: "cashier"
          }
        ],
        "Shopping Skills": [
          {
            questionText: "You need to buy milk. Where should you go?",
            imageSrc: "/src/assets/flashcards/grocery_store.jpg",
            answerChoices: ["Grocery Store", "Library", "Bank", "Post Office"],
            correctAnswer: "Grocery Store"
          }
        ],
        "Social Greetings": [
          {
            id: 1,
            title: "Morning Greeting to Parents",
            situation: "You just woke up and see your parent in the kitchen making breakfast",
            context: "morning",
            background: "🏠 Home Kitchen",
            character: "👩‍🍳",
            characterType: "Parent",
            studentThought: "I should greet my parent nicely!",
            otherCharacterSpeech: "Good morning, sweetheart! Did you sleep well?",
            choices: [
              {
                text: "Good morning, Mom!",
                emoji: "🌅",
                correct: true,
                feedback: "Perfect! Starting the day with a nice greeting makes everyone happy!"
              },
              {
                text: "Good night!",
                emoji: "🌙", 
                correct: false,
                feedback: "That's for bedtime! Try a morning greeting instead."
              },
              {
                text: "Goodbye!",
                emoji: "👋",
                correct: false,
                feedback: "That's for when you're leaving. Try a greeting for when you wake up!"
              },
              {
                text: "See you later!",
                emoji: "👀",
                correct: false,
                feedback: "That's for when you're going away. What would you say when you first see someone?"
              }
            ]
          },
          {
            id: 2,
            title: "Morning Greeting to Teacher",
            situation: "You arrive at school and your teacher smiles at you in the classroom",
            context: "morning",
            background: "🏫 School Classroom",
            character: "👩‍🏫",
            characterType: "Teacher",
            studentThought: "I should be polite to my teacher!",
            otherCharacterSpeech: "Hello! Welcome to class today!",
            choices: [
              {
                text: "Good morning, Teacher!",
                emoji: "📚",
                correct: true,
                feedback: "Excellent! Polite greetings show respect to your teacher!"
              },
              {
                text: "Hi Mom!",
                emoji: "👩",
                correct: false,
                feedback: "That's not your mom - it's your teacher! Try again."
              },
              {
                text: "Bye!",
                emoji: "👋",
                correct: false,
                feedback: "That's for leaving, not arriving! What would you say when you first get to school?"
              },
              {
                text: "Good night!",
                emoji: "🌙",
                correct: false,
                feedback: "That's for bedtime! Try a morning greeting instead."
              }
            ]
          },
          {
            id: 3,
            title: "Greeting a Friend at Recess",
            situation: "Your friend is playing on the playground and notices you approaching",
            context: "afternoon",
            background: "🛝 School Playground",
            character: "👦",
            characterType: "Friend",
            studentThought: "My friend looks like they're having fun!",
            otherCharacterSpeech: "Hey! Want to play with me?",
            choices: [
              {
                text: "Hi! That looks fun!",
                emoji: "😊",
                correct: true,
                feedback: "Great! Friendly greetings help make strong friendships!"
              },
              {
                text: "Good morning!",
                emoji: "🌅",
                correct: false,
                feedback: "It's recess time, not morning! Try a more casual greeting."
              },
              {
                text: "Goodbye!",
                emoji: "👋",
                correct: false,
                feedback: "That's for leaving, but you just arrived! Try saying hello instead."
              },
              {
                text: "Good night!",
                emoji: "🌙",
                correct: false,
                feedback: "That's for bedtime! What would you say to a friend during playtime?"
              }
            ]
          },
          {
            id: 4,
            title: "Saying Goodbye After School",
            situation: "The school bell rings and it's time to say goodbye to everyone",
            context: "afternoon",
            background: "🎒 School Classroom",
            character: "👩‍🏫",
            characterType: "Teacher",
            studentThought: "The day is ending, I should say goodbye nicely!",
            otherCharacterSpeech: "Have a wonderful day everyone! See you tomorrow!",
            choices: [
              {
                text: "Goodbye Teacher! See you tomorrow!",
                emoji: "👋",
                correct: true,
                feedback: "Wonderful! Saying goodbye nicely ends the day on a positive note!"
              },
              {
                text: "Good morning!",
                emoji: "🌅",
                correct: false,
                feedback: "The day is ending, not starting! Try a goodbye greeting."
              },
              {
                text: "Hi!",
                emoji: "😊",
                correct: false,
                feedback: "That's for when you arrive! What do you say when you're leaving?"
              },
              {
                text: "Thank you for breakfast!",
                emoji: "🍳",
                correct: false,
                feedback: "That's for your parent at home! What would you say to your teacher when leaving?"
              }
            ]
          },
          {
            id: 5,
            title: "Evening Greeting to Neighbor",
            situation: "You're walking outside and meet a friendly neighbor in their garden",
            context: "evening",
            background: "🏡 Neighborhood Garden",
            character: "👴",
            characterType: "Neighbor",
            studentThought: "I should be friendly to my neighbor!",
            otherCharacterSpeech: "Good evening! How was your day?",
            choices: [
              {
                text: "Good evening! It was great, thank you!",
                emoji: "�",
                correct: true,
                feedback: "Perfect! Evening greetings show you're polite and friendly!"
              },
              {
                text: "Good morning!",
                emoji: "🌅",
                correct: false,
                feedback: "It's evening time, not morning! Look at the sky for a clue."
              },
              {
                text: "Good night!",
                emoji: "�",
                correct: false,
                feedback: "That's for when you're going to sleep! Try an evening greeting."
              },
              {
                text: "Hello teacher!",
                emoji: "👩‍🏫",
                correct: false,
                feedback: "That's not your teacher - it's your neighbor! Try again."
              }
            ]
          }
        ],
        "Hygiene Hero": [
          {
            scenario: "dirty_hands",
            questionText: "😰 Oh no! Your hands are dirty after playing!",
            scenarioImage: "🤲",
            backgroundImage: "🏠",
            characterEmoji: "😟",
            answerChoices: ["Wash my hands", "Brush my teeth", "Take a shower", "Cut my hair", "Wipe my nose", "Clean my ears", "Use tissue"],
            correctAnswer: "Wash my hands",
            gameType: "hygiene",
            successAnimation: "🧼✨",
            successMessage: "Great job! Clean hands are healthy hands!"
          },
          {
            scenario: "messy_hair",
            questionText: "😅 Your hair looks messy and needs styling!",
            scenarioImage: "💇‍♂️",
            backgroundImage: "🪞",
            characterEmoji: "😵‍💫",
            answerChoices: ["Cut my hair", "Wash my hands", "Take a shower", "Brush my teeth", "Wipe my nose", "Clean my ears", "Use tissue"],
            correctAnswer: "Cut my hair",
            gameType: "hygiene",
            successAnimation: "✂️✨",
            successMessage: "Perfect! You look great now!"
          },
          {
            scenario: "runny_nose",
            questionText: "🤧 Achoo! Your nose is running!",
            scenarioImage: "👃",
            backgroundImage: "🏠",
            characterEmoji: "🤧",
            answerChoices: ["Wipe my nose", "Wash my hands", "Take a shower", "Cut my hair", "Brush my teeth", "Clean my ears", "Use tissue"],
            correctAnswer: "Wipe my nose",
            gameType: "hygiene",
            successAnimation: "🧻✨",
            successMessage: "Good choice! Keep those germs away!"
          },
          {
            scenario: "dirty_teeth",
            questionText: "🦷 Time to take care of your teeth!",
            scenarioImage: "🪥",
            backgroundImage: "🚿",
            characterEmoji: "😬",
            answerChoices: ["Brush my teeth", "Wash my hands", "Take a shower", "Cut my hair", "Wipe my nose", "Clean my ears", "Use tissue"],
            correctAnswer: "Brush my teeth",
            gameType: "hygiene",
            successAnimation: "🪥✨",
            successMessage: "Fantastic! Healthy teeth make you smile!"
          },
          {
            scenario: "dirty_ears",
            questionText: "👂 Your ears need some gentle cleaning!",
            scenarioImage: "🧽",
            backgroundImage: "🚿",
            characterEmoji: "😵",
            answerChoices: ["Clean my ears", "Wash my hands", "Take a shower", "Cut my hair", "Wipe my nose", "Brush my teeth", "Use tissue"],
            correctAnswer: "Clean my ears",
            gameType: "hygiene",
            successAnimation: "🧽✨",
            successMessage: "Excellent! Now you can hear everything clearly!"
          },
          {
            scenario: "sweaty_body",
            questionText: "💦 After playing, you're all sweaty!",
            scenarioImage: "🚿",
            backgroundImage: "🛁",
            characterEmoji: "😅",
            answerChoices: ["Take a shower", "Wash my hands", "Brush my teeth", "Cut my hair", "Wipe my nose", "Clean my ears", "Use tissue"],
            correctAnswer: "Take a shower",
            gameType: "hygiene",
            successAnimation: "🚿✨",
            successMessage: "Amazing! You're fresh and clean now!"
          },
          {
            scenario: "sticky_fingers",
            questionText: "🍯 Your fingers are sticky after eating!",
            scenarioImage: "🤲",
            backgroundImage: "🍽️",
            characterEmoji: "😝",
            answerChoices: ["Wash my hands", "Brush my teeth", "Take a shower", "Cut my hair", "Wipe my nose", "Clean my ears", "Use tissue"],
            correctAnswer: "Wash my hands",
            gameType: "hygiene",
            successAnimation: "🧼✨",
            successMessage: "Perfect! No more sticky fingers!"
          },
          {
            scenario: "after_sneezing",
            questionText: "🤧 Achoo! You just sneezed!",
            scenarioImage: "🤧",
            backgroundImage: "🏠",
            characterEmoji: "😷",
            answerChoices: ["Use tissue", "Wash my hands", "Take a shower", "Cut my hair", "Wipe my nose", "Clean my ears", "Brush my teeth"],
            correctAnswer: "Use tissue",
            gameType: "hygiene",
            successAnimation: "🧻✨",
            successMessage: "Smart! Covering sneezes keeps everyone healthy!"
          }
        ],
        "Safe Street Crossing": [
          {
            scenario: "green_walk_signal",
            questionText: "🚦 Look! What should you do?",
            scenarioImage: "🚶‍♂️",
            backgroundImage: "🛣️",
            characterEmoji: "😊",
            trafficLight: "🟢",
            lightStatus: "walk",
            safetyLevel: "safe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "CROSS",
            gameType: "street",
            successAnimation: "🚶‍♂️➡️",
            successMessage: "Great! Green means GO!",
            feedbackMessage: "Perfect choice! The walk signal is green!"
          },
          {
            scenario: "red_traffic_light",
            questionText: "🚦 Stop and look! What should you do?",
            scenarioImage: "🛑",
            backgroundImage: "🛣️",
            characterEmoji: "🤔",
            trafficLight: "🔴",
            lightStatus: "stop",
            safetyLevel: "unsafe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "WAIT",
            gameType: "street",
            successAnimation: "⏰✋",
            successMessage: "Smart waiting! Red means STOP!",
            feedbackMessage: "Excellent! Always wait for red lights!"
          },
          {
            scenario: "approaching_car",
            questionText: "🚗 A car is coming! What should you do?",
            scenarioImage: "🚗💨",
            backgroundImage: "🛣️",
            characterEmoji: "😨",
            trafficLight: "🟡",
            lightStatus: "caution",
            safetyLevel: "unsafe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "WAIT",
            gameType: "street",
            successAnimation: "⏰🛡️",
            successMessage: "Very safe choice! Let cars pass first!",
            feedbackMessage: "Great thinking! Always let cars pass safely!"
          },
          {
            scenario: "clear_street",
            questionText: "👀 The street is empty and clear! What should you do?",
            scenarioImage: "🛣️",
            backgroundImage: "🏙️",
            characterEmoji: "😄",
            trafficLight: "🟢",
            lightStatus: "clear",
            safetyLevel: "safe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "CROSS",
            gameType: "street",
            successAnimation: "🚶‍♂️✨",
            successMessage: "Perfect! Safe to cross now!",
            feedbackMessage: "Wonderful! You checked and it's safe!"
          },
          {
            scenario: "yellow_light_warning",
            questionText: "🚦 Yellow light means be careful! What should you do?",
            scenarioImage: "⚠️",
            backgroundImage: "🛣️",
            characterEmoji: "🤨",
            trafficLight: "🟡",
            lightStatus: "caution",
            safetyLevel: "unsafe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "WAIT",
            gameType: "street",
            successAnimation: "⏰⚠️",
            successMessage: "Good choice! Yellow means be careful!",
            feedbackMessage: "Smart! Yellow means slow down and wait!"
          },
          {
            scenario: "busy_intersection",
            questionText: "🚧 Lots of cars and people! What should you do?",
            scenarioImage: "🚗🚶‍♀️🚌",
            backgroundImage: "🏙️",
            characterEmoji: "😰",
            trafficLight: "🔴",
            lightStatus: "busy",
            safetyLevel: "unsafe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "WAIT",
            gameType: "street",
            successAnimation: "⏰👥",
            successMessage: "Wise decision! Wait for a safe moment!",
            feedbackMessage: "Excellent patience! Busy times need extra care!"
          },
          {
            scenario: "crosswalk_signal",
            questionText: "🚶‍♂️ The crosswalk shows a walking person! What should you do?",
            scenarioImage: "🚶‍♂️",
            backgroundImage: "🛣️",
            characterEmoji: "😊",
            trafficLight: "🟢",
            lightStatus: "walk",
            safetyLevel: "safe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "CROSS",
            gameType: "street",
            successAnimation: "🚶‍♂️🎉",
            successMessage: "Perfect timing! Cross safely now!",
            feedbackMessage: "Great job reading the crosswalk signal!"
          },
          {
            scenario: "emergency_vehicle",
            questionText: "🚑 An ambulance is coming with sirens! What should you do?",
            scenarioImage: "🚑🔊",
            backgroundImage: "🛣️",
            characterEmoji: "😮",
            trafficLight: "🟢",
            lightStatus: "emergency",
            safetyLevel: "unsafe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "WAIT",
            gameType: "street",
            successAnimation: "⏰🚑",
            successMessage: "Hero move! Let emergency vehicles go first!",
            feedbackMessage: "Amazing! Emergency vehicles always have the right of way!"
          }
        ]
      },
      Medium: {
        "Cashier Game": [
          {
            questionText: "I want two burgers and one large drink!",
            orderItems: ["Burger", "Burger", "Drink"],
            menuOptions: [
              { name: "Burger", image: "🍔", price: "$3.99" },
              { name: "Fries", image: "🍟", price: "$2.49" },
              { name: "Pizza", image: "🍕", price: "$4.99" },
              { name: "Hot Dog", image: "🌭", price: "$2.99" },
              { name: "Drink", image: "🥤", price: "$1.99" },
              { name: "Ice Cream", image: "🍦", price: "$2.99" }
            ],
            correctAnswer: ["Burger", "Burger", "Drink"],
            gameType: "cashier"
          }
        ],
        "Money Value Game": [
          {
            gameId: 1,
            gameName: "Money Value Adventure",
            description: "Learn the value of Philippine Peso currency through interactive shopping!",
            totalRounds: 3,
            gameType: "money",
            rounds: [
              {
                roundId: 1,
                budget: 750,
                items: [
                  { id: 1, name: "Burger", image: "🍔", price: 70, category: "food", affordable: true },
                  { id: 2, name: "Car", image: "🚗", price: 450000, category: "vehicle", affordable: false },
                  { id: 3, name: "Laptop", image: "💻", price: 25000, category: "electronics", affordable: false },
                  { id: 4, name: "Iced Coffee", image: "🧊☕", price: 120, category: "drink", affordable: true }
                ]
              },
              {
                roundId: 2,
                budget: 2500,
                items: [
                  { id: 5, name: "School Bag", image: "🎒", price: 850, category: "school", affordable: true },
                  { id: 6, name: "House", image: "🏠", price: 2500000, category: "property", affordable: false },
                  { id: 7, name: "Bicycle", image: "🚲", price: 3500, category: "vehicle", affordable: false },
                  { id: 8, name: "Pizza", image: "🍕", price: 280, category: "food", affordable: true }
                ]
              },
              {
                roundId: 3,
                budget: 1200,
                items: [
                  { id: 9, name: "Video Game", image: "🎮", price: 2800, category: "entertainment", affordable: false },
                  { id: 10, name: "Ice Cream", image: "🍦", price: 45, category: "dessert", affordable: true },
                  { id: 11, name: "Smartphone", image: "📱", price: 25000, category: "electronics", affordable: false },
                  { id: 12, name: "Book", image: "📚", price: 350, category: "education", affordable: true }
                ]
              }
            ],
            badges: {
              completion: {
                id: "money_master",
                name: "Money Master",
                description: "Completed all 3 rounds of Money Value Adventure!",
                icon: "💰🏆",
                points: 100
              }
            }
          }
        ]
      },
      Hard: {
        "Cashier Game": [
          {
            questionText: "Family meal: 3 burgers, 2 large fries, 3 drinks, and 1 ice cream!",
            orderItems: ["Burger", "Burger", "Burger", "Fries", "Fries", "Drink", "Drink", "Drink", "Ice Cream"],
            menuOptions: [
              { name: "Burger", image: "🍔", price: "$3.99" },
              { name: "Fries", image: "🍟", price: "$2.49" },
              { name: "Pizza", image: "🍕", price: "$4.99" },
              { name: "Hot Dog", image: "🌭", price: "$2.99" },
              { name: "Drink", image: "🥤", price: "$1.99" },
              { name: "Ice Cream", image: "🍦", price: "$2.99" }
            ],
            correctAnswer: ["Burger", "Burger", "Burger", "Fries", "Fries", "Drink", "Drink", "Drink", "Ice Cream"],
            gameType: "cashier"
          }
        ]
      }
    }
  };

  const questions = questionsData[category]?.[difficulty]?.[activity] || [];
  const total = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const isCashierGame = currentQuestion?.gameType === 'cashier';
  const isHygieneGame = currentQuestion?.gameType === 'hygiene';
  const isStreetGame = activity === "Safe Street Crossing";
  const isGreetingsGame = activity === "Social Greetings";
  const isMoneyGame = activity === "Money Value Game";

  // Hygiene game functions
  const getRandomScenario = () => {
    const availableScenarios = questions.filter(q => !usedScenarios.includes(q.scenario));
    if (availableScenarios.length === 0) return questions[0]; // Fallback
    return availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
  };

  const handleHygieneAnswer = (choice) => {
    if (isAnswered) return;
    
    setSelectedAnswer(choice);
    setIsAnswered(true);

    if (choice === currentQuestion.correctAnswer) {
      setHygieneScore(prev => prev + 1);
      setScore(prev => prev + 1);
      setShowSuccessAnimation(true);
      setSuccessAnimationText(currentQuestion.successAnimation);
      setShowCorrect(true);
      
      setTimeout(() => {
        setShowSuccessAnimation(false);
        setShowCorrect(false);
      }, 2000);
    } else {
      setShowWrong(true);
      setTimeout(() => setShowWrong(false), 1500);
    }
  };

  const initializeHygieneGame = () => {
    if (isHygieneGame && !isHygieneGameActive) {
      setIsHygieneGameActive(true);
      setCurrentRound(1);
      setHygieneScore(0);
      setUsedScenarios([]);
      
      // Set up first scenario
      const firstScenario = getRandomScenario();
      setCurrentScenario(firstScenario);
      setUsedScenarios([firstScenario.scenario]);
    }
  };

  const resetHygieneState = () => {
    setHygieneScore(0);
    setCurrentRound(1);
    setUsedScenarios([]);
    setShowCharacter(true);
    setShowSuccessAnimation(false);
    setSuccessAnimationText('');
    setCurrentScenario(null);
    setIsHygieneGameActive(false);
  };

  // Safe Street Crossing game functions
  
  const getRandomStreetScenario = () => {
    const streetQuestions = questionsData[category]?.[difficulty]?.["Safe Street Crossing"] || [];
    const availableScenarios = streetQuestions.filter(q => !usedScenarios.includes(q.scenario));
    if (availableScenarios.length === 0) return streetQuestions[0]; // Fallback
    return availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
  };

  const handleStreetAnswer = (choice) => {
    if (isAnswered) return;
    
    setSelectedAnswer(choice);
    setIsAnswered(true);

    const isCorrect = choice === currentScenario.correctAnswer;
    const isSafeChoice = (choice === "CROSS" && currentScenario.safetyLevel === "safe") || 
                        (choice === "WAIT" && currentScenario.safetyLevel === "unsafe");

    if (isCorrect && isSafeChoice) {
      setStreetScore(prev => prev + 1);
      setScore(prev => prev + 1);
      setStreetFeedbackType('safe');
      setStreetFeedbackMessage(currentScenario.feedbackMessage);
      
      if (choice === "CROSS" && currentScenario.safetyLevel === "safe") {
        setShowWalkingAnimation(true);
        setTimeout(() => setShowWalkingAnimation(false), 2000);
      }
      
      setShowCorrect(true);
      setTimeout(() => setShowCorrect(false), 2000);
    } else {
      setStreetFeedbackType('unsafe');
      setStreetFeedbackMessage("Not safe yet! Always check for safety first.");
      setShowWrong(true);
      setTimeout(() => setShowWrong(false), 2000);
    }

    setShowStreetFeedback(true);
    setTimeout(() => {
      setShowStreetFeedback(false);
      if (streetRound < 5) {
        // Move to next round
        setStreetRound(prev => prev + 1);
        const nextScenario = getRandomStreetScenario();
        setCurrentScenario(nextScenario);
        setUsedScenarios(prev => [...prev, nextScenario.scenario]);
        setIsAnswered(false);
        setSelectedAnswer(null);
      } else {
        // Game complete
        setTimeout(() => {
          setShowModal(true);
        }, 1000);
      }
    }, 3000);
  };

  const initializeStreetGame = () => {
    if (activity === "Safe Street Crossing" && !isStreetGameActive) {
      setIsStreetGameActive(true);
      setStreetRound(1);
      setStreetScore(0);
      setUsedScenarios([]);
      
      // Set up first scenario
      const firstScenario = getRandomStreetScenario();
      setStreetScenario(firstScenario);
      setCurrentScenario(firstScenario);
      if (firstScenario) {
        setUsedScenarios([firstScenario.scenario]);
      }
    }
  };

  const resetStreetState = () => {
    setStreetScore(0);
    setStreetRound(1);
    setStreetScenario(null);
    setIsStreetGameActive(false);
    setShowWalkingAnimation(false);
    setShowStreetFeedback(false);
    setStreetFeedbackMessage('');
    setStreetFeedbackType('');
  };

  // Social Greetings game functions
  const getRandomGreetingScenario = () => {
    const greetingQuestions = questionsData[category]?.[difficulty]?.["Social Greetings"] || [];
    const availableScenarios = greetingQuestions.filter(q => !usedScenarios.includes(q.id));
    if (availableScenarios.length === 0) return greetingQuestions[0]; // Fallback
    return availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
  };

  const handleGreetingAnswer = (choice) => {
    if (greetingAnswered) return;
    
    setGreetingSelectedChoice(choice);
    setGreetingAnswered(true);

    if (choice.correct) {
      setGreetingsScore(prev => prev + 20);
      setScore(prev => prev + 1);
      setGreetingFeedbackType('correct');
      setGreetingFeedbackMessage(choice.feedback);
      setShowGreetingAnimation(true);
      setShowGreetingFeedback(true);
      setShowCorrect(true);
      
      setTimeout(() => {
        setShowGreetingAnimation(false);
        setShowGreetingFeedback(false);
        setShowCorrect(false);
      }, 3000);
    } else {
      setGreetingFeedbackType('incorrect');
      setGreetingFeedbackMessage(choice.feedback);
      setShowGreetingFeedback(true);
      setShowWrong(true);
      
      setTimeout(() => {
        setShowGreetingFeedback(false);
        setShowWrong(false);
      }, 2500);
    }
  };

  const initializeGreetingsGame = () => {
    if (isGreetingsGame && !isGreetingsGameActive) {
      setIsGreetingsGameActive(true);
      setGreetingsRound(1);
      setGreetingsScore(0);
      setUsedScenarios([]);
      setGreetingAnswered(false);
      setGreetingSelectedChoice(null);
      
      // Set up first scenario
      const firstScenario = getRandomGreetingScenario();
      setCurrentGreetingScenario(firstScenario);
      if (firstScenario) {
        setUsedScenarios([firstScenario.id]);
        setCharacterSpeech(firstScenario.otherCharacterSpeech);
        setShowCharacterThought(true);
      }
    }
  };

  const resetGreetingsState = () => {
    setGreetingsScore(0);
    setGreetingsRound(1);
    setCurrentGreetingScenario(null);
    setIsGreetingsGameActive(false);
    setShowGreetingAnimation(false);
    setShowGreetingFeedback(false);
    setGreetingFeedbackMessage('');
    setGreetingFeedbackType('');
    setCharacterSpeech('');
    setShowCharacterThought(false);
    setGreetingAnswered(false);
    setGreetingSelectedChoice(null);
    setUsedScenarios([]);
  };

  // Cashier game functions
  const handleItemSelect = (item) => {
    if (!isCashierGame) return;
    
    const newSelectedItems = [...selectedItems, item];
    setSelectedItems(newSelectedItems);
    
    // Calculate total price
    const newTotal = newSelectedItems.reduce((sum, selectedItem) => {
      const menuItem = currentQuestion.menuOptions.find(option => option.name === selectedItem.name);
      return sum + parseFloat(menuItem.price.replace('$', ''));
    }, 0);
    setOrderTotal(newTotal);
  };

  const handleRemoveItem = (index) => {
    const newSelectedItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(newSelectedItems);
    
    // Recalculate total
    const newTotal = newSelectedItems.reduce((sum, selectedItem) => {
      const menuItem = currentQuestion.menuOptions.find(option => option.name === selectedItem.name);
      return sum + parseFloat(menuItem.price.replace('$', ''));
    }, 0);
    setOrderTotal(newTotal);
  };

  const handleCashierSubmit = () => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    setGameStep(3);
    
    // Check if order matches
    const selectedItemNames = selectedItems.map(item => item.name).sort();
    const correctItemNames = [...currentQuestion.correctAnswer].sort();
    
    const isCorrect = JSON.stringify(selectedItemNames) === JSON.stringify(correctItemNames);
    
    if (isCorrect) {
      setCashierScore(prev => prev + 10);
      setScore(prev => prev + 1);
      setCurrentSpeaker('customer');
      setSpeechText("Thank you! You got my food right! Good job!");
      setShowThoughtBubble(true);
      setShowCorrect(true);
    } else {
      setCurrentSpeaker('customer');
      setSpeechText("That's not what I asked for. Try again next time!");
      setShowThoughtBubble(true);
      setShowWrong(true);
    }
  };

  // Reset selected items when moving to next question
  const resetCashierState = () => {
    setSelectedItems([]);
    setOrderTotal(0);
    setGameStep(1);
    setShowThoughtBubble(false);
    setCurrentSpeaker('customer');
    setSpeechText('');
  };

  // Money Value Game functions
  const initializeMoneyGame = () => {
    if (isMoneyGame && !isMoneyGameActive) {
      setIsMoneyGameActive(true);
      setMoneyRound(1);
      setMoneyScore(0);
      setSelectedPurchases([]);
      setTotalSpent(0);
      setIsRoundComplete(false);
      setShowBadgeCompletion(false);
      
      // Get first round data
      const gameData = questions[0];
      if (gameData && gameData.rounds) {
        const firstRound = gameData.rounds[0];
        setCurrentBudget(firstRound.budget);
        setCurrentMoneyItems(firstRound.items);
      }
    }
  };

  const handlePurchaseItem = (item) => {
    if (!isMoneyGameActive || isRoundComplete) return;

    const isAffordable = item.price <= currentBudget;
    
    if (isAffordable) {
      // Correct purchase
      setSelectedPurchases(prev => [...prev, item]);
      setTotalSpent(prev => prev + item.price);
      setMoneyScore(prev => prev + 1);
      setMoneyFeedbackType('correct');
      setMoneyFeedbackMessage(`✔️ Correct! You can afford the ${item.name} for ₱${item.price.toLocaleString()}`);
      setShowPurchaseAnimation(true);
      setShowCorrect(true);
      
      setTimeout(() => {
        setShowPurchaseAnimation(false);
        setShowCorrect(false);
      }, 2000);
    } else {
      // Wrong purchase - too expensive
      setMoneyFeedbackType('wrong');
      setMoneyFeedbackMessage(`❌ Sorry! The ${item.name} costs ₱${item.price.toLocaleString()}, but you only have ₱${currentBudget.toLocaleString()}`);
      setShowWrong(true);
      
      setTimeout(() => {
        setShowWrong(false);
      }, 2500);
    }
    
    setShowMoneyFeedback(true);
    setTimeout(() => {
      setShowMoneyFeedback(false);
    }, 3000);
  };

  const proceedToNextMoneyRound = () => {
    if (moneyRound < 3) {
      // Move to next round
      const nextRound = moneyRound + 1;
      setMoneyRound(nextRound);
      setSelectedPurchases([]);
      setTotalSpent(0);
      setIsRoundComplete(false);
      
      const gameData = questions[0];
      if (gameData && gameData.rounds) {
        const nextRoundData = gameData.rounds[nextRound - 1];
        setCurrentBudget(nextRoundData.budget);
        setCurrentMoneyItems(nextRoundData.items);
      }
    } else {
      // Game completed - show badge
      setShowBadgeCompletion(true);
      setIsRoundComplete(true);
      
      // Play celebration sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    }
  };

  const resetMoneyGame = () => {
    setIsMoneyGameActive(false);
    setMoneyRound(1);
    setMoneyScore(0);
    setCurrentBudget(0);
    setCurrentMoneyItems([]);
    setSelectedPurchases([]);
    setMoneyFeedbackMessage('');
    setShowMoneyFeedback(false);
    setMoneyFeedbackType('');
    setShowPurchaseAnimation(false);
    setTotalSpent(0);
    setShowBadgeCompletion(false);
    setIsRoundComplete(false);
  };

  const restartMoneyGame = () => {
    resetMoneyGame();
    initializeMoneyGame();
  };

  // Initialize cashier game when question starts
  useEffect(() => {
    if (isCashierGame && gameStep === 1) {
      setTimeout(() => {
        setCurrentSpeaker('customer');
        setSpeechText(currentQuestion.questionText);
        setShowThoughtBubble(true);
      }, 1000);
    }
  }, [currentQuestionIndex, isCashierGame]);

  // Initialize hygiene game when activity starts
  useEffect(() => {
    if (isHygieneGame) {
      initializeHygieneGame();
    }
  }, [currentQuestionIndex, isHygieneGame]);

  // Initialize street crossing game when activity starts
  useEffect(() => {
    if (activity === "Safe Street Crossing") {
      initializeStreetGame();
    }
  }, [currentQuestionIndex, activity]);

  // Initialize social greetings game when activity starts
  useEffect(() => {
    if (isGreetingsGame) {
      initializeGreetingsGame();
    }
  }, [currentQuestionIndex, isGreetingsGame]);

  // Initialize money value game when activity starts
  useEffect(() => {
    if (isMoneyGame) {
      initializeMoneyGame();
    }
  }, [currentQuestionIndex, isMoneyGame]);

  // Handle moving to item selection step
  const handleStartSelecting = () => {
    // Do not hide the customer's thought bubble here; keep it visible until Next Question
    setGameStep(2);
    setTimeout(() => {
      setCurrentSpeaker('cashier');
      setSpeechText("Okay, I'll get your order");
      setShowThoughtBubble(true);
      setTimeout(() => {
        setShowThoughtBubble(false);
      }, 2000);
    }, 500);
  };

  // Handle answer selection
  const handleAnswerClick = (choice) => {
    if (isAnswered) return;
    
    // Track timing for this question
    const questionStartTime = new Date();
    
    setSelectedAnswer(choice);
    setIsAnswered(true);

    if (choice === questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
      setShowCorrect(true);
      
      // Track if first question was correct and show badge preview
      if (currentQuestionIndex === 0) {
        setSessionStats(prev => ({ ...prev, firstQuestionCorrect: true }));
        // Show preview for first try hero badge
        setPreviewBadge({
          name: 'First Try Hero',
          icon: '🎪',
          message: 'Great start! Keep it up!'
        });
        setShowBadgePreview(true);
        setTimeout(() => setShowBadgePreview(false), 2000);
      }
      
      // Show perfect score preview when getting close to end
      if (score + 1 === questions.length && currentQuestionIndex === questions.length - 1) {
        setPreviewBadge({
          name: 'Perfect Score Champion',
          icon: '🏆',
          message: 'Perfect! Amazing work!'
        });
        setShowBadgePreview(true);
        setTimeout(() => setShowBadgePreview(false), 3000);
      }
      
      setTimeout(() => setShowCorrect(false), 1500);
    } else {
      setShowWrong(true);
      setTimeout(() => setShowWrong(false), 1500);
    }
    
    // Update session stats with timing
    const questionTime = (new Date() - questionStartTime) / 1000;
    setSessionStats(prev => ({
      ...prev,
      questionTimes: [...prev.questionTimes, questionTime]
    }));
  };

  const handleNextClick = () => {
    // Always hide overlays when moving to next question
    setShowCorrect(false);
    setShowWrong(false);
    setShowThoughtBubble(false); // Hide the thought bubble only here
    
    // Handle hygiene game progression (5 rounds max)
    if (isHygieneGame && currentRound < 5) {
      setCurrentRound(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      
      // Get next scenario that hasn't been used
      const nextScenario = getRandomScenario();
      setCurrentScenario(nextScenario);
      setUsedScenarios(prev => [...prev, nextScenario.scenario]);
      
      // Update current question index to show the new scenario
      const nextIndex = questions.findIndex(q => q.scenario === nextScenario.scenario);
      setCurrentQuestionIndex(nextIndex);
    } else if (isHygieneGame && currentRound >= 5) {
      // End hygiene game after 5 rounds
      setShowModal(true);
    } else if (isStreetGame && streetRound >= 5) {
      // End street game after 5 rounds (handled in handleStreetAnswer)
      // Modal is shown automatically in handleStreetAnswer
    } else if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      resetCashierState(); // Reset cashier game state
      resetStreetState(); // Reset street game state
    } else {
      setShowModal(true);
    }
  };

  // Calculate badges earned based on performance
  const calculateSessionBadges = (finalScore, totalQuestions) => {
    const endTime = new Date();
    const totalTime = (endTime - sessionStats.startTime) / 1000; // in seconds
    const averageTime = sessionStats.questionTimes.length > 0 
      ? sessionStats.questionTimes.reduce((a, b) => a + b, 0) / sessionStats.questionTimes.length 
      : totalTime / totalQuestions;

    const enhancedStats = {
      ...sessionStats,
      category,
      difficulty,
      activity,
      totalTime,
      averageTime,
      percentage: totalQuestions > 0 ? (finalScore / totalQuestions) * 100 : 0
    };

    return calculateEarnedBadges(finalScore, totalQuestions, category, difficulty, activity, enhancedStats);
  };

  const handleFinish = () => {
    setShowModal(false);
    
    // Calculate earned badges with enhanced statistics
    let badges = calculateSessionBadges(score, total);
    
    // Add special cashier game badges
    if (activity === "Cashier Game") {
      if (cashierScore >= 80) {
        badges.push({
          name: "Master Cashier",
          description: "Earned 80+ points as a cashier!",
          icon: "🏆",
          rarity: "gold",
          category: "Social Skills"
        });
      } else if (cashierScore >= 60) {
        badges.push({
          name: "Senior Cashier",
          description: "Earned 60+ points as a cashier!",
          icon: "🥈",
          rarity: "silver",
          category: "Social Skills"
        });
      } else if (cashierScore >= 40) {
        badges.push({
          name: "Junior Cashier",
          description: "Earned 40+ points as a cashier!",
          icon: "🥉",
          rarity: "bronze",
          category: "Social Skills"
        });
      }
    }

    // Add special hygiene hero badges
    if (activity === "Hygiene Hero") {
      // Always award the Hygiene Hero badge for completing the game
      badges.push({
        name: "Hygiene Hero",
        description: "Completed the hygiene game and learned healthy habits!",
        icon: "🧼",
        rarity: "gold",
        category: "Daily Life Skills"
      });

      // Award additional badges based on performance
      if (hygieneScore >= 5) {
        badges.push({
          name: "Perfect Hygiene Master",
          description: "Got all 5 hygiene scenarios correct!",
          icon: "✨",
          rarity: "legendary",
          category: "Daily Life Skills"
        });
      } else if (hygieneScore >= 4) {
        badges.push({
          name: "Hygiene Expert",
          description: "Excellent hygiene knowledge!",
          icon: "🌟",
          rarity: "gold",
          category: "Daily Life Skills"
        });
      } else if (hygieneScore >= 3) {
        badges.push({
          name: "Clean & Healthy",
          description: "Good hygiene habits!",
          icon: "🧽",
          rarity: "silver",
          category: "Daily Life Skills"
        });
      }
    }

    // Add special safe street crossing badges
    if (activity === "Safe Street Crossing") {
      // Always award the Brave Crosser badge for completing the game
      badges.push({
        name: "Brave Crosser",
        description: "Completed the street safety game and learned safe crossing!",
        icon: "🚦",
        rarity: "gold",
        category: "Daily Life Skills"
      });

      // Award additional badges based on performance
      if (streetScore >= 5) {
        badges.push({
          name: "Safety Champion",
          description: "Perfect score! You know all the street safety rules!",
          icon: "🏆",
          rarity: "legendary",
          category: "Daily Life Skills"
        });
      } else if (streetScore >= 4) {
        badges.push({
          name: "Street Safety Expert",
          description: "Excellent knowledge of crossing safely!",
          icon: "🛡️",
          rarity: "gold",
          category: "Daily Life Skills"
        });
      } else if (streetScore >= 3) {
        badges.push({
          name: "Careful Walker",
          description: "Good job learning to cross safely!",
          icon: "🚶‍♂️",
          rarity: "silver",
          category: "Daily Life Skills"
        });
      }
    }
    
    setEarnedBadges(badges);
    
    // Save badges to storage (for future persistence)
    if (badges.length > 0) {
      saveBadgesToStorage(badges);
    }
    
    // Show badge modal if badges were earned
    if (badges.length > 0) {
      setTimeout(() => {
        setShowBadgeModal(true);
        if (badgeAudioRef.current) {
          badgeAudioRef.current.currentTime = 0;
          badgeAudioRef.current.play();
        }
      }, 500);
    } else {
      // No badges, proceed to complete
      onComplete(score, total);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-600">
          No flashcards available for {category} - {difficulty} - {activity}
        </h2>
        <p className="text-gray-500 mt-2">Please select a different combination.</p>
      </div>
    );
  }

  return (
  <div className="relative">
  {/* Flashcard Container */}
  <div className="w-270 bg-white/90 backdrop-blur-xl rounded-3xl mx-auto shadow-2xl border border-white/20 p-6 text-center animate-fade-in-scale">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-3 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink-200/20 to-yellow-200/20 rounded-full blur-xl animate-float-delayed"></div>
        
        <div className="relative z-10 ">
          {/* Question Counter with modern design */}
          <div className="-mt-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl px-6 py-1 border border-blue-200/30 inline-block">
            <div className="text-base font-bold text-gray-700 flex items-center justify-center space-x-2">
              <span className="text-2xl animate-bounce-gentle">
                {isHygieneGame ? "🧼" : "📝"}
              </span>
              <span>
                {isHygieneGame 
                  ? `Round ${currentRound} of 5` 
                  : `Question ${currentQuestionIndex + 1} of ${total}`
                }
              </span>
              <span className="text-2xl animate-pulse-gentle">✨</span>
            </div>
          </div>

          {/* Question with improved typography */}
          <h3 className="text-3xl font-bold text-gray-800  leading-relaxed px-4">
            {questions[currentQuestionIndex].questionText}
          </h3>

          {/* Image/Video with modern container */}
          <div className="flex justify-center flex-wrap gap-4 mb-8">
            {questions[currentQuestionIndex].imageSrc && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border-2 border-blue-200/30 shadow-lg">
                <img
                  src={questions[currentQuestionIndex].imageSrc}
                  alt={questions[currentQuestionIndex].questionText}
                  className="w-full max-w-lg object-contain rounded-xl"
                />
              </div>
            )}
            {questions[currentQuestionIndex].videoSrc && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200/30 shadow-lg">
                <video
                  key={questions[currentQuestionIndex].videoSrc}
                  ref={videoRef}
                  className="w-full max-w-xl rounded-xl shadow-md"
                  controls
                  autoPlay
                  loop
                >
                  <source src={questions[currentQuestionIndex].videoSrc} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>

          {/* Answer Choices with autism-friendly design */}
          {!isCashierGame && !isHygieneGame && !isStreetGame && !isGreetingsGame && !isMoneyGame ? (
            <div className="grid grid-cols-2 gap-6">
              {questions[currentQuestionIndex].answerChoices.map((choice, index) => (
                <button
                  key={index}
                  className={`
                    w-[500px]
                    ${
                      choice === questions[currentQuestionIndex].correctAnswer && isAnswered
                        ? "h-10 bg-gradient-to-r from-green-400 to-green-500 text-white border-green-300 scale-105 shadow-2xl animate-success-pulse"
                        : selectedAnswer === choice && choice !== questions[currentQuestionIndex].correctAnswer
                        ? "h-10 bg-gradient-to-r from-red-400 to-red-500 text-white border-red-300 scale-105 shadow-2xl"
                        : "h-10 -mb-2 bg-blue-100 hover:bg-blue-200 text-gray-800 border-blue-200/50 hover:border-purple-300/70"
                    } 
                    text-xl font-bold py-6 px-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 backdrop-blur-sm transform
                    focus:outline-none focus:ring-4 focus:ring-purple-200/50
                    ${!isAnswered ? 'hover:animate-bounce-gentle' : ''}
                    min-h-[4rem] flex items-center justify-center
                  `}
                  {...getButtonSoundHandlers(() => handleAnswerClick(choice))}
                  disabled={isAnswered}
                >
                  <span className="relative z-10">{choice}</span>
                </button>
              ))}
            </div>
          ) : isHygieneGame ? (
            /* Modern Interactive Hygiene Game UI */
            <div className="space-y-8">
              {/* Round Indicator */}
              {/* <div className="text-center mb-6">
                <div className="inline-flex bg-gradient-to-r from-blue-100 to-green-100 rounded-full px-8 py-4 border-3 border-blue-300 shadow-lg">
                  <span className="text-2xl font-bold text-blue-800 flex items-center space-x-3">
                    <span className="text-3xl animate-bounce-gentle">🧼</span>
                    <span>Round {currentRound} of 5</span>
                    <span className="text-3xl animate-pulse-gentle">✨</span>
                  </span>
                </div>
              </div> */}

              {/* Main Scenario Area */}
              <div className="bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 rounded-3xl p-8 border-4 border-blue-200 relative overflow-hidden">
                {/* Background Character */}
                <div className="absolute top-4 right-4 text-6xl opacity-20 animate-float">
                  {currentQuestion?.backgroundImage || "🏠"}
                </div>

                {/* Character Display */}
                <div className="flex flex-col items-center mb-8 relative">
                  {/* Success Animation Overlay */}
                  {showSuccessAnimation && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="text-8xl animate-bounce-gentle">
                        {successAnimationText}
                      </div>
                    </div>
                  )}

                  {/* Main Character */}
                  <div className={`text-[12rem] mb-4 transition-all duration-500 ${showSuccessAnimation ? 'scale-110' : ''}`}>
                    {currentQuestion?.characterEmoji || "😊"}
                  </div>

                  {/* Scenario Visual */}
                  <div className="bg-white rounded-2xl p-6 border-3 border-blue-300 shadow-xl mb-6">
                    <div className="text-6xl mb-4">{currentQuestion?.scenarioImage}</div>
                    <div className="text-xl font-bold text-gray-800 leading-relaxed">
                      {currentQuestion?.questionText}
                    </div>
                  </div>
                </div>

                {/* Action Choices */}
                <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
                  {currentQuestion?.answerChoices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => handleHygieneAnswer(choice)}
                      disabled={isAnswered}
                      className={`
                        ${
                          choice === currentQuestion.correctAnswer && isAnswered
                            ? "bg-gradient-to-r from-green-400 to-green-500 text-white border-green-300 scale-105 shadow-2xl animate-success-pulse"
                            : selectedAnswer === choice && choice !== currentQuestion.correctAnswer
                            ? "bg-gradient-to-r from-red-400 to-red-500 text-white border-red-300 scale-105 shadow-2xl"
                            : "bg-white hover:bg-blue-50 text-gray-800 border-blue-200 hover:border-blue-400"
                        } 
                        text-xl font-bold py-6 px-8 rounded-2xl cursor-pointer transition-all duration-300 border-3 backdrop-blur-sm transform
                        focus:outline-none focus:ring-4 focus:ring-blue-300
                        ${!isAnswered ? 'hover:scale-105 hover:shadow-xl' : ''}
                        min-h-[5rem] flex items-center justify-center shadow-lg
                      `}
                    >
                      <span className="relative z-10 text-center">{choice}</span>
                    </button>
                  ))}
                </div>

                {/* Score Display */}
                <div className="mt-8 text-center">
                  <div className="inline-flex bg-purple-100 rounded-full px-6 py-3 border-2 border-purple-300">
                    <span className="text-xl font-bold text-purple-800 flex items-center space-x-2">
                      <span className="text-2xl">🏆</span>
                      <span>Score: {hygieneScore}/5</span>
                      <span className="text-2xl animate-pulse-gentle">⭐</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : isStreetGame ? (
            /* Interactive Safe Street Crossing Game UI */
            <div className="space-y-8">
              {/* Round Indicator */}
              {/* <div className="text-center mb-6">
                <div className="inline-flex bg-gradient-to-r from-green-100 to-blue-100 rounded-full px-8 py-4 border-3 border-green-300 shadow-lg">
                  <span className="text-2xl font-bold text-green-800 flex items-center space-x-3">
                    <span className="text-3xl animate-bounce-gentle">🚦</span>
                    <span>Round {streetRound} of 5</span>
                    <span className="text-3xl animate-pulse-gentle">🚶‍♂️</span>
                  </span>
                </div>
              </div> */}

              {/* Main Street Scenario Area */}
              <div className="bg-gradient-to-br from-blue-50 via-gray-50 to-green-50 rounded-3xl p-8 border-4 border-gray-300 relative overflow-hidden">
                {/* Background Street */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <div className="text-[20rem]">🛣️</div>
                </div>

                {/* Street Scene */}
                <div className="flex flex-col items-center mb-8 relative z-10">
                  {/* Walking Animation */}
                  {showWalkingAnimation && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="text-8xl animate-slide-right">
                        🚶‍♂️➡️➡️➡️
                      </div>
                    </div>
                  )}

                  {/* Traffic Light and Scenario */}
                  <div className="flex items-center space-x-8 mb-6">
                    {/* Traffic Light */}
                    <div className="bg-gray-800 rounded-xl p-4 shadow-xl">
                      <div className="text-8xl">{currentScenario?.trafficLight}</div>
                    </div>

                    {/* Scenario Image */}
                    <div className="bg-white rounded-2xl p-6 border-3 border-gray-400 shadow-xl">
                      <div className="text-6xl mb-2">{currentScenario?.scenarioImage}</div>
                    </div>

                    {/* Character */}
                    <div className="text-[8rem]">
                      {currentScenario?.characterEmoji}
                    </div>
                  </div>

                  {/* Question */}
                  <div className="bg-white rounded-2xl p-6 border-3 border-blue-300 shadow-xl mb-8 max-w-2xl">
                    <div className="text-2xl font-bold text-gray-800 text-center leading-relaxed">
                      {currentScenario?.questionText}
                    </div>
                  </div>

                  {/* Feedback Message */}
                  {showStreetFeedback && (
                    <div className={`
                      ${streetFeedbackType === 'safe' 
                        ? 'bg-gradient-to-r from-green-100 to-blue-100 border-green-400' 
                        : 'bg-gradient-to-r from-yellow-100 to-red-100 border-yellow-400'
                      } 
                      rounded-2xl p-6 border-3 shadow-xl mb-6 max-w-2xl animate-fade-in
                    `}>
                      <div className="text-xl font-bold text-center">
                        {streetFeedbackType === 'safe' && <span className="text-4xl mr-3">✅</span>}
                        {streetFeedbackType === 'unsafe' && <span className="text-4xl mr-3">⚠️</span>}
                        {streetFeedbackMessage}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Large and Clear */}
                <div className="flex justify-center space-x-8 mb-8">
                  <button
                    onClick={() => handleStreetAnswer('CROSS')}
                    disabled={isAnswered}
                    className={`
                      ${
                        selectedAnswer === 'CROSS' && currentScenario?.correctAnswer === 'CROSS'
                          ? "bg-gradient-to-r from-green-400 to-green-500 text-white border-green-300 scale-110 shadow-2xl animate-success-pulse"
                          : selectedAnswer === 'CROSS' && currentScenario?.correctAnswer !== 'CROSS'
                          ? "bg-gradient-to-r from-red-400 to-red-500 text-white border-red-300 scale-110 shadow-2xl"
                          : "bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white border-blue-300 hover:border-blue-400"
                      } 
                      text-3xl font-bold py-8 px-16 rounded-3xl cursor-pointer transition-all duration-300 border-4 shadow-2xl transform
                      focus:outline-none focus:ring-6 focus:ring-blue-300
                      ${!isAnswered ? 'hover:scale-110 hover:shadow-3xl' : ''}
                      min-w-[200px] flex flex-col items-center justify-center
                    `}
                  >
                    <span className="text-6xl mb-2">🚶‍♂️</span>
                    <span>CROSS</span>
                  </button>

                  <button
                    onClick={() => handleStreetAnswer('WAIT')}
                    disabled={isAnswered}
                    className={`
                      ${
                        selectedAnswer === 'WAIT' && currentScenario?.correctAnswer === 'WAIT'
                          ? "bg-gradient-to-r from-green-400 to-green-500 text-white border-green-300 scale-110 shadow-2xl animate-success-pulse"
                          : selectedAnswer === 'WAIT' && currentScenario?.correctAnswer !== 'WAIT'
                          ? "bg-gradient-to-r from-red-400 to-red-500 text-white border-red-300 scale-110 shadow-2xl"
                          : "bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white border-orange-300 hover:border-orange-400"
                      } 
                      text-3xl font-bold py-8 px-16 rounded-3xl cursor-pointer transition-all duration-300 border-4 shadow-2xl transform
                      focus:outline-none focus:ring-6 focus:ring-orange-300
                      ${!isAnswered ? 'hover:scale-110 hover:shadow-3xl' : ''}
                      min-w-[200px] flex flex-col items-center justify-center
                    `}
                  >
                    <span className="text-6xl mb-2">✋</span>
                    <span>WAIT</span>
                  </button>
                </div>

                {/* Score Display */}
                <div className="text-center">
                  <div className="inline-flex bg-green-100 rounded-full px-6 py-3 border-2 border-green-300">
                    <span className="text-xl font-bold text-green-800 flex items-center space-x-2">
                      <span className="text-2xl">🏆</span>
                      <span>Safety Score: {streetScore}/5</span>
                      <span className="text-2xl animate-pulse-gentle">🚦</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : isCashierGame ? (
            <div className="space-y-6">
              {/* Main Game Area */}
              <div className="bg-gradient-to-b from-blue-50 to-green-50 rounded-3xl p-4 -mt-2 border-4 border-blue-200 relative">
                
                {/* Characters with simplified design */}
                <div className="flex justify-between items-center relative min-h-[300px]">
                  
                  {/* Customer Character */}
                  <div className="flex flex-col items-center relative">
                    {/* Thought Bubble for Customer */}
                    {showThoughtBubble && currentSpeaker === 'customer' && (
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-3xl p-3 border-4 border-pink-300 shadow-2xl w-[250px] z-10 animate-bounce-gentle">
                        <div className="text-xl font-bold text-gray-800 text-center leading-relaxed">
                          {speechText}
                        </div>
                        {/* Bubble pointer */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                          <div className="w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-white"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Customer - Head only */}
                    <div className="text-center">
                      {/* Head - larger */}
                      <div className="text-[12rem] mb-4">👩‍🦱</div>
                      
                      {/* Label */}
                      <div className="bg-pink-500 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-lg">
                        Customer
                      </div>
                    </div>
                  </div>

                  {/* Restaurant Counter */}
                  <div className="flex-1 mx-16 mt-20">
                    <div className="h-32 bg-gradient-to-t from-amber-400 to-amber-200 rounded-2xl border-4 border-amber-500 relative flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-amber-900">🏪 Restaurant Counter 🏪</span>
                    </div>
                  </div>

                  {/* Cashier Character (You) */}
                  <div className="flex flex-col items-center relative">
                    {/* Thought Bubble for Cashier */}
                    {showThoughtBubble && currentSpeaker === 'cashier' && (
                      <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 bg-white rounded-3xl p-8 border-4 border-blue-300 shadow-2xl max-w-lg z-10 animate-bounce-gentle">
                        <div className="text-xl font-bold text-gray-800 text-center leading-relaxed">
                          {speechText}
                        </div>
                        {/* Bubble pointer */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                          <div className="w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-white"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Cashier - Head only */}
                    <div className="text-center">
                      {/* Head - larger */}
                      <div className="text-[12rem] mb-4">👨‍💼</div>
                      
                      {/* Label */}
                      <div className="bg-blue-500 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-lg">
                        You (Cashier)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="mt-8 space-y-6">
                {/* Step 1: Customer speaks */}
                {gameStep === 1 && (
                  <div className="text-center">
                    
                    {showThoughtBubble && (
                      <button
                        onClick={handleStartSelecting}
                        className="bg-green-500 hover:bg-green-600 text-white py-6 px-12 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg"
                      >
                        ✅ GET ORDER
                      </button>
                    )}
                  </div>
                )}

                {/* Step 2: Select items */}
                {gameStep === 2 && (
                  <div>
                    <div className="bg-blue-100 border-4 border-blue-300 rounded-2xl p-6 mb-6 text-center">
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        🍽️ Find the food the customer wants
                      </h3>
                    </div>

                    {/* Food Menu - Simple Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {currentQuestion.menuOptions.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleItemSelect(item)}
                          disabled={isAnswered}
                          className="bg-white hover:bg-blue-50 border-4 border-gray-300 hover:border-blue-400 rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg"
                        >
                          <div className="text-5xl mb-3">{item.image}</div>
                          <div className="font-bold text-gray-800 text-lg">{item.name}</div>
                          <div className="text-green-600 font-semibold text-lg">{item.price}</div>
                        </button>
                      ))}
                    </div>

                    {/* Selected Items Display */}
                    {selectedItems.length > 0 && (
                      <div className="bg-green-100 border-4 border-green-300 rounded-2xl p-6 mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                          ✅ Food I picked:
                        </h3>
                        <div className="flex flex-wrap gap-3 justify-center">
                          {selectedItems.map((item, index) => (
                            <div key={index} className="bg-white border-3 border-green-400 rounded-xl p-4 flex items-center space-x-3 shadow-md">
                              <span className="text-3xl">{item.image}</span>
                              <span className="font-semibold text-lg">{item.name}</span>
                              <button
                                onClick={() => handleRemoveItem(index)}
                                disabled={isAnswered}
                                className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg text-lg cursor-pointer font-bold"
                              >
                                ❌
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    {selectedItems.length > 0 && !isAnswered && (
                      <div className="text-center">
                        <button
                          onClick={handleCashierSubmit}
                          className="bg-purple-500 hover:bg-purple-600 text-white py-6 px-12 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg"
                        >
                          🎯 Give food to customer
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Complete */}
                {gameStep === 3 && (
                  <div className="text-center">
                    <div className="bg-purple-100 border-4 border-purple-300 rounded-2xl p-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        🏆 Good job helping the customer!
                      </h3>
                      <div className="text-xl font-bold text-purple-600">
                        You got {cashierScore} points! 🌟
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : isCashierGame ? (
            <div className="space-y-6">
              {/* Main Game Area */}
              <div className="bg-gradient-to-b from-blue-50 to-green-50 rounded-3xl p-4 -mt-2 border-4 border-blue-200 relative">
                
                {/* Characters with simplified design */}
                <div className="flex justify-between items-center relative min-h-[300px]">
                  
                  {/* Customer Character */}
                  <div className="flex flex-col items-center relative">
                    {/* Thought Bubble for Customer */}
                    {showThoughtBubble && currentSpeaker === 'customer' && (
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-3xl p-3 border-4 border-pink-300 shadow-2xl w-[250px] z-10 animate-bounce-gentle">
                        <div className="text-xl font-bold text-gray-800 text-center leading-relaxed">
                          {speechText}
                        </div>
                        {/* Bubble pointer */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                          <div className="w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-white"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Customer - Head only */}
                    <div className="text-center">
                      {/* Head - larger */}
                      <div className="text-[12rem] mb-4">👩‍🦱</div>
                      
                      {/* Label */}
                      <div className="bg-pink-500 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-lg">
                        Customer
                      </div>
                    </div>
                  </div>

                  {/* Restaurant Counter */}
                  <div className="flex-1 mx-16 mt-20">
                    <div className="h-32 bg-gradient-to-t from-amber-400 to-amber-200 rounded-2xl border-4 border-amber-500 relative flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-amber-900">🏪 Restaurant Counter 🏪</span>
                    </div>
                  </div>

                  {/* Cashier Character (You) */}
                  <div className="flex flex-col items-center relative">
                    {/* Thought Bubble for Cashier */}
                    {showThoughtBubble && currentSpeaker === 'cashier' && (
                      <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 bg-white rounded-3xl p-8 border-4 border-blue-300 shadow-2xl max-w-lg z-10 animate-bounce-gentle">
                        <div className="text-xl font-bold text-gray-800 text-center leading-relaxed">
                          {speechText}
                        </div>
                        {/* Bubble pointer */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                          <div className="w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-white"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Cashier - Head only */}
                    <div className="text-center">
                      {/* Head - larger */}
                      <div className="text-[12rem] mb-4">👨‍💼</div>
                      
                      {/* Label */}
                      <div className="bg-blue-500 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-lg">
                        You (Cashier)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="mt-8 space-y-6">
                {/* Step 1: Customer speaks */}
                {gameStep === 1 && (
                  <div className="text-center">
                    
                    {showThoughtBubble && (
                      <button
                        onClick={handleStartSelecting}
                        className="bg-green-500 hover:bg-green-600 text-white py-6 px-12 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg"
                      >
                        ✅ GET ORDER
                      </button>
                    )}
                  </div>
                )}

                {/* Step 2: Select items */}
                {gameStep === 2 && (
                  <div>
                    <div className="bg-blue-100 border-4 border-blue-300 rounded-2xl p-6 mb-6 text-center">
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        🍽️ Find the food the customer wants
                      </h3>
                      {/* <p className="text-xl text-gray-700 leading-relaxed">
                        Click on the food from the menu. Pick what the customer said!
                      </p> */}
                    </div>

                    {/* Food Menu - Simple Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {currentQuestion.menuOptions.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleItemSelect(item)}
                          disabled={isAnswered}
                          className="bg-white hover:bg-blue-50 border-4 border-gray-300 hover:border-blue-400 rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg"
                        >
                          <div className="text-5xl mb-3">{item.image}</div>
                          <div className="font-bold text-gray-800 text-lg">{item.name}</div>
                          <div className="text-green-600 font-semibold text-lg">{item.price}</div>
                        </button>
                      ))}
                    </div>

                    {/* Selected Items Display */}
                    {selectedItems.length > 0 && (
                      <div className="bg-green-100 border-4 border-green-300 rounded-2xl p-6 mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                          ✅ Food I picked:
                        </h3>
                        <div className="flex flex-wrap gap-3 justify-center">
                          {selectedItems.map((item, index) => (
                            <div key={index} className="bg-white border-3 border-green-400 rounded-xl p-4 flex items-center space-x-3 shadow-md">
                              <span className="text-3xl">{item.image}</span>
                              <span className="font-semibold text-lg">{item.name}</span>
                              <button
                                onClick={() => handleRemoveItem(index)}
                                disabled={isAnswered}
                                className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg text-lg cursor-pointer font-bold"
                              >
                                ❌
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    {selectedItems.length > 0 && !isAnswered && (
                      <div className="text-center">
                        <button
                          onClick={handleCashierSubmit}
                          className="bg-purple-500 hover:bg-purple-600 text-white py-6 px-12 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg"
                        >
                          🎯 Give food to customer
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Complete */}
                {gameStep === 3 && (
                  <div className="text-center">
                    <div className="bg-purple-100 border-4 border-purple-300 rounded-2xl p-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        🏆 Good job helping the customer!
                      </h3>
                      <div className="text-xl font-bold text-purple-600">
                        You got {cashierScore} points! 🌟
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : isGreetingsGame ? (
            <div className="space-y-6">
              {/* Main Game Area */}
              <div className="bg-gradient-to-b from-green-50 to-blue-50 rounded-3xl p-4 -mt-2 border-4 border-green-200 relative">
                
                {/* Social Greetings Adventure UI */}
                <div className="flex justify-between items-center relative min-h-[300px]">
                  
                  {/* Student Character (You) */}
                  <div className="flex flex-col items-center relative">
                    {/* Thought Bubble for Student */}
                    {currentGreetingScenario?.studentThought && (
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-3xl p-3 border-4 border-blue-300 shadow-2xl w-[250px] z-10 animate-bounce-gentle">
                        <div className="text-xl font-bold text-gray-800 text-center leading-relaxed">
                          {currentGreetingScenario.studentThought}
                        </div>
                        {/* Bubble pointer */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                          <div className="w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-white"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Student Character - Head only */}
                    <div className="text-center">
                      {/* Head - larger */}
                      <div className="text-[12rem] mb-4">👦</div>
                      
                      {/* Label */}
                      <div className="bg-blue-500 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-lg">
                        You
                      </div>
                    </div>
                  </div>

                  {/* Scene Background */}
                  <div className="flex-1 mx-16 mt-20">
                    <div className="h-32 bg-gradient-to-t from-yellow-400 to-yellow-200 rounded-2xl border-4 border-yellow-500 relative flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-yellow-900">
                        {currentGreetingScenario?.background} 
                        {currentGreetingScenario?.context === 'morning' ? '🌅' : 
                         currentGreetingScenario?.context === 'afternoon' ? '☀️' : 
                         currentGreetingScenario?.context === 'evening' ? '🌆' : '🏫'}
                      </span>
                    </div>
                  </div>

                  {/* Other Character */}
                  <div className="flex flex-col items-center relative">
                    {/* Speech Bubble for Other Character */}
                    {currentGreetingScenario?.otherCharacterSpeech && (
                      <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 bg-white rounded-3xl p-8 border-4 border-pink-300 shadow-2xl max-w-lg z-10 animate-bounce-gentle">
                        <div className="text-xl font-bold text-gray-800 text-center leading-relaxed">
                          {currentGreetingScenario.otherCharacterSpeech}
                        </div>
                        {/* Bubble pointer */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                          <div className="w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-white"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Other Character - Head only */}
                    <div className="text-center">
                      {/* Head - larger */}
                      <div className="text-[12rem] mb-4">
                        {currentGreetingScenario?.character}
                      </div>
                      
                      {/* Label */}
                      <div className="bg-pink-500 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-lg">
                        {currentGreetingScenario?.characterType}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scenario Title and Context */}
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-4 border-purple-300 rounded-2xl p-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                      🌟 Social Greetings Adventure 🌟
                    </h2>
                    <p className="text-xl font-semibold text-gray-700">
                      Round {greetingsRound}/5 - {currentGreetingScenario?.title}
                    </p>
                    <p className="text-lg text-gray-600 mt-2">
                      {currentGreetingScenario?.situation}
                    </p>
                  </div>
                </div>

                {/* Greeting Choice Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {currentGreetingScenario?.choices?.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => handleGreetingAnswer(choice)}
                      disabled={greetingAnswered}
                      className={`
                        p-6 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg border-4
                        ${choice.correct && greetingAnswered 
                          ? 'bg-green-100 border-green-400 text-green-800' 
                          : !choice.correct && greetingAnswered
                          ? 'bg-red-100 border-red-400 text-red-800'
                          : 'bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-400 text-gray-800'}
                        ${greetingAnswered ? 'cursor-not-allowed' : ''}
                      `}
                    >
                      <div className="text-4xl mb-3">{choice.emoji}</div>
                      <div className="leading-relaxed">{choice.text}</div>
                      {choice.correct && greetingAnswered && (
                        <div className="text-green-600 font-bold mt-3">✅ Perfect greeting!</div>
                      )}
                      {!choice.correct && greetingAnswered && greetingSelectedChoice === choice && (
                        <div className="text-red-600 font-bold mt-3">❌ Try a different approach</div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Feedback Section */}
                {greetingAnswered && (
                  <div className="bg-gradient-to-r from-blue-100 to-green-100 border-4 border-blue-300 rounded-2xl p-6 text-center">
                    <div className="text-6xl mb-4">
                      {greetingSelectedChoice?.correct ? '🎉' : '🤔'}
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-3">
                      {greetingSelectedChoice?.correct ? 'Excellent greeting!' : 'Let\'s try again!'}
                    </div>
                    <div className="text-lg text-gray-700 mb-4">
                      {greetingSelectedChoice?.feedback}
                    </div>
                    {greetingSelectedChoice?.correct && (
                      <div className="text-xl font-bold text-green-600">
                        +20 points! 🌟 (Score: {greetingsScore}/100)
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="bg-gray-200 rounded-full h-4 mb-4">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${(greetingsScore / 100) * 100}%` }}
                  ></div>
                </div>
                <div className="text-center text-lg font-semibold text-gray-700">
                  Progress: {greetingsScore}/100 points
                </div>
              </div>
            </div>
          ) : isMoneyGame ? (
            <div className="space-y-6">
              {/* Money Value Game Main Area */}
              <div className="bg-gradient-to-b from-green-50 to-blue-50 rounded-3xl p-6 border-4 border-green-200 relative overflow-hidden">
                
                {/* Game Header */}
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-r from-yellow-100 to-green-100 border-4 border-yellow-300 rounded-2xl p-6 relative">
                    <div className="absolute -top-2 -right-2 text-6xl animate-bounce-gentle">💰</div>
                    <div className="absolute -top-2 -left-2 text-4xl animate-float">🏪</div>
                    <h2 className="text-4xl font-bold text-gray-800 mb-2">
                      💱 Money Value Adventure 💱
                    </h2>
                    <p className="text-xl font-semibold text-gray-700">
                      Round {moneyRound}/3 - Learn Philippine Peso Values!
                    </p>
                  </div>
                </div>

                {/* Budget Display */}
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-4 border-blue-300 rounded-2xl p-6 mb-6 text-center relative">
                  <div className="absolute -top-3 -left-3 text-5xl animate-pulse-gentle">💳</div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-3">Your Budget</h3>
                  <div className="text-6xl font-extrabold text-green-600 bg-white/70 backdrop-blur-sm rounded-xl p-4 border-2 border-green-200">
                    ₱{currentBudget.toLocaleString()}
                  </div>
                  <p className="text-lg text-gray-600 mt-3">Choose items you can afford!</p>
                </div>

                {/* Shopping Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {currentMoneyItems.map((item, index) => {
                    const isAffordable = item.price <= currentBudget;
                    const isPurchased = selectedPurchases.some(p => p.id === item.id);
                    
                    return (
                      <div
                        key={item.id}
                        className={`
                          relative bg-white/90 backdrop-blur-xl rounded-2xl p-6 border-4 shadow-xl transition-all duration-300 transform hover:scale-105
                          ${isAffordable ? 'border-green-300 hover:border-green-500' : 'border-gray-300 hover:border-gray-400'}
                          ${isPurchased ? 'ring-4 ring-green-400 bg-green-50' : ''}
                        `}
                      >
                        {/* Affordability Indicator */}
                        <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xl ${
                          isAffordable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {isAffordable ? '✓' : '❌'}
                        </div>
                        
                        {/* Item Display */}
                        <div className="text-center">
                          <div className="text-8xl mb-4">{item.image}</div>
                          <h4 className="text-2xl font-bold text-gray-800 mb-3">{item.name}</h4>
                          <div className={`text-3xl font-bold mb-4 p-3 rounded-xl ${
                            isAffordable ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                          }`}>
                            ₱{item.price.toLocaleString()}
                          </div>
                          
                          {/* Purchase Button */}
                          <button
                            onClick={() => handlePurchaseItem(item)}
                            disabled={isPurchased || isRoundComplete}
                            className={`
                              w-full py-4 px-6 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg
                              ${isPurchased 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : isAffordable
                                  ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white cursor-pointer'
                                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white cursor-pointer'
                              }
                              ${isRoundComplete ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            {isPurchased ? '✅ Purchased!' : '🛒 Purchase'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Feedback Section */}
                {showMoneyFeedback && (
                  <div className={`rounded-2xl p-6 text-center border-4 mb-6 ${
                    moneyFeedbackType === 'correct' 
                      ? 'bg-gradient-to-r from-green-100 to-blue-100 border-green-400'
                      : 'bg-gradient-to-r from-orange-100 to-red-100 border-orange-400'
                  }`}>
                    <div className="text-6xl mb-4">
                      {moneyFeedbackType === 'correct' ? '🎉' : '💭'}
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-3">
                      {moneyFeedbackMessage}
                    </div>
                  </div>
                )}

                {/* Progress and Controls */}
                <div className="text-center">
                  {/* Score Display */}
                  <div className="bg-purple-100 border-4 border-purple-300 rounded-2xl p-4 mb-4">
                    <div className="text-2xl font-bold text-purple-800">
                      Correct Purchases: {moneyScore} 🏆
                    </div>
                    {selectedPurchases.length > 0 && (
                      <div className="text-lg text-gray-700 mt-2">
                        Total Spent: ₱{totalSpent.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Next Round Button */}
                  {selectedPurchases.length > 0 && !isRoundComplete && (
                    <button
                      onClick={proceedToNextMoneyRound}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 px-8 rounded-2xl text-xl font-bold shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer"
                    >
                      {moneyRound < 3 ? '➡️ Next Round' : '🏆 Complete Game'}
                    </button>
                  )}
                </div>

                {/* Badge Completion Modal */}
                {showBadgeCompletion && (
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/90 via-green-400/90 to-blue-400/90 backdrop-blur-md rounded-3xl flex items-center justify-center z-50">
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-12 text-center shadow-2xl border-4 border-yellow-300 relative animate-modal-appear">
                      <div className="absolute -top-8 -right-8 text-8xl animate-spin-slow">🏆</div>
                      <div className="absolute -bottom-4 -left-4 text-6xl animate-bounce-gentle">💰</div>
                      
                      <div className="text-8xl mb-6 animate-bounce-gentle">🎉</div>
                      <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-green-600 mb-4">
                        Money Master Achievement!
                      </h3>
                      <div className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-2xl p-6 mb-6 border-2 border-yellow-200">
                        <p className="text-2xl font-bold text-gray-800 mb-3">
                          🏆 Badge Earned: Money Master 💰
                        </p>
                        <p className="text-lg text-gray-700 mb-2">
                          You completed all 3 rounds and learned about Philippine Peso values!
                        </p>
                        <p className="text-xl font-bold text-green-600">
                          Final Score: {moneyScore} correct purchases! 🌟
                        </p>
                      </div>
                      
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={restartMoneyGame}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-6 rounded-2xl text-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer"
                        >
                          🔄 Play Again
                        </button>
                        <button
                          onClick={() => onComplete(moneyScore, 3)}
                          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 px-6 rounded-2xl text-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer"
                        >
                          🚀 Continue Adventure
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Correct Overlay */}
        {showCorrect && (
          <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 rounded-2xl">
            <audio ref={correctAudioRef} src={correctSound} />
            <div className="text-[8rem]">😄</div>
            <div className="text-green-500 text-4xl font-bold mt-2">CORRECT!</div>
          </div>
        )}

        {/* Wrong Overlay */}
        {showWrong && (
          <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 rounded-2xl">
            <audio ref={wrongAudioRef} src={wrongSound} />
            <div className="text-[8rem]">😞</div>
            <div className="text-red-500 text-4xl font-bold mt-2">WRONG!</div>
          </div>
        )}
      </div>

      {/* Enhanced Next Button */}
      {isAnswered && (
        <div className="absolute right-7 bottom-90 animate-slide-in-right">
          <button
            {...getButtonSoundHandlers(handleNextClick)}
            className="w-50 relative right-6 top-38 cursor-pointer bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white  py-3 rounded-2xl text-lg font-bold shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center space-x-3 border-2 border-white/30 backdrop-blur-sm animate-pulse-gentle"
          >
            <span className="text-2xl animate-bounce-gentle">
              {currentQuestionIndex < questions.length - 1 ? "➡️" : "🎯"}
            </span>
            <span>{currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish"}</span>
            <span className="text-xl animate-float">✨</span>
          </button>
        </div>
      )}

      {/* Badge Preview Notification */}
      {showBadgePreview && previewBadge && (
        <div className="fixed top-20 right-4 z-40 animate-slide-in-right">
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white p-4 rounded-2xl shadow-2xl border-2 border-white/30 backdrop-blur-sm flex items-center space-x-3 min-w-[280px]">
            <div className="text-3xl animate-bounce-gentle">{previewBadge.icon}</div>
            <div>
              <div className="font-bold text-lg">{previewBadge.name}</div>
              <div className="text-sm opacity-90">{previewBadge.message}</div>
            </div>
            <div className="text-2xl animate-pulse-gentle">✨</div>
          </div>
        </div>
      )}

      {/* Enhanced Completion Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-black/30 via-purple-900/20 to-pink-900/20 backdrop-blur-md z-50 animate-fade-in">
          <Confetti width={window.innerWidth} height={window.innerHeight} />
          <audio ref={audioRef} src={celebrationSound} />
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-12 w-[500px] shadow-2xl text-center relative border border-white/30 overflow-hidden animate-modal-appear">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-blue-50/50"></div>
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-bl from-purple-200/30 to-transparent rounded-full blur-2xl animate-float"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-pink-200/30 to-transparent rounded-full blur-xl animate-float-delayed"></div>
            
            <div className="relative z-10">
              <div className="relative mb-6">
                <div className="text-8xl animate-bounce-gentle drop-shadow-2xl">🎉</div>
                <div className="absolute -top-2 -right-4 text-4xl animate-spin-slow">⭐</div>
                <div className="absolute -bottom-2 -left-4 text-3xl animate-float">✨</div>
                <div className="absolute top-2 left-8 text-2xl animate-pulse-gentle">🌟</div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border-2 border-purple-200/50">
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4 animate-text-shimmer">
                  Amazing Work!
                </h2>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
                  <p className="text-2xl font-bold text-gray-800 mb-2">
                    You scored <span className="text-3xl text-purple-600">{score}</span> out of <span className="text-3xl text-pink-600">{isHygieneGame || isStreetGame ? 5 : total}</span>!
                  </p>
                  {activity === "Cashier Game" && (
                    <p className="text-xl font-bold text-green-600 mb-2">
                      Cashier Points: <span className="text-2xl">{cashierScore}</span> 🏪
                    </p>
                  )}
                  {activity === "Hygiene Hero" && (
                    <p className="text-xl font-bold text-blue-600 mb-2">
                      Hygiene Score: <span className="text-2xl">{hygieneScore}</span>/5 🧼✨
                    </p>
                  )}
                  {activity === "Safe Street Crossing" && (
                    <p className="text-xl font-bold text-green-600 mb-2">
                      Safety Score: <span className="text-2xl">{streetScore}</span>/5 🚦✨
                    </p>
                  )}
                  <div className="flex justify-center items-center space-x-2 mt-3">
                    <span className="text-2xl animate-bounce-gentle">🏆</span>
                    <span className="text-lg font-semibold text-gray-700">
                      {isHygieneGame ? 
                        (hygieneScore === 5 ? "Perfect Hygiene Hero!" : 
                         hygieneScore >= 4 ? "Excellent Hygiene!" : 
                         hygieneScore >= 3 ? "Great Job Learning!" : "Keep Practicing!") :
                       activity === "Safe Street Crossing" ?
                        (streetScore === 5 ? "Perfect Safety Champion!" : 
                         streetScore >= 4 ? "Excellent Street Safety!" : 
                         streetScore >= 3 ? "Great Job Staying Safe!" : "Keep Learning Safety!") :
                        (score === total ? "Perfect Score!" : 
                         score >= total * 0.8 ? "Excellent!" : 
                         score >= total * 0.6 ? "Great Job!" : "Keep Learning!")
                      }
                    </span>
                    <span className="text-2xl animate-bounce-gentle">🌟</span>
                  </div>
                </div>
              </div>
              
              <button
                className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 text-white px-10 py-4 rounded-2xl cursor-pointer text-xl font-bold transition-all duration-300 shadow-2xl transform hover:scale-110 flex items-center mx-auto space-x-3 border-2 border-white/30 backdrop-blur-sm"
                onClick={handleFinish}
              >
                <span className="text-2xl animate-bounce-gentle">🚀</span>
                <span>Continue Adventure</span>
                <span className="text-xl animate-float">✨</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Badge Award Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-black/40 via-purple-900/30 to-pink-900/30 backdrop-blur-md z-50 animate-fade-in">
          <Confetti 
            width={window.innerWidth} 
            height={window.innerHeight}
            colors={['#FFD700', '#FFA500', '#FF6347', '#9370DB', '#00CED1', '#FF69B4']}
            numberOfPieces={200}
            recycle={true}
            run={showBadgeModal}
          />
          <audio ref={badgeAudioRef} src={badgeCelebrationSound} />
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl text-center relative border border-white/30 overflow-hidden animate-modal-appear max-h-[90vh] overflow-y-auto">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-purple-50/50 to-blue-50/50"></div>
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-bl from-yellow-200/30 to-transparent rounded-full blur-3xl animate-float"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-2xl animate-float-delayed"></div>
            <div className="absolute top-20 left-20 w-24 h-24 bg-gradient-to-br from-pink-200/20 to-transparent rounded-full blur-xl animate-pulse-gentle"></div>
            
            <div className="relative z-10">
              {/* Dynamic Header Based on Achievement */}
              <div className="mb-8">
                {(() => {
                  const achievement = getBadgeAchievementMessage(earnedBadges);
                  return (
                    <>
                      <div className="relative mb-6">
                        <div className="text-8xl animate-bounce-gentle drop-shadow-2xl">🏅</div>
                        <div className="absolute -top-4 -right-8 text-4xl animate-spin-slow">✨</div>
                        <div className="absolute -bottom-4 -left-8 text-3xl animate-float">{achievement.emotion}</div>
                        <div className="absolute top-8 left-16 text-2xl animate-pulse-gentle">💫</div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-amber-50 to-purple-50 rounded-2xl p-6 mb-6 border-2 border-amber-200/50">
                        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-purple-600 to-blue-600 mb-3 animate-text-shimmer">
                          {achievement.title}
                        </h2>
                        <p className="text-lg text-gray-700 font-semibold mb-4">
                          {achievement.message}
                        </p>
                        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-purple-100">
                          <p className="text-sm text-gray-600">
                            You've unlocked <span className="font-bold text-purple-600">{earnedBadges.length}</span> amazing badge{earnedBadges.length > 1 ? 's' : ''} 
                            and earned <span className="font-bold text-amber-600">{earnedBadges.reduce((sum, badge) => sum + (badge.points || 0), 0)}</span> points!
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Badges Grid with Enhanced Design */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-h-60 overflow-y-auto">
                {earnedBadges.map((badge, index) => (
                  <div 
                    key={badge.id}
                    className={`
                      bg-gradient-to-br ${badge.gradient} p-6 rounded-2xl shadow-2xl transform 
                      hover:scale-105 transition-all duration-300 border-2 border-white/30 
                      backdrop-blur-sm animate-badge-appear relative overflow-hidden group
                      ${badge.rarity === 'legendary' ? 'ring-4 ring-yellow-300/60 shadow-yellow-200/30' : 
                        badge.rarity === 'epic' ? 'ring-3 ring-purple-300/60 shadow-purple-200/30' : 
                        badge.rarity === 'rare' ? 'ring-2 ring-blue-300/60 shadow-blue-200/30' : 
                        'shadow-gray-200/20'}
                    `}
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    {/* Rarity indicator */}
                    <div className={`
                      absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold uppercase
                      ${badge.rarity === 'legendary' ? 'bg-yellow-200/90 text-yellow-900' : 
                        badge.rarity === 'epic' ? 'bg-purple-200/90 text-purple-900' : 
                        badge.rarity === 'rare' ? 'bg-blue-200/90 text-blue-900' : 
                        'bg-gray-200/90 text-gray-800'}
                      transform group-hover:scale-110 transition-transform duration-300
                    `}>
                      {badge.rarity}
                    </div>
                    
                    {/* Points indicator */}
                    <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                      <span className="text-xs font-bold text-white">+{badge.points}pts</span>
                    </div>
                    
                    {/* Badge shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 -translate-x-full group-hover:animate-shine"></div>
                    
                    <div className="text-center text-white relative z-10">
                      <div className="text-5xl mb-3 animate-bounce-gentle drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        {badge.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2 drop-shadow-sm">
                        {badge.name}
                      </h3>
                      <p className="text-sm opacity-90 leading-relaxed">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="flex-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-2xl text-xl font-bold transition-all duration-300 shadow-2xl transform hover:scale-105 flex items-center justify-center space-x-3 border-2 border-white/30 backdrop-blur-sm group"
                  onClick={() => {
                    setShowBadgeModal(false);
                    onComplete(score, total);
                  }}
                >
                  <span className="text-2xl animate-bounce-gentle group-hover:animate-spin-slow">🚀</span>
                  <span>Continue Adventure</span>
                  <span className="text-xl animate-float">✨</span>
                </button>
                
                <button
                  className="flex-1 bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-200 hover:from-amber-200 hover:via-yellow-200 hover:to-amber-300 text-amber-800 px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 border-2 border-amber-200/50"
                  onClick={() => navigate('/studentpage')}
                >
                  <span className="text-xl animate-bounce-gentle">🏆</span>
                  <span>View Collection</span>
                  <span className="text-lg animate-pulse-gentle">📚</span>
                </button>
              </div>
              
              {/* Badge Statistics Summary */}
              <div className="mt-6 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-4 border border-gray-200/50">
                <div className="flex items-center justify-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🏆</div>
                    <div className="font-bold text-gray-700">{earnedBadges.reduce((sum, badge) => sum + (badge.points || 0), 0)}</div>
                    <div className="text-xs text-gray-500">Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🎯</div>
                    <div className="font-bold text-gray-700">{((score / total) * 100).toFixed(0)}%</div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">⭐</div>
                    <div className="font-bold text-gray-700">{earnedBadges.length}</div>
                    <div className="text-xs text-gray-500">Badge{earnedBadges.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Styles for Autism-Friendly Animations */}
      <style jsx>{`
        /* Gentle floating animations */
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            filter: brightness(1);
          }
          50% { 
            transform: translateY(-8px) rotate(1deg); 
            filter: brightness(1.05);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            filter: brightness(1);
          }
          50% { 
            transform: translateY(-6px) rotate(-0.5deg); 
            filter: brightness(1.03);
          }
        }
        
        .animate-float {
          animation: float 3.5s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
          animation-delay: 1.2s;
        }
        
        /* Gentle bouncing */
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        
        /* Gentle pulsing */
        @keyframes pulse-gentle {
          0%, 100% { 
            transform: scale(1); 
            opacity: 1; 
          }
          50% { 
            transform: scale(1.02); 
            opacity: 0.95; 
          }
        }
        
        @keyframes success-pulse {
          0%, 100% { 
            transform: scale(1.05); 
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.4); 
          }
          50% { 
            transform: scale(1.08); 
            box-shadow: 0 0 40px rgba(34, 197, 94, 0.6); 
          }
        }
        
        .animate-pulse-gentle {
          animation: pulse-gentle 2.5s ease-in-out infinite;
        }
        
        .animate-success-pulse {
          animation: success-pulse 1.5s ease-in-out infinite;
        }
        
        /* Slide and scale animations */
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes modal-appear {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-30px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in-scale {
          animation: fade-in-scale 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-modal-appear {
          animation: modal-appear 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
        
        /* Badge preview slide animation */
        @keyframes badge-slide-in {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        .animate-slide-in-right {
          animation: badge-slide-in 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Text effects */
        @keyframes text-shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-text-shimmer {
          background-size: 200% 200%;
          animation: text-shimmer 3s ease-in-out infinite;
        }
        
        /* Slow gentle spin */
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        /* Fade in */
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        
        /* Badge specific animations */
        @keyframes badge-appear {
          from {
            opacity: 0;
            transform: scale(0.5) rotate(180deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        
        @keyframes shine {
          from {
            transform: translateX(-100%) skewX(-12deg);
          }
          to {
            transform: translateX(200%) skewX(-12deg);
          }
        }
        
        .animate-badge-appear {
          animation: badge-appear 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-shine {
          animation: shine 2s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        /* Slide across animation for menu items */
        @keyframes slide-across {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }
        
        .animate-slide-across {
          animation: slide-across 0.6s ease-in-out;
        }
        
        /* Accessibility: Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* Enhanced focus styles for accessibility */
        button:focus-visible {
          outline: 3px solid #8b5cf6;
          outline-offset: 3px;
          box-shadow: 0 0 0 6px rgba(139, 92, 246, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Flashcards;