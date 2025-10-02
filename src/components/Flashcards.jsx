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
  
  // Refs for connection lines
  const leftItemRefs = useRef({});
  const rightItemRefs = useRef({});
  const gameContainerRef = useRef(null);
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

  // Matching Game specific state
  const [matchingScore, setMatchingScore] = useState(0);
  const [matchingConnections, setMatchingConnections] = useState([]);
  const [selectedLeftItem, setSelectedLeftItem] = useState(null);
  const [selectedRightItem, setSelectedRightItem] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [isMatchingComplete, setIsMatchingComplete] = useState(false);
  const [showMatchingFeedback, setShowMatchingFeedback] = useState(false);
  const [matchingFeedbackMessage, setMatchingFeedbackMessage] = useState('');
  const [matchingFeedbackType, setMatchingFeedbackType] = useState(''); // 'correct' or 'incorrect'
  const [wrongConnections, setWrongConnections] = useState([]);
  
  // New drag-and-drop matching game state
  const [dragConnections, setDragConnections] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [isAnswersChecked, setIsAnswersChecked] = useState(false);
  const [correctConnections, setCorrectConnections] = useState([]);
  const [incorrectConnections, setIncorrectConnections] = useState([]);
  const [canSubmit, setCanSubmit] = useState(false);
  const [shuffledRightItems, setShuffledRightItems] = useState(null);

  // Academic Puzzle Game specific state
  const [puzzleScore, setPuzzleScore] = useState(0);
  const [puzzleRound, setPuzzleRound] = useState(1);
  const [currentPuzzleType, setCurrentPuzzleType] = useState('math'); // 'math', 'spelling', 'logic', 'sequence'
  const [isPuzzleGameActive, setIsPuzzleGameActive] = useState(false);
  const [puzzleFeedbackMessage, setPuzzleFeedbackMessage] = useState('');
  const [showPuzzleFeedback, setShowPuzzleFeedback] = useState(false);
  const [puzzleFeedbackType, setPuzzleFeedbackType] = useState(''); // 'correct' or 'incorrect'
  const [draggedItems, setDraggedItems] = useState([]);
  const [targetPositions, setTargetPositions] = useState([]);
  const [selectedPuzzleAnswers, setSelectedPuzzleAnswers] = useState([]);
  const [showPuzzleHint, setShowPuzzleHint] = useState(false);
  const [puzzleAttempts, setPuzzleAttempts] = useState(0);
  const [isPuzzleComplete, setIsPuzzleComplete] = useState(false);
  const [currentPuzzleData, setCurrentPuzzleData] = useState(null);
  const [showPuzzleAnimation, setShowPuzzleAnimation] = useState(false);

    const videoRef = useRef(null);
  const audioRef = useRef(null);
  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);
  const badgeAudioRef = useRef(null);
  const bgMusicRef = useRef(null);

  const celebrationSound = "/src/assets/sounds/Activitycompletion.mp3"; // Place your sound file here
  const correctSound = "/src/assets/sounds/correct.mp3"; 
  const wrongSound = "/src/assets/sounds/wrong.mp3";
  const badgeCelebrationSound = "/src/assets/sounds/Activitycompletion.mp3";
  const jungleBgMusic = "/src/assets/sounds/Jungle_BGmusic.wav";

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


  // Background music for Medium Identification activity
  useEffect(() => {
    if (activity === "Identification" && difficulty === "Medium") {
      // Play jungle background music
      if (bgMusicRef.current) {
        bgMusicRef.current.volume = 0.3; // Set volume to 30%
        bgMusicRef.current.loop = true; // Loop the music
        bgMusicRef.current.play().catch(console.error);
      }
    } else {
      // Stop background music for other activities
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
    }

    // Cleanup function to stop music when component unmounts or activity changes
    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
    };
  }, [activity, difficulty]);


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
            questionText: "What number is missing?",
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
        "Matching Type": [
          {
            questionText: "Simple Recognition - Match the pairs!",
            gameType: "matching",
            leftItems: [
              { id: 1, content: "🌞 Sun", type: "text" },
              
              { id: 3, content: "🐶Dog", type: "text" },
              { id: 4, content: "😺 Cat", type: "text" },
              { id: 5, content: "🚗 Car", type: "text" },
              { id: 6, content: "🪑 Chair", type: "text" },
              { id: 7, content: "📖 Book", type: "text" },
              
              { id: 9, content: "🏠 House", type: "text" },
              
            ],
            rightItems: [
              
              { id: "b", content: "Sit", type: "text", matchId: 6 },
              { id: "c", content: "Day", type: "text", matchId: 1 },
              { id: "d", content: "Meow", type: "text", matchId: 4 },
              { id: "e", content: "Live", type: "text", matchId: 9 },
              { id: "f", content: "Drive", type: "text", matchId: 5 },
              
              
              { id: "i", content: "Read", type: "text", matchId: 7 },
              { id: "j", content: "Bark", type: "text", matchId: 3 }
            ]
          }
        ],
        "Academic Puzzles": [
          {
            puzzleType: "logic",
            questionText: "Color puzzle",
            instruction: "Which one is RED?",
            options: ["🔵", "🍎", "☀️"],
            correctAnswer: "🍎",
            hint: "Look for the red colored object!"
          },
          {
            puzzleType: "logic",
            questionText: "Circle puzzle",
            instruction: "Find the CIRCLE.",
            options: ["🔺", "🟦", "⚪"],
            correctAnswer: "⚪",
            hint: "A circle is round with no corners!"
          },
          {
            puzzleType: "math",
            questionText: "Apple Counting Puzzle",
            instruction: "Count the Apples. How many are there?",
            objects: ["🍎", "🍎", "🍎"],
            options: [2, 3, 4],
            correctAnswer: 3,
            hint: "Count each apple: 1, 2, 3!"
          },
          {
            puzzleType: "matching",
            questionText: "Number Matching",
            instruction: "Number 6",
            objects: [{id: 1, content: "Five", color: "red"}, {id: 2, content: "Seven", color: "blue"}, {id: 3, content: "Six", color: "green"}],
            word: "BLUE",
            correctAnswer: 3,
            hint: "Match the 6 to number six!"
          },
          {
            puzzleType: "logic",
            questionText: "",
            instruction: "Which one says MEOW?",
            options: ["🐶", "🐱", "🐮"],
            correctAnswer: "🐱",
            hint: "Cats say meow!"
          }
        ]
      },
      Medium: {
        Identification: [
          {
            questionText: "What is this Animal?", 
            videoSrc: "/src/assets/flashcards/Animals/Snake.mp4",
            answerChoices: ["Lizard", "Worm", "Snake", "Monkey"],
            correctAnswer: "Snake"   
          },
          {
            questionText: "What animal is this?",
            videoSrc: "/src/assets/flashcards/Animals/Frog.mp4",
            answerChoices: ["Grasshopper", "Fish", "Bird", "Frog"],
            correctAnswer: "Frog"
          },
          {
            questionText: "What animal is this?",
            videoSrc: "/src/assets/flashcards/Animals/Panda.mp4",
            answerChoices: ["Panda", "Monkey", "Cat", "Lion"],
            correctAnswer: "Panda"
          },
          {
            questionText: "What animal is this?",
            videoSrc: "/src/assets/flashcards/Animals/Racoon.mp4",
            answerChoices: ["Dog", "Squirrel", "Cat", "Racoon"],
            correctAnswer: "Racoon"
          },
          {
            questionText: "What animal is this?",
            videoSrc: "/src/assets/flashcards/Animals/Lion.mp4",
            answerChoices: ["Tiger", "Lion", "Cat", "Dog"],
            correctAnswer: "Lion"
          }
        ],
    
        Numbers: [
          {
            questionText: "How many apples?",
            videoSrc: "/src/assets/flashcards/Numbers_Medium/7_Numbers.mp4",
            answerChoices: ["Six", "Seven", "Eight", "Five"],
            correctAnswer: "Seven"
          },
          {
            questionText: "How many ducks are left?",
            videoSrc: "/src/assets/flashcards/Numbers_Medium/1_Numbers.mp4",
            answerChoices: ["One", "Three", "Four", "Two"],
            correctAnswer: "One"
          },
          {
            questionText: "How many Ice Cream?",
            videoSrc: "/src/assets/flashcards/Numbers_Medium/5_Numbers.mp4",
            answerChoices: ["Three", "Six", "Four", "Five"],
            correctAnswer: "Five"
          },
          {
            questionText: "How many applesc are left?",
            videoSrc: "/src/assets/flashcards/Numbers_Medium/3_Numbers.mp4",
            answerChoices: ["Four", "Three", "Six", "Five"],
            correctAnswer: "Three"
          },
          {
            questionText: "How many balls?",
            videoSrc: "/src/assets/flashcards/Numbers_Medium/11_Numbers.mp4",
            answerChoices: ["Thirteen", "Eleven", "Twelve", "Ten"],
            correctAnswer: "Eleven"
          }
        ],
      





        "Matching Type": [
          {
            questionText: "Categories & School Concepts - Match the pairs!",
            gameType: "matching",
            leftItems: [
              { id: 1, content: "👩‍🏫 Teacher", type: "text" },
              { id: 2, content: "✏️ Pencil", type: "text" },
              { id: 3, content: "🕒 Clock", type: "text" },
              { id: 4, content: "👟 Shoes", type: "text" },
             
              { id: 6, content: "🐦 Bird", type: "text" },
              { id: 7, content: "🛏️ Bed", type: "text" },
              { id: 8, content: "🌧️ Rain", type: "text" },
              // { id: 9, content: "🔥 Fire", type: "text" },
              // { id: 10, content: "🎵 Music", type: "text" }
            ],
            rightItems: [
              { id: "a", content: "Fly", type: "text", matchId: 6 },
              { id: "b", content: "Time", type: "text", matchId: 3 },
              { id: "c", content: "Classroom", type: "text", matchId: 1 },
              { id: "d", content: "Wet", type: "text", matchId: 8 },
              { id: "e", content: "Write", type: "text", matchId: 2 },
              // { id: "f", content: "Hot", type: "text", matchId: 9 },
              { id: "g", content: "Sleep", type: "text", matchId: 7 },
              // { id: "h", content: "Dance", type: "text", matchId: 10 },
              { id: "i", content: "Feet", type: "text", matchId: 4 },
             
            ]
          }
        ],
        "Academic Puzzles": [
          {
            puzzleType: "spelling",
            questionText: "Spelling Puzzle",
            instruction: "Arrange the letters to spell the word 'CAT'.",
            targetWord: "CAT",
            letters: ["T", "A", "B", "R", "C"],
            correctAnswer: "CAT",
            hint: "The pet that says meow!"
          },
          {
            puzzleType: "math",
            questionText: "Simple Math Puzzle",
            instruction: "",
            equation: { first: 2, operator1: "+", second: 1 },
            options: [2, 3, 4],
            correctAnswer: 3,
            hint: "Add 2 and 1 together!"
          },
          {
            puzzleType: "sequence",
            questionText: "Sequence Puzzle",
            instruction: "What comes next?",
            sequence: ["🟦", "🔺", "⚪", "?"],
            options: ["🔺", "🟦", "⚪"],
            correctAnswer: "🟦",
            hint: "Look at the pattern - it repeats!"
          },
          {
            puzzleType: "sorting",
            questionText: "Sorting Puzzle",
            instruction: "Choose the fruit into the FRUIT basket.",
            items: [{id: 1, content: "🍎 Apple", category: "fruit"}, {id: 2, content: "🚗 Car", category: "vehicle"}, {id: 3, content: "🍌 Banana", category: "fruit"}],
            correctItems: [1, 3],
            hint: "Fruits are things you can eat!"
          },
          {
            puzzleType: "logic",
            questionText: "Opposites Puzzle",
            instruction: "What is the opposite of BIG?",
            options: ["Small", "Tall", "Round"],
            correctAnswer: "Small",
            hint: "Think about size - what's the opposite of big?"
          }
        ]
      },
      Hard: {
        "Matching Type": [
          {
            questionText: "Associations & Cause-Effect - Match the pairs!",
            gameType: "matching",
            leftItems: [
              // { id: 1, content: "🔥 Fire", type: "text" },
              { id: 2, content: "🌧️ Rain", type: "text" },
              { id: 3, content: "👨‍⚕️ Doctor", type: "text" },
              { id: 4, content: "👩‍ Chef", type: "text" },
              { id: 5, content: "🌱 Plant", type: "text" },
              { id: 6, content: "🕒 Clock", type: "text" },
              { id: 7, content: "👩‍🎓 Student", type: "text" },
              // { id: 8, content: "🌙 Night", type: "text" },
              { id: 9, content: "📚 Library", type: "text" },
              // { id: 10, content: "💧 Water", type: "text" }
            ],
            rightItems: [
              { id: "a", content: "☂️ Umbrella", type: "text", matchId: 2 },
              { id: "b", content: "📚 School", type: "text", matchId: 7 },
              // { id: "c", content: "Warmth", type: "text", matchId: 1 },
              { id: "d", content: "🌳 Grow", type: "text", matchId: 5 },
              { id: "e", content: "🏥 Hospital", type: "text", matchId: 3 },
              // { id: "f", content: "🌟 Sleep", type: "text", matchId: 8 },
              { id: "g", content: "Tells Time", type: "text", matchId: 6 },
              { id: "h", content: "🍴 Kitchen", type: "text", matchId: 4 },
              // { id: "i", content: "💧 Drink", type: "text", matchId: 10 },
              { id: "j", content: "📖 Books", type: "text", matchId: 9 }
            ]
          }
        ],
        
        Numbers: [
          {
            questionText: "What is 3 x 9?",
            videoSrc: "/src/assets/flashcards/Numbers_Hard/27_multiplication.mp4",
            answerChoices: ["28", "30", "27", "29"],
            correctAnswer: "27"
          },
          {
            questionText: "What is 8 x 4?",
            videoSrc: "/src/assets/flashcards/Numbers_Hard/32_multiplication.mp4",
            answerChoices: ["32", "34", "33", "31"],
            correctAnswer: "32"
          },
          {
            questionText: "What is 6 x 8?",
            videoSrc: "/src/assets/flashcards/Numbers_Hard/48_multiplication.mp4",
            answerChoices: ["49", "48", "47", "50"],
            correctAnswer: "48"
          },
          {
            questionText: "What is 5 x 7?",
            videoSrc: "/src/assets/flashcards/Numbers_Hard/35_multiplication.mp4",
            answerChoices: ["34", "36", "35", "33"],
            correctAnswer: "35"
          },
          {
            questionText: "What is 4 x 9?",
            videoSrc: "/src/assets/flashcards/Numbers_Hard/36_multiplication.mp4",
            answerChoices: ["36", "40", "38", "35"],
            correctAnswer: "36"
          }
        ],
      

        "Academic Puzzles": [
          {
            puzzleType: "math",
            questionText: "Advanced Math Puzzle",
            instruction: "",
            equation: { first: 5, operator1: "-", second: 2 },
            options: [2, 3, 4],
            correctAnswer: 3,
            hint: "Take away 2 from 5!"
          },
          {
            puzzleType: "logic",
            questionText: "Color Mixing Puzzle",
            instruction: "Red + Yellow = ?",
            options: ["Orange", "Green", "Purple"],
            correctAnswer: "Orange",
            hint: "When you mix red and yellow, you get orange!"
          },
          {
            puzzleType: "logic",
            questionText: "Word Association Puzzle",
            instruction: "Which one belongs with 'FISH'?",
            options: ["🐟 Water", "🐕 Dog", "🍎 Apple"],
            correctAnswer: "🐟 Water",
            hint: "Where do fish live?"
          },
          {
            puzzleType: "sequence",
            questionText: "Pattern Puzzle",
            instruction: "Complete the pattern:",
            sequence: ["🍎", "🍌", "🍎", "🍌", "...?"],
            options: ["🍌", "🍎", "🍊"],
            correctAnswer: "🍎",
            hint: "Look at the alternating pattern!"
          },
          {
            puzzleType: "logic",
            questionText: "Real-life Puzzle",
            instruction: "The traffic light is 🔴Red. What should you do?",
            options: ["Go", "Stop", "Jump"],
            correctAnswer: "Stop",
            hint: "Red means stop for safety!"
          }
        ]
        
      }
    },
    "Social / Daily Life Skill": {
      Easy: {
        "Cashier Game": [
          {
            questionText: "Count the objects and drag the correct number!",
            instruction: "How many 🍎 do you see?",
            objects: ["🍎", "🍎", "🍎"],
            correctAnswer: 3,
            options: [1, 2, 3, 4],
            hint: "Count each apple one by one!",
            gameType: "puzzle"
          },
          {
            puzzleType: "spelling",
            questionText: "Drag the letters to spell the word!",
            instruction: "Spell the word for this picture: 🐱",
            targetWord: "CAT",
            letters: ["C", "A", "T", "X", "B"],
            hint: "The word starts with 'C'",
            gameType: "puzzle"
          },
          {
            puzzleType: "logic",
            questionText: "Complete the pattern!",
            instruction: "What comes next in the pattern?",
            sequence: ["🔴", "🔵", "🔴", "🔵", "?"],
            correctAnswer: "🔴",
            options: ["🔴", "🔵", "🟡", "🟢"],
            hint: "Look at the repeating colors!",
            gameType: "puzzle"
          },
          {
            puzzleType: "sequence",
            questionText: "Put the pictures in the right order!",
            instruction: "Show the steps of brushing teeth:",
            items: [
              { id: 1, content: "🦷 Clean teeth", order: 3 },
              { id: 2, content: "🪥 Get toothbrush", order: 1 },
              { id: 3, content: "✨ Rinse mouth", order: 4 },
              { id: 4, content: "🧴 Add toothpaste", order: 2 }
            ],
            hint: "Think about what you do first!",
            gameType: "puzzle"
          }
        ],

        Medium: [
          {
            puzzleType: "math",
            questionText: "Solve the addition puzzle!",
            instruction: "Drag numbers to complete: 4 + ? = 7",
            equation: { first: 4, operator: "+", result: 7 },
            correctAnswer: 3,
            options: [1, 2, 3, 4, 5],
            hint: "What number plus 4 equals 7?",
            gameType: "puzzle"
          },
          {
            puzzleType: "spelling",
            questionText: "Build the word with syllables!",
            instruction: "Put syllables together to make: 🏠",
            targetWord: "HOUSE",
            syllables: ["HOU", "SE", "CAR", "DOG"],
            hint: "A place where people live",
            gameType: "puzzle"
          },
          {
            puzzleType: "logic",
            questionText: "Shape sorting puzzle!",
            instruction: "Group shapes by their properties:",
            shapes: [
              { id: 1, shape: "🔴", category: "circle" },
              { id: 2, shape: "🔺", category: "triangle" },
              { id: 3, shape: "🟦", category: "square" },
              { id: 4, shape: "🟣", category: "circle" },
              { id: 5, shape: "🔶", category: "triangle" }
            ],
            categories: ["circle", "triangle", "square"],
            hint: "Look at the shapes, not the colors!",
            gameType: "puzzle"
          },
          {
            puzzleType: "sequence",
            questionText: "Daily routine puzzle!",
            instruction: "Put these activities in order from morning to night:",
            items: [
              { id: 1, content: "🌙 Go to bed", order: 4 },
              { id: 2, content: "☀️ Wake up", order: 1 },
              { id: 3, content: "🍽️ Eat dinner", order: 3 },
              { id: 4, content: "🏫 Go to school", order: 2 }
            ],
            hint: "Think about your daily schedule!",
            gameType: "puzzle"
          }
        ],
        Hard: [
          {
            puzzleType: "math",
            questionText: "Multi-step math puzzle!",
            instruction: "Complete the equation: (3 × ?) + 2 = 11",
            equation: { first: 3, operator1: "×", operator2: "+", second: 2, result: 11 },
            correctAnswer: 3,
            options: [1, 2, 3, 4, 5],
            hint: "Work backwards: 11 - 2 = 9, then 9 ÷ 3 = ?",
            gameType: "puzzle"
          },
          {
            puzzleType: "spelling",
            questionText: "Advanced word building!",
            instruction: "Use letter tiles to spell: 🌈",
            targetWord: "RAINBOW",
            letters: ["R", "A", "I", "N", "B", "O", "W", "X", "Y", "Z"],
            hint: "A colorful arc in the sky after rain",
            gameType: "puzzle"
          },
          {
            puzzleType: "logic",
            questionText: "Complex pattern puzzle!",
            instruction: "Complete this number pattern:",
            sequence: [2, 4, 8, 16, "?"],
            correctAnswer: 32,
            options: [20, 24, 32, 64],
            hint: "Each number is double the previous one!",
            gameType: "puzzle"
          },
          {
            puzzleType: "sequence",
            questionText: "Science experiment steps!",
            instruction: "Put the steps in order to grow a plant:",
            items: [
              { id: 1, content: "🌱 Seedling grows", order: 3 },
              { id: 2, content: "🌰 Plant seed", order: 1 },
              { id: 3, content: "🌸 Flower blooms", order: 4 },
              { id: 4, content: "💧 Water daily", order: 2 }
            ],
            hint: "Think about how plants grow step by step!",
            gameType: "puzzle"
          }
        ]
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
  
  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Get current question and handle shuffling for matching games
  const originalQuestion = questions[currentQuestionIndex];
  const currentQuestion = (() => {
    if (originalQuestion?.gameType === 'matching' && originalQuestion.rightItems) {
      // Use shuffled items from state or create new shuffled version
      if (shuffledRightItems) {
        return {
          ...originalQuestion,
          rightItems: shuffledRightItems
        };
      }
      // This will be set in useEffect
      return originalQuestion;
    }
    return originalQuestion;
  })();
  
  // Effect to shuffle right items only when question changes
  useEffect(() => {
    if (originalQuestion?.gameType === 'matching' && originalQuestion.rightItems) {
      setShuffledRightItems(shuffleArray(originalQuestion.rightItems));
    } else {
      setShuffledRightItems(null);
    }
    // Reset matching game state when question changes
    setDragConnections([]);
    setIsAnswersChecked(false);
    setCorrectConnections([]);
    setIncorrectConnections([]);
    setCanSubmit(false);
  }, [currentQuestionIndex, category, difficulty, activity]);
  
  // Debug logging for matching game
  if (activity === "MatchingType" || activity === "Matching Type") {
    console.log('Matching game debug:', {
      category,
      difficulty, 
      activity,
      questionsData: questionsData[category]?.[difficulty],
      questions,
      total,
      currentQuestion
    });
  }
  
  const isCashierGame = currentQuestion?.gameType === 'cashier';
  const isHygieneGame = currentQuestion?.gameType === 'hygiene';
  const isMatchingGame = currentQuestion?.gameType === 'matching';
  const isPuzzleGame = currentQuestion?.gameType === 'puzzle' || activity === "Academic Puzzles";
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

  // Initialize puzzle game when activity starts
  useEffect(() => {
    if (isPuzzleGame) {
      initializePuzzleGame();
    }
  }, [currentQuestionIndex, isPuzzleGame]);

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

  // Create connection line between matched items
  const createConnectionLine = (leftItemId, rightItemId) => {
    if (!gameContainerRef.current) return null;
    
    const leftElement = leftItemRefs.current[leftItemId];
    const rightElement = rightItemRefs.current[rightItemId];
    
    if (!leftElement || !rightElement) return null;
    
    const containerRect = gameContainerRef.current.getBoundingClientRect();
    const leftRect = leftElement.getBoundingClientRect();
    const rightRect = rightElement.getBoundingClientRect();
    
    // Calculate relative positions
    const x1 = leftRect.right - containerRect.left;
    const y1 = leftRect.top + leftRect.height / 2 - containerRect.top;
    const x2 = rightRect.left - containerRect.left;
    const y2 = rightRect.top + rightRect.height / 2 - containerRect.top;
    
    return { x1, y1, x2, y2, leftItemId, rightItemId };
  };

  // Academic Puzzle Game Functions
  const initializePuzzleGame = () => {
    const puzzleQuestions = questionsData[category]?.[difficulty]?.["Academic Puzzles"] || [];
    if (puzzleQuestions.length > 0) {
      const currentPuzzle = puzzleQuestions[currentQuestionIndex % puzzleQuestions.length];
      setCurrentPuzzleData(currentPuzzle);
      setCurrentPuzzleType(currentPuzzle.puzzleType);
      setPuzzleAttempts(0);
      setShowPuzzleHint(false);
      setSelectedPuzzleAnswers([]);
      setDraggedItems([]);
      setIsPuzzleComplete(false);
      setIsPuzzleGameActive(true);
    }
  };

  const handlePuzzleAnswer = (answer, isCorrect = null) => {
    console.log("handlePuzzleAnswer called with:", { answer, isCorrect, correctAnswer: currentPuzzleData.correctAnswer });
    setPuzzleAttempts(prev => prev + 1);
    
    // If isCorrect is not provided, check the answer against correctAnswer
    let correct = isCorrect;
    if (correct === null) {
      if (currentPuzzleData.puzzleType === 'matching') {
        correct = answer === currentPuzzleData.correctAnswer;
      } else if (currentPuzzleData.puzzleType === 'logic' || currentPuzzleData.puzzleType === 'math' || currentPuzzleData.puzzleType === 'sequence') {
        correct = answer === currentPuzzleData.correctAnswer;
      } else if (currentPuzzleData.puzzleType === 'spelling') {
        correct = answer === currentPuzzleData.correctAnswer;
      } else {
        correct = answer === currentPuzzleData.correctAnswer;
      }
    }
    
    console.log("Answer check result:", { answer, correctAnswer: currentPuzzleData.correctAnswer, correct });
    
    if (correct) {
      setPuzzleScore(prev => prev + 1);
      setScore(prev => prev + 1);
      setPuzzleFeedbackMessage("🎉 Excellent! You solved the puzzle!");
      setPuzzleFeedbackType("correct");
      setShowPuzzleFeedback(true);
      setShowPuzzleAnimation(true);
      setIsPuzzleComplete(true);
      
      // Show the same correct modal as Identification
      setShowCorrect(true);
      setTimeout(() => setShowCorrect(false), 1500);
      
      // Play success sound
      if (correctAudioRef.current) {
        correctAudioRef.current.play();
      }
      
      // Auto-proceed to next question after showing correct modal
      setTimeout(() => {
        setShowPuzzleAnimation(false);
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setIsAnswered(false);
          setPuzzleAttempts(0);
          setShowPuzzleHint(false);
          setIsPuzzleComplete(false);
          setCurrentPuzzleData(null);
          setSelectedPuzzleAnswers([]);
          setDraggedItems([]);
          setTargetPositions([]);
        } else {
          // If it's the last question, show completion modal
          setShowModal(true);
        }
      }, 1500); // Wait 1.5 seconds after correct answer before proceeding
      
    } else {
      setPuzzleFeedbackMessage("🤔 Not quite right. Try again!");
      setPuzzleFeedbackType("incorrect");
      setShowPuzzleFeedback(true);
      
      // Show the same wrong modal as Identification
      setShowWrong(true);
      setTimeout(() => setShowWrong(false), 1500);
      
      // Play wrong sound
      if (wrongAudioRef.current) {
        wrongAudioRef.current.play();
      }
      
      // Auto-proceed to next question after showing wrong modal
      setTimeout(() => {
        setShowPuzzleFeedback(false);
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setIsAnswered(false);
          setPuzzleAttempts(0);
          setShowPuzzleHint(false);
          setIsPuzzleComplete(false);
          setCurrentPuzzleData(null);
          setSelectedPuzzleAnswers([]);
          setDraggedItems([]);
          setTargetPositions([]);
        } else {
          // If it's the last question, show completion modal
          setShowModal(true);
        }
      }, 1500); // Wait 1.5 seconds after wrong answer before proceeding
      
    }
  };

  const handlePuzzleDrag = (item, targetPosition) => {
    const newDraggedItems = [...draggedItems];
    const existingIndex = newDraggedItems.findIndex(d => d.id === item.id);
    
    if (existingIndex >= 0) {
      newDraggedItems[existingIndex] = { ...item, position: targetPosition };
    } else {
      newDraggedItems.push({ ...item, position: targetPosition });
    }
    
    setDraggedItems(newDraggedItems);
  };

  const checkPuzzleCompletion = () => {
    if (!currentPuzzleData) return;
    
    switch (currentPuzzleData.puzzleType) {
      case 'sequence':
        const allItemsPlaced = currentPuzzleData.items.every(item => 
          draggedItems.some(dragged => dragged.id === item.id)
        );
        if (allItemsPlaced) {
          const isCorrectOrder = currentPuzzleData.items.every(item => {
            const draggedItem = draggedItems.find(d => d.id === item.id);
            return draggedItem && draggedItem.position === item.order - 1;
          });
          handlePuzzleAnswer(null, isCorrectOrder);
        }
        break;
        
      case 'spelling':
        if (selectedPuzzleAnswers.length === currentPuzzleData.targetWord.length) {
          const isCorrect = selectedPuzzleAnswers.join('') === currentPuzzleData.targetWord;
          handlePuzzleAnswer(selectedPuzzleAnswers.join(''), isCorrect);
        }
        break;
        
      default:
        break;
    }
  };

  const resetPuzzle = () => {
    setSelectedPuzzleAnswers([]);
    setDraggedItems([]);
    setPuzzleAttempts(0);
    setShowPuzzleHint(false);
    setShowPuzzleFeedback(false);
    setIsPuzzleComplete(false);
    setPuzzleFeedbackType('');
    setPuzzleFeedbackMessage('');
  };

  // New Drag-and-Drop Matching Game Functions
  const handleDragStart = (e, item, side) => {
    setDragging({ item, side });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleDragEnd = (e, targetItem, targetSide) => {
    if (!dragging) return;
    
    // Only allow connections from left to right
    if (dragging.side === 'left' && targetSide === 'right') {
      const existingConnection = dragConnections.find(
        conn => conn.leftId === dragging.item.id || conn.rightId === targetItem.id
      );
      
      if (!existingConnection) {
        const newConnection = {
          leftId: dragging.item.id,
          rightId: targetItem.id,
          leftContent: dragging.item.content,
          rightContent: targetItem.content,
          isCorrect: targetItem.matchId === dragging.item.id
        };
        
        setDragConnections(prev => [...prev, newConnection]);
        
        // Check if all 7 items are connected
        if (dragConnections.length + 1 >= 7) {
          setCanSubmit(true);
        }
      }
    }
    
    setDragging(null);
    setDragStart(null);
  };

  const handleCheckAnswers = () => {
    const correct = dragConnections.filter(conn => conn.isCorrect);
    const incorrect = dragConnections.filter(conn => !conn.isCorrect);
    
    setCorrectConnections(correct.map(conn => ({ leftId: conn.leftId, rightId: conn.rightId })));
    setIncorrectConnections(incorrect.map(conn => ({ leftId: conn.leftId, rightId: conn.rightId })));
    setIsAnswersChecked(true);
    
    // Calculate score
    const finalScore = correct.length;
    setMatchingScore(finalScore);
    setScore(prev => prev + finalScore);
    
    // Show completion with detailed feedback
    if (finalScore === 7) {
      setMatchingFeedbackMessage("🎉 PERFECT SCORE! All 7 answers correct! Excellent work! 🎊");
      setMatchingFeedbackType("correct");
    } else if (finalScore >= 5) {
      setMatchingFeedbackMessage(`🎯 Great job! ${finalScore}/7 correct. ${7 - finalScore} to review.`);
      setMatchingFeedbackType("partial");
    } else {
      setMatchingFeedbackMessage(`💪 Keep trying! ${finalScore}/7 correct. Review and try again!`);
      setMatchingFeedbackType("incorrect");
    }
    setShowMatchingFeedback(true);
    
    // Auto advance if all correct
    if (finalScore === 7) {
      setTimeout(() => {
        setIsAnswered(true);
        setIsMatchingComplete(true);
      }, 2000);
    }
  };

  const handleResetConnections = () => {
    setDragConnections([]);
    setCorrectConnections([]);
    setIncorrectConnections([]);
    setIsAnswersChecked(false);
    setCanSubmit(false);
    setShowMatchingFeedback(false);
    setMatchingScore(0);
    setMatchingFeedbackMessage('');
  };

  // Connection visualization function for string-like connections
  const getConnectionPath = (leftId, rightId) => {
    const leftElement = document.getElementById(`left-item-${leftId}`);
    const rightElement = document.getElementById(`right-item-${rightId}`);
    
    if (!leftElement || !rightElement) return '';
    
    const leftRect = leftElement.getBoundingClientRect();
    const rightRect = rightElement.getBoundingClientRect();
    const container = document.getElementById('matching-container')?.getBoundingClientRect();
    
    if (!container) return '';
    
    // Connect from right edge of left container to left edge of right container
    const startX = leftRect.right - container.left;
    const startY = leftRect.top + leftRect.height / 2 - container.top;
    const endX = rightRect.left - container.left;
    const endY = rightRect.top + rightRect.height / 2 - container.top;
    
    // Create straight string line (not curved)
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  };

  const resetMatchingGame = () => {
    // Reset drag-and-drop state
    setDragConnections([]);
    setCorrectConnections([]);
    setIncorrectConnections([]);
    setDragging(null);
    setDragStart(null);
    setIsAnswersChecked(false);
    setCanSubmit(false);
    
    // Reset general matching state
    setMatchingConnections([]);
    setSelectedLeftItem(null);
    setSelectedRightItem(null);
    setMatchedPairs([]);
    setIsMatchingComplete(false);
    setShowMatchingFeedback(false);
    setMatchingFeedbackMessage('');
    setWrongConnections([]);
    setMatchingScore(0);
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
      resetMatchingGame(); // Reset matching game state
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
          {!isCashierGame && !isHygieneGame && !isStreetGame && !isGreetingsGame && !isMoneyGame && !isMatchingGame && !isPuzzleGame ? (
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
          ) : isMatchingGame ? (
            /* Modern Interactive Matching Game UI */
            <div className="space-y-8">
              {/* Game Instructions */}
              <div className="flex flex-col items-center justify-center text-center bg-gradient-to-r -mt-6 from-blue-50 to-purple-50 rounded-2xl p-2 border-3 border-blue-200 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 text-6xl animate-bounce-gentle">🎯</div>
                <div className="absolute -bottom-2 -left-2 text-4xl animate-float">✨</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center space-x-3">
                  <span className="text-3xl animate-pulse-gentle">🎮</span>
                  <span>Drag & Drop!</span>
                </h3>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="bg-green-100 px-2 py-1 rounded-full text-green-700 font-semibold">
                    ✓ Connected: {dragConnections.length}/10
                  </span>
                  <span className="bg-blue-100 px-2 py-1 rounded-full text-blue-700 font-semibold">
                    🎯 Drag to connect!
                  </span>
                </div>
              </div>

              {/* Matching Game Area */}
              <div 
                id="matching-container"
                ref={gameContainerRef}
                className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-3xl p-4 border-4 border-purple-200 relative overflow-hidden shadow-2xl"
              >
                {/* Decorative Elements */}
                <div className="absolute top-2 right-2 text-2xl animate-spin-slow">⭐</div>
                <div className="absolute bottom-2 left-2 text-xl animate-float-delayed">🌟</div>
                
                <div className="flex justify-between items-start gap-4 relative">
                  {/* Left Column */}
                  <div className="w-1/3 space-y-2">
                    <h4 className="text-sm font-bold text-center text-gray-800 bg-gradient-to-r from-blue-100 to-purple-100 py-2 rounded-xl border-2 border-blue-200">
                      📋 Drag From Here
                    </h4>
                    {currentQuestion.leftItems.map((item, index) => (
                      <button
                        key={item.id}
                        id={`left-item-${item.id}`}
                        ref={el => leftItemRefs.current[item.id] = el}
                        onMouseDown={(e) => handleDragStart(e, item, 'left')}
                        disabled={dragConnections.some(conn => conn.leftId === item.id)}
                        className={`
                          w-full p-4 rounded-xl border-2 transition-all duration-300 transform text-lg h-20 min-h-[5rem]
                          ${dragConnections.some(conn => conn.leftId === item.id)
                            ? isAnswersChecked
                              ? correctConnections.some(conn => conn.leftId === item.id)
                                ? 'bg-gradient-to-r from-green-200 to-green-300 border-green-500 border-4 shadow-lg'
                                : 'bg-gradient-to-r from-red-200 to-red-300 border-red-500 border-4 shadow-lg'
                              : 'bg-gradient-to-r from-blue-200 to-blue-300 border-blue-400 cursor-not-allowed opacity-90'
                            : dragging?.item.id === item.id
                            ? 'bg-gradient-to-r from-yellow-200 to-orange-300 border-yellow-400 scale-105 shadow-xl animate-pulse-gentle'
                            : 'bg-gradient-to-r from-white to-blue-50 border-blue-200 hover:border-blue-400 hover:scale-105 hover:shadow-lg cursor-grab active:cursor-grabbing'
                          }
                          ${!dragConnections.some(conn => conn.leftId === item.id) ? 'hover:animate-bounce-gentle' : ''}
                          flex items-center justify-center text-center font-bold
                          focus:outline-none focus:ring-2 focus:ring-blue-300
                        `}
                      >
                        {item.type === 'emoji' ? (
                          <span className="text-4xl">{item.content}</span>
                        ) : (
                          <span className="text-xl text-gray-800 font-medium">{item.content}</span>
                        )}
                        {dragConnections.some(conn => conn.leftId === item.id) && (
                          <span className="ml-2 text-lg animate-bounce-gentle">
                            {isAnswersChecked 
                              ? correctConnections.some(conn => conn.leftId === item.id) 
                                ? '✅' 
                                : '❌'
                              : '🔗'
                            }
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* SVG String Connection Lines */}
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                    style={{ top: 0, left: 0 }}
                  >
                    {/* Drag connections with string-like appearance */}
                    {dragConnections.map((connection, index) => {
                      const path = getConnectionPath(connection.leftId, connection.rightId);
                      const isCorrect = correctConnections.some(
                        conn => conn.leftId === connection.leftId && conn.rightId === connection.rightId
                      );
                      const isIncorrect = incorrectConnections.some(
                        conn => conn.leftId === connection.leftId && conn.rightId === connection.rightId
                      );
                      
                      // Get coordinates for connection points
                      const leftElement = document.getElementById(`left-item-${connection.leftId}`);
                      const rightElement = document.getElementById(`right-item-${connection.rightId}`);
                      const container = document.getElementById('matching-container');
                      
                      let startX = 0, startY = 0, endX = 0, endY = 0;
                      if (leftElement && rightElement && container) {
                        const leftRect = leftElement.getBoundingClientRect();
                        const rightRect = rightElement.getBoundingClientRect();
                        const containerRect = container.getBoundingClientRect();
                        
                        startX = leftRect.right - containerRect.left;
                        startY = leftRect.top + leftRect.height / 2 - containerRect.top;
                        endX = rightRect.left - containerRect.left;
                        endY = rightRect.top + rightRect.height / 2 - containerRect.top;
                      }
                      
                      return (
                        <g key={`${connection.leftId}-${connection.rightId}`}>
                          {/* Main string line - thicker and light blue */}
                          <path
                            d={path}
                            stroke={isAnswersChecked ? (isCorrect ? "#10b981" : "#ef4444") : "#60A5FA"}
                            strokeWidth="4"
                            strokeLinecap="round"
                            fill="none"
                            className="animate-draw-line"
                            strokeDasharray="none"
                          />
                          
                          {/* String texture - secondary light blue line */}
                          <path
                            d={path}
                            stroke={isAnswersChecked ? (isCorrect ? "#059669" : "#dc2626") : "#93C5FD"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                            className="animate-draw-line"
                            style={{ animationDelay: '0.1s' }}
                            strokeDasharray="none"
                          />
                          
                          {/* Connection indicator on left column */}
                          <circle
                            cx={startX}
                            cy={startY}
                            r="4"
                            fill={isAnswersChecked ? (isCorrect ? "#10b981" : "#ef4444") : "#60A5FA"}
                            stroke="#ffffff"
                            strokeWidth="2"
                            className="animate-pulse"
                          />
                          
                          {/* Connection indicator on right column */}
                          <circle
                            cx={endX}
                            cy={endY}
                            r="4"
                            fill={isAnswersChecked ? (isCorrect ? "#10b981" : "#ef4444") : "#60A5FA"}
                            stroke="#ffffff"
                            strokeWidth="2"
                            className="animate-pulse"
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Right Column */}
                  <div className="w-1/3 space-y-2 relative z-20">
                    <h4 className="text-sm font-bold text-center text-gray-800 bg-gradient-to-r from-pink-100 to-purple-100 py-2 rounded-xl border-2 border-pink-200">
                      🎯 Drop Here
                    </h4>
                    {currentQuestion.rightItems.map((item, index) => (
                      <button
                        key={item.id}
                        id={`right-item-${item.id}`}
                        ref={el => rightItemRefs.current[item.id] = el}
                        onMouseUp={(e) => handleDragEnd(e, item, 'right')}
                        disabled={dragConnections.some(conn => conn.rightId === item.id)}
                        className={`
                          w-full p-4 rounded-xl border-2 transition-all duration-300 transform text-lg h-20 min-h-[5rem]
                          ${dragConnections.some(conn => conn.rightId === item.id)
                            ? isAnswersChecked
                              ? correctConnections.some(conn => conn.rightId === item.id)
                                ? 'bg-gradient-to-r from-green-200 to-green-300 border-green-500 border-4 shadow-lg'
                                : 'bg-gradient-to-r from-red-200 to-red-300 border-red-500 border-4 shadow-lg'
                              : 'bg-gradient-to-r from-blue-200 to-blue-300 border-blue-400 cursor-not-allowed opacity-90'
                            : dragging && dragging.side === 'left'
                            ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300 hover:scale-105 hover:shadow-lg cursor-crosshair border-dashed border-2'
                            : 'bg-gradient-to-r from-white to-pink-50 border-pink-200 hover:border-pink-400 hover:scale-105 hover:shadow-lg'
                          }
                          ${!dragConnections.some(conn => conn.rightId === item.id) ? 'hover:animate-bounce-gentle' : ''}
                          flex items-center justify-center text-center font-bold
                          focus:outline-none focus:ring-2 focus:ring-pink-300
                        `}
                      >
                        {item.type === 'emoji' ? (
                          <span className="text-2xl">{item.content}</span>
                        ) : (
                          <span className="text-lg text-gray-800 font-medium">{item.content}</span>
                        )}
                        {dragConnections.some(conn => conn.rightId === item.id) && (
                          <span className="ml-2 text-lg animate-bounce-gentle">
                            {isAnswersChecked 
                              ? correctConnections.some(conn => conn.rightId === item.id) 
                                ? '✅' 
                                : '❌'
                              : '🔗'
                            }
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Area */}
                {showMatchingFeedback && (
                  <div className={`
                    mt-6 p-4 rounded-2xl border-3 text-center text-xl font-bold animate-fade-in
                    ${matchingFeedbackType === 'correct' 
                      ? 'bg-gradient-to-r from-green-100 to-blue-100 border-green-400 text-green-800' 
                      : 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-400 text-orange-800'
                    }
                  `}>
                    {matchingFeedbackMessage}
                  </div>
                )}

                {/* Progress Indicator */}
                

                {/* Action Buttons */}
                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={handleCheckAnswers}
                    disabled={!canSubmit || isAnswersChecked}
                    className={`
                      flex-1 py-4 px-6 rounded-2xl border-3 font-bold text-lg transition-all duration-300 transform
                      ${canSubmit && !isAnswersChecked
                        ? 'bg-gradient-to-r from-green-400 to-green-600 text-white border-green-500 hover:scale-105 hover:shadow-xl cursor-pointer animate-pulse-gentle'
                        : 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed opacity-60'
                      }
                      focus:outline-none focus:ring-4 focus:ring-green-300
                    `}
                  >
                    <span className="text-2xl mr-2">✅</span>
                    {isAnswersChecked ? `Score: ${correctConnections.length}/7` : 'Check Answers'}
                  </button>
                  
                  <button
                    onClick={handleResetConnections}
                    disabled={dragConnections.length === 0}
                    className={`
                      flex-1 py-4 px-6 rounded-2xl border-3 font-bold text-lg transition-all duration-300 transform
                      ${dragConnections.length > 0
                        ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-orange-500 hover:scale-105 hover:shadow-xl cursor-pointer'
                        : 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed opacity-60'
                      }
                      focus:outline-none focus:ring-4 focus:ring-orange-300
                    `}
                  >
                    <span className="text-2xl mr-2">🔄</span>
                    Reset
                  </button>
                </div>

                {/* Back to Activities Button */}
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => navigate(-1)}
                    className="
                      py-3 px-8 rounded-2xl border-3 font-bold text-lg transition-all duration-300 transform
                      bg-gradient-to-r from-purple-400 to-blue-500 text-white border-purple-500 
                      hover:scale-105 hover:shadow-xl cursor-pointer hover:from-purple-500 hover:to-blue-600
                      focus:outline-none focus:ring-4 focus:ring-purple-300
                    "
                  >
                    <span className="text-2xl mr-2">⬅️</span>
                    Back to Activities
                  </button>
                </div>

                {/* Completion Message */}
                {(isMatchingComplete || (isAnswersChecked && correctConnections.length === 10)) && (
                  <div className="mt-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 border-3 border-green-400 text-center animate-fade-in">
                    <div className="text-6xl mb-4 animate-bounce-gentle">🎉</div>
                    <h3 className="text-2xl font-bold text-green-800 mb-2">Excellent Work!</h3>
                    <p className="text-lg text-green-700">
                      You matched all pairs perfectly! Great job! 🌟
                    </p>
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

      {/* Academic Puzzle Game UI */}
      {isPuzzleGame && currentPuzzleData && (
        <div className="space-y-6">
          {/* Puzzle Header */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 border-3 border-indigo-200 text-center relative overflow-hidden">
            <div className="absolute -top-2 -right-2 text-4xl animate-bounce-gentle">🧩</div>
            <div className="absolute -bottom-1 -left-1 text-3xl animate-float">⭐</div>
            <h3 className="text-2xl font-bold text-indigo-800 mb-2 flex items-center justify-center space-x-3">
              <span className="text-3xl animate-pulse-gentle">🎯</span>
              <span>Academic Puzzle</span>
            </h3>
            
            {/* Hint Display */}
            {showPuzzleHint && (
              <div className="mt-3 bg-yellow-100 border-2 border-yellow-300 rounded-xl p-3 animate-fade-in">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">💡</span>
                  <span className="text-lg font-medium text-yellow-800">Hint: {currentPuzzleData.hint}</span>
                </div>
              </div>
            )}
          </div>

          {/* Puzzle Content Area */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border-4 border-indigo-200 relative">
            
            {/* Math Puzzle */}
            {currentPuzzleData.puzzleType === 'math' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <p className="text-2xl font-bold text-indigo-700">{currentPuzzleData.instruction}</p>
                </div>
                
                {/* Math Problem Display */}
                {currentPuzzleData.objects ? (
                  <div className="text-center">
                    <div className="text-6xl mb-4 space-x-2">
                      {currentPuzzleData.objects.map((obj, index) => (
                        <span key={index} className="inline-block animate-bounce-gentle" style={{animationDelay: `${index * 0.1}s`}}>
                          {obj}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : currentPuzzleData.equation ? (
                  <div className="text-center text-4xl font-bold text-indigo-800 mb-6">
                    {currentPuzzleData.equation.first} {currentPuzzleData.equation.operator1} {currentPuzzleData.equation.second} = ?
                  </div>
                ) : null}
                
                {/* Answer Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentPuzzleData.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handlePuzzleAnswer(option)}
                      className="bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 border-3 border-blue-300 hover:border-blue-500 rounded-2xl p-6 text-3xl font-bold text-indigo-800 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Spelling Puzzle */}
            {currentPuzzleData.puzzleType === 'spelling' && (
              <div className="space-y-6">
                {/* Target Word Display */}
                <div className="text-center">
                  <div className="flex justify-center space-x-3 mb-6">
                    {currentPuzzleData.targetWord.split('').map((_, index) => (
                      <div
                        key={index}
                        className="w-16 h-16 bg-yellow-100 border-3 border-yellow-400 rounded-xl flex items-center justify-center text-2xl font-bold text-yellow-800"
                      >
                        {selectedPuzzleAnswers[index] || '?'}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Letter Options */}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {currentPuzzleData.letters.map((letter, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (selectedPuzzleAnswers.length < currentPuzzleData.targetWord.length) {
                          const newAnswers = [...selectedPuzzleAnswers, letter];
                          setSelectedPuzzleAnswers(newAnswers);
                        }
                      }}
                      disabled={selectedPuzzleAnswers.includes(letter)}
                      className="bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 border-3 border-purple-300 hover:border-purple-500 rounded-xl p-4 text-2xl font-bold text-purple-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-purple-300"
                    >
                      {letter}
                    </button>
                  ))}
                </div>
                
                {/* Check Answer Button */}
                <div className="text-center">
                  <button
                    onClick={() => {
                      const userAnswer = selectedPuzzleAnswers.join('');
                      handlePuzzleAnswer(userAnswer);
                    }}
                    disabled={selectedPuzzleAnswers.length !== currentPuzzleData.targetWord.length}
                    className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-xl mr-2">✓</span>
                    Check Answer
                  </button>
                </div>
              </div>
            )}

            {/* Matching Puzzle */}
            {currentPuzzleData.puzzleType === 'matching' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <p className="text-2xl font-bold text-indigo-700">{currentPuzzleData.instruction}</p>
                </div>
                
                {/* Word to Match */}
                <div className="text-center mb-6">
                  <div className="inline-block bg-blue-100 border-4 border-blue-400 rounded-xl p-4 text-2xl font-bold text-blue-800">
                    {currentPuzzleData.word}
                  </div>
                </div>
                
                {/* Objects to Match */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentPuzzleData.objects.map((obj, index) => (
                    <button
                      key={obj.id}
                      onClick={() => handlePuzzleAnswer(obj.id)}
                      className="bg-gradient-to-r from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 border-3 border-yellow-300 hover:border-yellow-500 rounded-xl p-6 text-xl font-semibold text-gray-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300"
                    >
                      {obj.content}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sorting Puzzle */}
            {currentPuzzleData.puzzleType === 'sorting' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <p className="text-2xl font-bold text-purple-700">{currentPuzzleData.instruction}</p>
                </div>
                
                {/* Fruit Basket (Drop Zone) */}
                <div className="text-center mb-6">
                  <div className="inline-block bg-green-100 border-4 border-green-400 rounded-xl p-6 min-w-[200px] min-h-[100px]">
                    <div className="text-2xl font-bold text-green-800 mb-2">🧺 FRUIT BASKET</div>
                    <div className="text-sm text-green-600">
                      {selectedPuzzleAnswers.length > 0 ? `${selectedPuzzleAnswers.length} item(s) selected` : 'Drag fruits here'}
                    </div>
                  </div>
                </div>
                
                {/* Items to Sort */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {currentPuzzleData.items.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (selectedPuzzleAnswers.includes(item.id)) {
                          setSelectedPuzzleAnswers(selectedPuzzleAnswers.filter(id => id !== item.id));
                        } else {
                          setSelectedPuzzleAnswers([...selectedPuzzleAnswers, item.id]);
                        }
                      }}
                      className={`border-3 rounded-xl p-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 ${
                        selectedPuzzleAnswers.includes(item.id)
                          ? 'bg-green-200 border-green-500 text-green-800 ring-green-300'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 ring-gray-300'
                      }`}
                    >
                      {item.content}
                    </button>
                  ))}
                </div>
                
                {/* Check Answer Button */}
                <div className="text-center">
                  <button
                    onClick={() => {
                      const isCorrect = currentPuzzleData.correctItems.every(id => selectedPuzzleAnswers.includes(id)) &&
                                      selectedPuzzleAnswers.every(id => currentPuzzleData.correctItems.includes(id));
                      handlePuzzleAnswer(selectedPuzzleAnswers, isCorrect);
                    }}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300"
                  >
                    <span className="text-xl mr-2">✓</span>
                    Check Answer
                  </button>
                </div>
              </div>
            )}

            {/* Logic Puzzle */}
            {currentPuzzleData.puzzleType === 'logic' && (
              <div className="space-y-6">
                {/* Simple Multiple Choice Logic */}
                {currentPuzzleData.options && !currentPuzzleData.sequence && !currentPuzzleData.shapes && (
                  <div className="text-center">
                    <div className="mb-6">
                      <p className="text-2xl font-bold text-green-700">{currentPuzzleData.instruction}</p>
                      
                      {/* Display objects for counting */}
                      {currentPuzzleData.objects && (
                        <div className="flex justify-center space-x-2 my-4">
                          {currentPuzzleData.objects.map((obj, index) => (
                            <span key={index} className="text-4xl">{obj}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Answer Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {currentPuzzleData.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handlePuzzleAnswer(option)}
                          className="bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 border-3 border-green-300 hover:border-green-500 rounded-2xl p-6 text-6xl font-semibold transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Pattern Display */}
                {currentPuzzleData.sequence && (
                  <div className="text-center">
                    <div className="flex justify-center items-center space-x-4 mb-6">
                      {currentPuzzleData.sequence.map((item, index) => (
                        <div key={index} className="text-6xl animate-pulse-gentle" style={{animationDelay: `${index * 0.2}s`}}>
                          {item}
                        </div>
                      ))}
                    </div>
                    
                    {/* Answer Options */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {currentPuzzleData.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handlePuzzleAnswer(option)}
                          className="bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 border-3 border-green-300 hover:border-green-500 rounded-2xl p-6 text-4xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Shape Sorting */}
                {currentPuzzleData.shapes && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {currentPuzzleData.categories.map((category, index) => (
                        <div key={category} className="bg-gray-100 border-3 border-gray-300 rounded-xl p-4 min-h-[100px] text-center">
                          <div className="font-bold text-lg text-gray-700 mb-2 capitalize">{category}</div>
                          {/* Drop zone for shapes */}
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-lg text-gray-600">Drag shapes to the correct category!</div>
                  </div>
                )}
              </div>
            )}

            {/* Sequence Puzzle */}
            {currentPuzzleData.puzzleType === 'sequence' && (
              <div className="space-y-6">
                {/* Pattern Completion Type */}
                {currentPuzzleData.sequence && currentPuzzleData.options && (
                  <div className="text-center">
                    <div className="mb-6">
                      <p className="text-2xl font-bold text-blue-700">{currentPuzzleData.instruction}</p>
                    </div>
                    
                    {/* Pattern Display */}
                    <div className="flex justify-center items-center space-x-4 mb-6">
                      {currentPuzzleData.sequence.map((item, index) => (
                        <div key={index} className="text-6xl animate-pulse-gentle" style={{animationDelay: `${index * 0.2}s`}}>
                          {item}
                        </div>
                      ))}
                    </div>
                    
                    {/* Answer Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {currentPuzzleData.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handlePuzzleAnswer(option)}
                          className="bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 border-3 border-blue-300 hover:border-blue-500 rounded-2xl p-6 text-xl font-semibold transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Drag and Drop Type */}
                {currentPuzzleData.items && !currentPuzzleData.options && (
                  <div>
                    {/* Sequence Slots */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {Array.from({ length: currentPuzzleData.items.length }, (_, index) => (
                        <div
                          key={index}
                          className="bg-yellow-100 border-3 border-yellow-400 rounded-xl p-4 h-24 flex items-center justify-center text-center relative"
                          onDrop={(e) => {
                            e.preventDefault();
                            const item = JSON.parse(e.dataTransfer.getData('text/plain'));
                            handlePuzzleDrag(item, index);
                          }}
                          onDragOver={(e) => e.preventDefault()}
                        >
                          <div className="absolute -top-2 -left-2 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="text-lg font-medium">
                            {draggedItems.find(item => item.position === index)?.content || 'Drop here'}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Available Items */}
                    <div className="grid grid-cols-2 gap-4">
                      {currentPuzzleData.items.map((item, index) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', JSON.stringify(item))}
                          className={`bg-gradient-to-r from-cyan-100 to-blue-100 border-3 border-cyan-300 rounded-xl p-4 text-center cursor-move transition-all duration-300 transform hover:scale-105 ${
                            draggedItems.some(d => d.id === item.id) ? 'opacity-50' : 'hover:shadow-lg'
                          }`}
                        >
                          <div className="text-lg font-medium text-cyan-800">{item.content}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Check Button */}
                    <div className="text-center">
                      <button
                        onClick={checkPuzzleCompletion}
                        disabled={draggedItems.length !== currentPuzzleData.items.length}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-green-300"
                      >
                        <span className="text-2xl mr-2">✅</span>
                        Check Order
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          

          {/* Navigation Buttons */}
          <div className="flex justify-center space-x-4">
            {/* Next Question Button - only show when puzzle is completed */}
            {isPuzzleComplete && (
              <button
                onClick={() => {
                  const totalQuestions = questionsData[category]?.[difficulty]?.["Academic Puzzles"]?.length || 1;
                  if (currentQuestionIndex < totalQuestions - 1) {
                    setCurrentQuestionIndex(prev => prev + 1);
                    setShowPuzzleFeedback(false);
                    setIsPuzzleComplete(false);
                    initializePuzzleGame();
                  } else {
                    setShowModal(true);
                  }
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                <span className="text-2xl mr-2">
                  {currentQuestionIndex < (questionsData[category]?.[difficulty]?.["Academic Puzzles"]?.length || 1) - 1 ? "➡️" : "🎯"}
                </span>
                {currentQuestionIndex < (questionsData[category]?.[difficulty]?.["Academic Puzzles"]?.length || 1) - 1 ? "Next Puzzle" : "Finish"}
                <span className="text-xl ml-2 animate-float">✨</span>
              </button>
            )}
            
            {/* Hint Button */}
            {!showPuzzleHint && !isPuzzleComplete && (
              <button
                onClick={() => setShowPuzzleHint(true)}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300"
              >
                <span className="text-xl mr-2">💡</span>
                Get Hint
              </button>
            )}
            
            {/* Reset Button */}
            <button
              onClick={resetPuzzle}
              className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300"
            >
              <span className="text-xl mr-2">🔄</span>
              Reset Puzzle
            </button>
          </div>
          
          {/* Correct Overlay for Puzzle Game */}
          {showCorrect && (
            <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 rounded-2xl">
              <div className="text-[8rem]">😄</div>
              <div className="text-green-500 text-4xl font-bold mt-2">CORRECT!</div>
            </div>
          )}

          {/* Wrong Overlay for Puzzle Game */}
          {showWrong && (
            <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 rounded-2xl">
              <div className="text-[8rem]">😞</div>
              <div className="text-red-500 text-4xl font-bold mt-2">WRONG!</div>
            </div>
          )}
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
        
        /* Connection line drawing animation */
        @keyframes draw-line {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }
        
        .animate-draw-line {
          animation: draw-line 0.8s ease-in-out forwards;
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

      {/* Background Music for Medium Identification */}
      <audio ref={bgMusicRef} src={jungleBgMusic} />
    </div>
  );
};

export default Flashcards;
