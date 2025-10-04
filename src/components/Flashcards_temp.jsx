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

  // Household Chores Helper Game specific state
  const [currentChore, setCurrentChore] = useState(null);
  const [currentChoreStep, setCurrentChoreStep] = useState(1);
  const [choreScore, setChoreScore] = useState(0);
  const [isChoreGameActive, setIsChoreGameActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showChoreAnimation, setShowChoreAnimation] = useState(false);
  const [choreAnimationType, setChoreAnimationType] = useState(''); // 'success', 'completion'
  const [showChoreThought, setShowChoreThought] = useState(false);
  const [choreCharacterThought, setChoreCharacterThought] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropZones, setDropZones] = useState({});
  const [choreProgress, setChoreProgress] = useState(0);
  const [showStepFeedback, setShowStepFeedback] = useState(false);
  const [stepFeedbackMessage, setStepFeedbackMessage] = useState('');
  const [showChoreCompletion, setShowChoreCompletion] = useState(false);
  const [earnedChoreBadge, setEarnedChoreBadge] = useState(null);
  
  // Additional household chores state variables
  const [currentChoreId, setCurrentChoreId] = useState('');
  const [completedChoreSteps, setCompletedChoreSteps] = useState([]);
  const [choreToolsAvailable, setChoreToolsAvailable] = useState([]);
  const [choreEnvironmentItems, setChoreEnvironmentItems] = useState([]);
  const [draggedChoreItems, setDraggedChoreItems] = useState([]);
  const [droppedChoreItems, setDroppedChoreItems] = useState([]);
  const [isChoreComplete, setIsChoreComplete] = useState(false);
  const [showChoreFeedback, setShowChoreFeedback] = useState(false);
  const [choreFeedbackType, setChoreFeedbackType] = useState('');
  const [choreFeedbackMessage, setChoreFeedbackMessage] = useState('');
  const [characterThought, setCharacterThought] = useState('');
  const [showCharacterSpeech, setShowCharacterSpeech] = useState(false);
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
                                                                //  EASY - LEVEL OF DIFFICULTY
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
              { id: 1, content: "?? Sun", type: "text" },
              
              { id: 3, content: "??Dog", type: "text" },
              { id: 4, content: "?? Cat", type: "text" },
              { id: 5, content: "?? Car", type: "text" },
              { id: 6, content: "?? Chair", type: "text" },
              { id: 7, content: "?? Book", type: "text" },
              
              { id: 9, content: "?? House", type: "text" },
              
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
            options: ["??", "??", "??"],
            correctAnswer: "??",
            hint: "Look for the red colored object!"
          },
          {
            puzzleType: "logic",
            questionText: "Circle puzzle",
            instruction: "Find the CIRCLE.",
            options: ["??", "??", "?"],
            correctAnswer: "?",
            hint: "A circle is round with no corners!"
          },
          {
            puzzleType: "math",
            questionText: "Apple Counting Puzzle",
            instruction: "Count the Apples. How many are there?",
            objects: ["??", "??", "??"],
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
            options: ["??", "??", "??"],
            correctAnswer: "??",
            hint: "Cats say meow!"
          }
        ]
      },


                                            // MEDIUM - LEVEL OF DIFFICULTY
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
              { id: 1, content: "6 x 4 = ?", type: "text" },
              { id: 2, content: "13 + 9 = ?", type: "text" },
              { id: 3, content: "?? Clock", type: "text" },
              { id: 4, content: "3 x 7 = ?", type: "text" },
             
              { id: 6, content: "10,15,20,__,30", type: "text" },
              { id: 7, content: "??? Bed", type: "text" },
              { id: 8, content: "?? Pencil", type: "text" },
              // { id: 9, content: "?? Fire", type: "text" },
              // { id: 10, content: "?? Music", type: "text" }
            ],
            rightItems: [
              { id: "a", content: "25", type: "text", matchId: 6 },
              { id: "b", content: "Time", type: "text", matchId: 3 },
              { id: "c", content: "24", type: "text", matchId: 1 },
              { id: "d", content: "Student", type: "text", matchId: 8 },
              { id: "e", content: "22", type: "text", matchId: 2 },
              // { id: "f", content: "Hot", type: "text", matchId: 9 },
              { id: "g", content: "Sleep", type: "text", matchId: 7 },
              // { id: "h", content: "Dance", type: "text", matchId: 10 },
              { id: "i", content: "21", type: "text", matchId: 4 },
             
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
            sequence: ["??", "??", "?", "?"],
            options: ["??", "??", "?"],
            correctAnswer: "??",
            hint: "Look at the pattern - it repeats!"
          },
          {
            puzzleType: "sorting",
            questionText: "Sorting Puzzle",
            instruction: "Choose the fruit into the FRUIT basket.",
            items: [{id: 1, content: "?? Apple", category: "fruit"}, {id: 2, content: "?? Car", category: "vehicle"}, {id: 3, content: "?? Banana", category: "fruit"}],
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


                                            // HARD - LEVEL OF DIFFICULTY  
      Hard: {
        "Matching Type": [
          {
            questionText: "Associations & Cause-Effect - Match the pairs!",
            gameType: "matching",
            leftItems: [
              // { id: 1, content: "?? Fire", type: "text" },
              { id: 2, content: "9 x 8 = ?", type: "text" },
              { id: 3, content: "Half of 100", type: "text" },
              { id: 4, content: "??? Chef", type: "text" },
              { id: 5, content: "?? Plant", type: "text" },
              { id: 6, content: "Doctor", type: "text" },
              { id: 7, content: "????? Student", type: "text" },
              // { id: 8, content: "?? Night", type: "text" },
              { id: 9, content: "36 divided by 6", type: "text" },
              // { id: 10, content: "?? Water", type: "text" }
            ],
            rightItems: [
              { id: "a", content: "72", type: "text", matchId: 2 },
              { id: "b", content: "?? School", type: "text", matchId: 7 },
              // { id: "c", content: "Warmth", type: "text", matchId: 1 },
              { id: "d", content: "?? Grow", type: "text", matchId: 5 },
              { id: "e", content: "50", type: "text", matchId: 3 },
              // { id: "f", content: "?? Sleep", type: "text", matchId: 8 },
              { id: "g", content: "??", type: "text", matchId: 6 },
              { id: "h", content: "??", type: "text", matchId: 4 },
              // { id: "i", content: "?? Drink", type: "text", matchId: 10 },
              { id: "j", content: "6", type: "text", matchId: 9 }
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
            options: ["?? Water", "?? Dog", "?? Apple"],
            correctAnswer: "?? Water",
            hint: "Where do fish live?"
          },
          {
            puzzleType: "sequence",
            questionText: "Pattern Puzzle",
            instruction: "Complete the pattern:",
            sequence: ["??", "??", "??", "??", "...?"],
            options: ["??", "??", "??"],
            correctAnswer: "??",
            hint: "Look at the alternating pattern!"
          },
          {
            puzzleType: "logic",
            questionText: "Real-life Puzzle",
            instruction: "The traffic light is ??Red. What should you do?",
            options: ["Go", "Stop", "Jump"],
            correctAnswer: "Stop",
            hint: "Red means stop for safety!"
          }
        ]
        
      }
    },
    "Social / Daily Life Skill": {
      "Cashier Game": [
          {
            questionText: "I want a burger and fries, please!",
            orderItems: ["Burger", "Fries"],
            menuOptions: [
              { name: "Burger", image: "??", price: "$3.99" },
              { name: "Fries", image: "??", price: "$2.49" },
              { name: "Pizza", image: "??", price: "$4.99" },
              { name: "Hot Dog", image: "??", price: "$2.99" },
              { name: "Drink", image: "??", price: "$1.99" },
              { name: "Ice Cream", image: "??", price: "$2.99" }
            ],
            correctAnswer: ["Burger", "Fries"],
            gameType: "cashier"
          },
          {
            questionText: "Can I have a pizza slice and a drink?",
            orderItems: ["Pizza", "Drink"],
            menuOptions: [
              { name: "Burger", image: "??", price: "$3.99" },
              { name: "Fries", image: "??", price: "$2.49" },
              { name: "Pizza", image: "??", price: "$4.99" },
              { name: "Hot Dog", image: "??", price: "$2.99" },
              { name: "Drink", image: "??", price: "$1.99" },
              { name: "Ice Cream", image: "??", price: "$2.99" }
            ],
            correctAnswer: ["Pizza", "Drink"],
            gameType: "cashier"
          },
          {
            questionText: "I'll take a hot dog, please!",
            orderItems: ["Hot Dog"],
            menuOptions: [
              { name: "Burger", image: "??", price: "$3.99" },
              { name: "Fries", image: "??", price: "$2.49" },
              { name: "Pizza", image: "??", price: "$4.99" },
              { name: "Hot Dog", image: "??", price: "$2.99" },
              { name: "Drink", image: "??", price: "$1.99" },
              { name: "Ice Cream", image: "??", price: "$2.99" }
            ],
            correctAnswer: ["Hot Dog"],
            gameType: "cashier"
          },
          {
            questionText: "I want fries and ice cream, please!",
            orderItems: ["Fries", "Ice Cream"],
            menuOptions: [
              { name: "Burger", image: "??", price: "$3.99" },
              { name: "Fries", image: "??", price: "$2.49" },
              { name: "Pizza", image: "??", price: "$4.99" },
              { name: "Hot Dog", image: "??", price: "$2.99" },
              { name: "Drink", image: "??", price: "$1.99" },
              { name: "Ice Cream", image: "??", price: "$2.99" }
            ],
            correctAnswer: ["Fries", "Ice Cream"],
            gameType: "cashier"
          },
          {
            questionText: "Can I get a burger, fries, and a drink?",
            orderItems: ["Burger", "Fries", "Drink"],
            menuOptions: [
              { name: "Burger", image: "??", price: "$3.99" },
              { name: "Fries", image: "??", price: "$2.49" },
              { name: "Pizza", image: "??", price: "$4.99" },
              { name: "Hot Dog", image: "??", price: "$2.99" },
              { name: "Drink", image: "??", price: "$1.99" },
              { name: "Ice Cream", image: "??", price: "$2.99" }
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
            background: "?? Home Kitchen",
            character: "?????",
            characterType: "Parent",
            studentThought: "I should greet my parent nicely!",
            otherCharacterSpeech: "Good morning, sweetheart! Did you sleep well?",
            choices: [
              {
                text: "Good morning, Mom!",
                emoji: "??",
                correct: true,
                feedback: "Perfect! Starting the day with a nice greeting makes everyone happy!"
              },
              {
                text: "Good night!",
                emoji: "??", 
                correct: false,
                feedback: "That's for bedtime! Try a morning greeting instead."
              },
              {
                text: "Goodbye!",
                emoji: "??",
                correct: false,
                feedback: "That's for when you're leaving. Try a greeting for when you wake up!"
              },
              {
                text: "See you later!",
                emoji: "??",
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
            background: "?? School Classroom",
            character: "?????",
            characterType: "Teacher",
            studentThought: "I should be polite to my teacher!",
            otherCharacterSpeech: "Hello! Welcome to class today!",
            choices: [
              {
                text: "Good morning, Teacher!",
                emoji: "??",
                correct: true,
                feedback: "Excellent! Polite greetings show respect to your teacher!"
              },
              {
                text: "Hi Mom!",
                emoji: "??",
                correct: false,
                feedback: "That's not your mom - it's your teacher! Try again."
              },
              {
                text: "Bye!",
                emoji: "??",
                correct: false,
                feedback: "That's for leaving, not arriving! What would you say when you first get to school?"
              },
              {
                text: "Good night!",
                emoji: "??",
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
            background: "?? School Playground",
            character: "??",
            characterType: "Friend",
            studentThought: "My friend looks like they're having fun!",
            otherCharacterSpeech: "Hey! Want to play with me?",
            choices: [
              {
                text: "Hi! That looks fun!",
                emoji: "??",
                correct: true,
                feedback: "Great! Friendly greetings help make strong friendships!"
              },
              {
                text: "Good morning!",
                emoji: "??",
                correct: false,
                feedback: "It's recess time, not morning! Try a more casual greeting."
              },
              {
                text: "Goodbye!",
                emoji: "??",
                correct: false,
                feedback: "That's for leaving, but you just arrived! Try saying hello instead."
              },
              {
                text: "Good night!",
                emoji: "??",
                correct: false,
                feedback: "That's for bedtime! What would you say to a friend during playtime?"
              }
            ]
          },
          {
            id: 4,
            title: "Saying Goodbye After School",
            situation: "",
            context: "afternoon",
            background: "?? School Classroom",
            character: "?????",
            characterType: "Teacher",
            studentThought: "The day is ending, I should say goodbye nicely!",
            otherCharacterSpeech: "Have a wonderful day everyone! See you tomorrow!",
            choices: [
              {
                text: "Goodbye Teacher! See you tomorrow!",
                emoji: "??",
                correct: true,
                feedback: "Wonderful! Saying goodbye nicely ends the day on a positive note!"
              },
              {
                text: "Good morning!",
                emoji: "??",
                correct: false,
                feedback: "The day is ending, not starting! Try a goodbye greeting."
              },
              {
                text: "Hi!",
                emoji: "??",
                correct: false,
                feedback: "That's for when you arrive! What do you say when you're leaving?"
              },
              {
                text: "Thank you for breakfast!",
                emoji: "??",
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
            background: "?? Neighborhood Garden",
            character: "??",
            characterType: "Neighbor",
            studentThought: "I should be friendly to my neighbor!",
            otherCharacterSpeech: "Good evening! How was your day?",
            choices: [
              {
                text: "Good evening! It was great, thank you!",
                emoji: "?",
                correct: true,
                feedback: "Perfect! Evening greetings show you're polite and friendly!"
              },
              {
                text: "Good morning!",
                emoji: "??",
                correct: false,
                feedback: "It's evening time, not morning! Look at the sky for a clue."
              },
              {
                text: "Good night!",
                emoji: "?",
                correct: false,
                feedback: "That's for when you're going to sleep! Try an evening greeting."
              },
              {
                text: "Hello teacher!",
                emoji: "?????",
                correct: false,
                feedback: "That's not your teacher - it's your neighbor! Try again."
              }
            ]
          }
        ],
        "Hygiene Hero": [
          {
            scenario: "dirty_hands",
            questionText: "?? Oh no! Your hands are dirty after playing!",
            scenarioImage: "??",
            backgroundImage: "??",
            characterEmoji: "??",
            answerChoices: ["Brush my teeth", "Take a shower", "Wash my hands", "Cut my hair", "Wipe my nose", "Use tissue"],
            correctAnswer: "Wash my hands",
            gameType: "hygiene",
            successAnimation: "???",
            successMessage: "Great job! Clean hands are healthy hands!"
          },
          {
            scenario: "messy_hair",
            questionText: "?? Your hair is messy!",
            scenarioImage: "?????",
            backgroundImage: "??",
            characterEmoji: "?????",
            answerChoices: ["Cut my hair", "Wash my hands", "Take a shower", "Brush my teeth", "Wipe my nose", "Clean my ears", "Use tissue"],
            correctAnswer: "Cut my hair",
            gameType: "hygiene",
            successAnimation: "???",
            successMessage: "Perfect! You look great now!"
          },
          {
            scenario: "runny_nose",
            questionText: "?? Achoo! Your nose is runnings!",
            scenarioImage: "??",
            backgroundImage: "??",
            characterEmoji: "??",
            answerChoices: ["Wash my hands", "Wipe my nose", "Take a shower", "Cut my hair", "Brush my teeth", "Use tissue"],
            correctAnswer: "Wipe my nose",
            gameType: "hygiene",
            successAnimation: "???",
            successMessage: "Good choice! Keep those germs away!"
          },
          {
            scenario: "dirty_teeth",
            questionText: "?? Time to take care of your teeth!",
            scenarioImage: "??",
            backgroundImage: "??",
            characterEmoji: "??",
            answerChoices: ["Wash my hands", "Take a shower", "Cut my hair", "Brush my teeth", "Wipe my nose", "Clean my ears", "Use tissue"],
            correctAnswer: "Brush my teeth",
            gameType: "hygiene",
            successAnimation: "???",
            successMessage: "Fantastic! Healthy teeth make you smile!"
          },
          {
            scenario: "dirty_ears",
            questionText: "?? Your ears need some gentle cleaning!",
            scenarioImage: "??",
            backgroundImage: "??",
            characterEmoji: "??",
            answerChoices: [ "Wash my hands", "Take a shower", "Cut my hair", "Wipe my nose", "Clean my ears", "Brush my teeth", "Use tissue"],
            correctAnswer: "Clean my ears",
            gameType: "hygiene",
            successAnimation: "???",
            successMessage: "Excellent! Now you can hear everything clearly!"
          },
          {
            scenario: "sweaty_body",
            questionText: "?? After playing, you're all sweaty!",
            scenarioImage: "??",
            backgroundImage: "??",
            characterEmoji: "??",
            answerChoices: ["Wash my hands", "Take a shower", "Brush my teeth", "Cut my hair", "Wipe my nose", "Clean my ears", "Use tissue"],
            correctAnswer: "Take a shower",
            gameType: "hygiene",
            successAnimation: "???",
            successMessage: "Amazing! You're fresh and clean now!"
          },
          {
            scenario: "sticky_fingers",
            questionText: "?? Your fingers are sticky after eating!",
            scenarioImage: "??",
            backgroundImage: "???",
            characterEmoji: "??",
            answerChoices: ["Brush my teeth", "Take a shower", "Cut my hair", "Wipe my nose", "Wash my hands", "Clean my ears", "Use tissue"],
            correctAnswer: "Wash my hands",
            gameType: "hygiene",
            successAnimation: "???",
            successMessage: "Perfect! No more sticky fingers!"
          },
          {
            scenario: "after_sneezing",
            questionText: "?? Achoo! You just sneezed!",
            scenarioImage: "??",
            backgroundImage: "??",
            characterEmoji: "??",
            answerChoices: ["Use tissue", "Wash my hands", "Take a shower", "Cut my hair", "Wipe my nose", "Clean my ears", "Brush my teeth"],
            correctAnswer: "Use tissue",
            gameType: "hygiene",
            successAnimation: "???",
            successMessage: "Smart! Covering sneezes keeps everyone healthy!"
          }
        ],



        "Safe Street Crossing": [
          {
            scenario: "green_walk_signal",
            questionText: "?? Look! What should you do?",
            scenarioImage: "?????",
            backgroundImage: "???",
            characterEmoji: "??",
            trafficLight: "??",
            lightStatus: "walk",
            safetyLevel: "safe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "CROSS",
            gameType: "street",
            successAnimation: "???????",
            successMessage: "Great! Green means GO!",
            feedbackMessage: "Perfect choice! The walk signal is green!"
          },
          {
            scenario: "red_traffic_light",
            questionText: "?? Stop and look! What should you do?",
            scenarioImage: "??",
            backgroundImage: "???",
            characterEmoji: "??",
            trafficLight: "??",
            lightStatus: "stop",
            safetyLevel: "unsafe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "WAIT",
            gameType: "street",
            successAnimation: "??",
            successMessage: "Smart waiting! Red means STOP!",
            feedbackMessage: "Excellent! Always wait for red lights!"
          },
          {
            scenario: "approaching_car",
            questionText: "?? A car is coming! What should you do?",
            scenarioImage: "????",
            backgroundImage: "???",
            characterEmoji: "??",
            trafficLight: "??",
            lightStatus: "caution",
            safetyLevel: "unsafe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "WAIT",
            gameType: "street",
            successAnimation: "????",
            successMessage: "Very safe choice! Let cars pass first!",
            feedbackMessage: "Great thinking! Always let cars pass safely!"
          },
          {
            scenario: "clear_street",
            questionText: "?? The street is empty and clear! What should you do?",
            scenarioImage: "???",
            backgroundImage: "???",
            characterEmoji: "??",
            trafficLight: "??",
            lightStatus: "clear",
            safetyLevel: "safe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "CROSS",
            gameType: "street",
            successAnimation: "??????",
            successMessage: "Perfect! Safe to cross now!",
            feedbackMessage: "Wonderful! You checked and it's safe!"
          },
          {
            scenario: "yellow_light_warning",
            questionText: "?? Yellow light means be careful! What should you do?",
            scenarioImage: "??",
            backgroundImage: "???",
            characterEmoji: "??",
            trafficLight: "??",
            lightStatus: "caution",
            safetyLevel: "unsafe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "WAIT",
            gameType: "street",
            successAnimation: "???",
            successMessage: "Good choice! Yellow means be careful!",
            feedbackMessage: "Smart! Yellow means slow down and wait!"
          },
          {
            scenario: "busy_intersection",
            questionText: "?? Lots of cars and people! What should you do?",
            scenarioImage: "?????????",
            backgroundImage: "???",
            characterEmoji: "??",
            trafficLight: "??",
            lightStatus: "busy",
            safetyLevel: "unsafe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "WAIT",
            gameType: "street",
            successAnimation: "???",
            successMessage: "Wise decision! Wait for a safe moment!",
            feedbackMessage: "Excellent patience! Busy times need extra care!"
          },
          {
            scenario: "crosswalk_signal",
            questionText: "????? The crosswalk shows a walking person! What should you do?",
            scenarioImage: "?????",
            backgroundImage: "???",
            characterEmoji: "??",
            trafficLight: "??",
            lightStatus: "walk",
            safetyLevel: "safe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "CROSS",
            gameType: "street",
            successAnimation: "???????",
            successMessage: "Perfect timing! Cross safely now!",
            feedbackMessage: "Great job reading the crosswalk signal!"
          },
          {
            scenario: "emergency_vehicle",
            questionText: "?? An ambulance is coming with sirens! What should you do?",
            scenarioImage: "????",
            backgroundImage: "???",
            characterEmoji: "??",
            trafficLight: "??",
            lightStatus: "emergency",
            safetyLevel: "unsafe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "WAIT",
            gameType: "street",
            successAnimation: "???",
            successMessage: "Hero move! Let emergency vehicles go first!",
            feedbackMessage: "Amazing! Emergency vehicles always have the right of way!"
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
                  { id: 1, name: "Burger", image: "??", price: 70, category: "food", affordable: true },
                  { id: 2, name: "Car", image: "??", price: 450000, category: "vehicle", affordable: false },
                  { id: 3, name: "Laptop", image: "??", price: 25000, category: "electronics", affordable: false },
                  { id: 4, name: "Iced Coffee", image: "???", price: 120, category: "drink", affordable: true }
                ]
              },
              {
                roundId: 2,
                budget: 2500,
                items: [
                  { id: 5, name: "School Bag", image: "??", price: 850, category: "school", affordable: true },
                  { id: 6, name: "House", image: "??", price: 2500000, category: "property", affordable: false },
                  { id: 7, name: "Bicycle", image: "??", price: 3500, category: "vehicle", affordable: false },
                  { id: 8, name: "Pizza", image: "??", price: 280, category: "food", affordable: true }
                ]
              },
              {
                roundId: 3,
                budget: 1200,
                items: [
                  { id: 9, name: "Video Game", image: "??", price: 2800, category: "entertainment", affordable: false },
                  { id: 10, name: "Ice Cream", image: "??", price: 45, category: "dessert", affordable: true },
                  { id: 11, name: "Smartphone", image: "??", price: 25000, category: "electronics", affordable: false },
                  { id: 12, name: "Book", image: "??", price: 350, category: "education", affordable: true }
                ]
              }
            ],
            badges: {
              completion: {
                id: "money_master",
                name: "Money Master",
                description: "Completed all 3 rounds of Money Value Adventure!",
                icon: "????",
                points: 100
              }
            }
          }
        ],

        "Household Chores Helper": [
          {
            choreId: "washing_dishes",
            choreName: "Washing Dishes",
            choreIcon: "???",
            description: "Learn to wash dishes step by step!",
            steps: [
              {
                stepId: 1,
                instruction: "Fill the sink with warm water and soap",
                action: "click",
                target: "sink",
                feedback: "Perfect! The water is ready for washing!",
                character_thought: "Time to fill the sink with soapy water! ??"
              },
              {
                stepId: 2,
                instruction: "Pick up the sponge and scrub the plate",
                action: "drag",
                target: "plate",
                feedback: "Great scrubbing! The plate is getting clean!",
                character_thought: "Scrub, scrub, scrub! Making it shine! ?"
              },
              {
                stepId: 3,
                instruction: "Rinse the plate with clean water",
                action: "drag",
                target: "rinse_area",
                feedback: "Excellent! All the soap is washed away!",
                character_thought: "Almost done! Just need to rinse off the soap! ??"
              },
              {
                stepId: 4,
                instruction: "Dry the plate with a clean towel",
                action: "drag",
                target: "drying_rack",
                feedback: "Amazing work! The plate is clean and dry!",
                character_thought: "All clean and ready to use! Great job! ??"
              }
            ],
            gameType: "household_chores",
            totalSteps: 4,
            successMessage: "Fantastic! You've mastered dish washing!",
            badge: "?? Dish Washing Expert!"
          },
          {
            choreId: "sweeping_floor",
            choreName: "Sweeping the Floor",
            choreIcon: "??",
            description: "Clean the floor by sweeping away the dirt!",
            steps: [
              {
                stepId: 1,
                instruction: "Pick up the broom",
                action: "click",
                target: "broom",
                feedback: "Good! You've got the broom ready!",
                character_thought: "Let's grab the broom and clean up! ??"
              },
              {
                stepId: 2,
                instruction: "Sweep the dirt into a pile",
                action: "drag",
                target: "dirt_spots",
                feedback: "Nice sweeping! Gathering all the dirt together!",
                character_thought: "Sweep, sweep! Pushing all the dirt together! ??"
              },
              {
                stepId: 3,
                instruction: "Sweep the dirt pile into the dustpan",
                action: "drag",
                target: "dustpan",
                feedback: "Perfect! All the dirt is in the dustpan!",
                character_thought: "Almost finished! Getting all the dirt in one place! ??"
              },
              {
                stepId: 4,
                instruction: "Empty the dustpan into the trash",
                action: "drag",
                target: "trash_bin",
                feedback: "Excellent! The floor is now clean!",
                character_thought: "All done! The floor looks amazing! ?"
              }
            ],
            gameType: "household_chores",
            totalSteps: 4,
            successMessage: "Outstanding! You're a sweeping superstar!",
            badge: "?? Floor Cleaning Champion!"
          },
          {
            choreId: "making_bed",
            choreName: "Making the Bed",
            choreIcon: "???",
            description: "Make your bed neat and tidy!",
            steps: [
              {
                stepId: 1,
                instruction: "Pull the bedsheet straight",
                action: "drag",
                target: "bedsheet",
                feedback: "Great! The sheet is nice and smooth!",
                character_thought: "Let's make this bed look perfect! ???"
              },
              {
                stepId: 2,
                instruction: "Arrange the pillows at the head of the bed",
                action: "drag",
                target: "pillow_area",
                feedback: "Perfect! The pillows look so neat!",
                character_thought: "Fluffing the pillows to make them comfy! ???"
              },
              {
                stepId: 3,
                instruction: "Pull the blanket over the bed",
                action: "drag",
                target: "blanket_area",
                feedback: "Wonderful! The blanket is perfectly placed!",
                character_thought: "Almost done! Just need to spread the blanket! ??"
              },
              {
                stepId: 4,
                instruction: "Smooth out any wrinkles",
                action: "click",
                target: "bed_surface",
                feedback: "Amazing! Your bed looks fantastic!",
                character_thought: "Perfect! Now it's ready for a good night's sleep! ??"
              }
            ],
            gameType: "household_chores",
            totalSteps: 4,
            successMessage: "Incredible! You're a bed-making expert!",
            badge: "?? Bedroom Organization Star!"
          },
          {
            choreId: "putting_toys_away",
            choreName: "Putting Toys Away",
            choreIcon: "??",
            description: "Clean up by putting all toys in their proper place!",
            steps: [
              {
                stepId: 1,
                instruction: "Pick up the teddy bear",
                action: "drag",
                target: "toy_box",
                feedback: "Great! Teddy bear is safely in the toy box!",
                character_thought: "Time to clean up and put everything away! ??"
              },
              {
                stepId: 2,
                instruction: "Put the blocks in the toy box",
                action: "drag",
                target: "toy_box",
                feedback: "Excellent! The blocks are organized!",
                character_thought: "One by one, everything goes in its place! ??"
              },
              {
                stepId: 3,
                instruction: "Place the toy car in the garage",
                action: "drag",
                target: "toy_garage",
                feedback: "Perfect! The car is parked safely!",
                character_thought: "Vroom vroom! The car goes in the garage! ??"
              },
              {
                stepId: 4,
                instruction: "Put the puzzle pieces in their container",
                action: "drag",
                target: "puzzle_box",
                feedback: "Amazing! Everything is organized and tidy!",
                character_thought: "All done! The room looks so clean now! ?"
              }
            ],
            gameType: "household_chores",
            totalSteps: 4,
            successMessage: "Fantastic! You're a toy organization master!",
            badge: "?? Cleanup Champion!"
          },
          {
            choreId: "taking_out_trash",
            choreName: "Taking Out the Trash",
            choreIcon: "???",
            description: "Help keep the house clean by taking out the trash!",
            steps: [
              {
                stepId: 1,
                instruction: "Tie the trash bag closed",
                action: "click",
                target: "trash_bag",
                feedback: "Good! The trash bag is securely closed!",
                character_thought: "Let's get this trash ready to go out! ???"
              },
              {
                stepId: 2,
                instruction: "Lift the trash bag out of the bin",
                action: "drag",
                target: "lift_area",
                feedback: "Great lifting! You've got it!",
                character_thought: "Careful! This bag might be a little heavy! ??"
              },
              {
                stepId: 3,
                instruction: "Carry the bag to the outdoor trash bin",
                action: "drag",
                target: "outdoor_bin",
                feedback: "Excellent! You carried it all the way outside!",
                character_thought: "Almost there! Just need to get it outside! ?????"
              },
              {
                stepId: 4,
                instruction: "Put a new bag in the indoor trash bin",
                action: "drag",
                target: "indoor_bin",
                feedback: "Perfect! The trash bin is ready for more trash!",
                character_thought: "All set! The bin is ready for next time! ??"
              }
            ],
            gameType: "household_chores",
            totalSteps: 4,
            successMessage: "Outstanding! You're a trash management expert!",
            badge: "?? Cleanliness Hero!"
          }
        ]
    }
  };

  const questions = questionsData[category]?.[difficulty]?.[activity] || 
                   questionsData[category]?.[activity] || [];
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
  const isChoreGame = activity === "Household Chores Helper";

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
        // Auto-proceed to next hygiene scenario
        if (currentRound < 5) {
          setCurrentRound(prev => prev + 1);
          setSelectedAnswer(null);
          setIsAnswered(false);
          
          const nextScenario = getRandomScenario();
          setCurrentScenario(nextScenario);
          setUsedScenarios(prev => [...prev, nextScenario.scenario]);
          
          const nextIndex = questions.findIndex(q => q.scenario === nextScenario.scenario);
          setCurrentQuestionIndex(nextIndex);
        } else {
          setShowModal(true);
        }
      }, 2000);
    } else {
      setShowWrong(true);
      setTimeout(() => {
        setShowWrong(false);
        // Auto-proceed to next hygiene scenario even on wrong answer
        if (currentRound < 5) {
          setCurrentRound(prev => prev + 1);
          setSelectedAnswer(null);
          setIsAnswered(false);
          
          const nextScenario = getRandomScenario();
          setCurrentScenario(nextScenario);
          setUsedScenarios(prev => [...prev, nextScenario.scenario]);
          
          const nextIndex = questions.findIndex(q => q.scenario === nextScenario.scenario);
          setCurrentQuestionIndex(nextIndex);
        } else {
          setShowModal(true);
        }
      }, 1500);
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
    console.log('Getting random street scenario...');
    const streetQuestions = questionsData[category]?.["Safe Street Crossing"] || [];
    console.log('Available street questions:', streetQuestions.length);
    console.log('Used scenarios:', usedScenarios);
    
    const availableScenarios = streetQuestions.filter(q => !usedScenarios.includes(q.scenario));
    console.log('Available scenarios after filtering:', availableScenarios.length);
    
    if (availableScenarios.length === 0) {
      console.log('?? No more unused scenarios, returning first one as fallback');
      return streetQuestions[0]; // Fallback
    }
    
    const selectedScenario = availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
    console.log('?? Selected scenario:', selectedScenario?.scenario);
    return selectedScenario;
  };

  const handleStreetAnswer = (choice) => {
    console.log('????? Street answer clicked:', choice);
    console.log('State check - isAnswered:', isAnswered, 'showStreetFeedback:', showStreetFeedback);
    
    if (isAnswered || showStreetFeedback) {
      console.log('? Answer blocked - already answered or showing feedback');
      return;
    }
    
    console.log('? Processing answer:', choice);
    setSelectedAnswer(choice);
    setIsAnswered(true);

    const currentStreetScenario = streetScenario || currentScenario;
    console.log('?? Current scenario:', currentStreetScenario);
    
    if (!currentStreetScenario) {
      console.error('? No current scenario available!');
      console.log('streetScenario:', streetScenario, 'currentScenario:', currentScenario);
      return;
    }

    const isCorrect = choice === currentStreetScenario.correctAnswer;
    console.log('?? Answer check - Selected:', choice, 'Expected:', currentStreetScenario.correctAnswer, 'Correct:', isCorrect);

    if (isCorrect) {
      setStreetScore(prev => prev + 1);
      setScore(prev => prev + 1);
      setStreetFeedbackType('safe');
      setStreetFeedbackMessage(currentStreetScenario.feedbackMessage || currentStreetScenario.successMessage);
      
      if (choice === "CROSS") {
        setShowWalkingAnimation(true);
        setTimeout(() => setShowWalkingAnimation(false), 2000);
      }
      
      setShowCorrect(true);
      
      setTimeout(() => {
        setShowCorrect(false);
        setShowStreetFeedback(false);
        setShowWalkingAnimation(false);
        
        // Move to next round or end game
        if (streetRound < 5) {
          setStreetRound(prev => prev + 1);
          setSelectedAnswer(null);
          setIsAnswered(false);
          
          // Get next scenario
          const nextScenario = getRandomStreetScenario();
          console.log('Next scenario:', nextScenario);
          setStreetScenario(nextScenario);
          setCurrentScenario(nextScenario);
          setUsedScenarios(prev => [...prev, nextScenario.scenario]);
        } else {
          // End game after 5 rounds
          console.log('Game complete!');
          setShowModal(true);
        }
      }, 3000);
    } else {
      setStreetFeedbackType('unsafe');
      setStreetFeedbackMessage(currentStreetScenario.feedbackMessage || "Not safe! Always check before crossing.");
      setShowWrong(true);
      
      setTimeout(() => {
        setShowWrong(false);
        setShowStreetFeedback(false);
        
        // Move to next round or end game even on wrong answer
        if (streetRound < 5) {
          setStreetRound(prev => prev + 1);
          setSelectedAnswer(null);
          setIsAnswered(false);
          
          // Get next scenario
          const nextScenario = getRandomStreetScenario();
          console.log('Next scenario after wrong answer:', nextScenario);
          setStreetScenario(nextScenario);
          setCurrentScenario(nextScenario);
          setUsedScenarios(prev => [...prev, nextScenario.scenario]);
        } else {
          // End game after 5 rounds
          console.log('Game complete after wrong answer!');
          setShowModal(true);
        }
      }, 3000);
    }

    setShowStreetFeedback(true);
  };

  const initializeStreetGame = () => {
    console.log('?? Initializing Safe Street Crossing game');
    console.log('Activity:', activity, 'isStreetGameActive:', isStreetGameActive);
    
    // Reset all states first
    setIsStreetGameActive(true);
    setStreetRound(1);
    setStreetScore(0);
    setUsedScenarios([]);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowStreetFeedback(false);
    setShowWalkingAnimation(false);
    setStreetFeedbackMessage('');
    setStreetFeedbackType('');
    
    // Set up first scenario
    const firstScenario = getRandomStreetScenario();
    console.log('?? First scenario loaded:', firstScenario);
    
    if (firstScenario) {
      setStreetScenario(firstScenario);
      setCurrentScenario(firstScenario);
      setUsedScenarios([firstScenario.scenario]);
      console.log('? Street game initialized successfully');
    } else {
      console.error('? Failed to load first scenario');
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
    const greetingQuestions = questionsData[category]?.[difficulty]?.["Social Greetings"] || 
                              questionsData[category]?.["Social Greetings"] || [];
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
        
        // Auto-proceed to next greeting scenario
        if (greetingsRound < 5) {
          setGreetingsRound(prev => prev + 1);
          setGreetingAnswered(false);
          setGreetingSelectedChoice(null);
          
          const nextScenario = getRandomGreetingScenario();
          setCurrentGreetingScenario(nextScenario);
          setUsedScenarios(prev => [...prev, nextScenario.id]);
          setCharacterSpeech(nextScenario.otherCharacterSpeech);
          setShowCharacterThought(true);
        } else {
          setShowModal(true);
        }
      }, 3000);
    } else {
      setGreetingFeedbackType('incorrect');
      setGreetingFeedbackMessage(choice.feedback);
      setShowGreetingFeedback(true);
      setShowWrong(true);
      
      setTimeout(() => {
        setShowGreetingFeedback(false);
        setShowWrong(false);
        
        // Auto-proceed to next greeting scenario even on wrong answer
        if (greetingsRound < 5) {
          setGreetingsRound(prev => prev + 1);
          setGreetingAnswered(false);
          setGreetingSelectedChoice(null);
          
          const nextScenario = getRandomGreetingScenario();
          setCurrentGreetingScenario(nextScenario);
          setUsedScenarios(prev => [...prev, nextScenario.id]);
          setCharacterSpeech(nextScenario.otherCharacterSpeech);
          setShowCharacterThought(true);
        } else {
          setShowModal(true);
        }
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
      setMoneyFeedbackMessage(`?? Correct! You can afford the ${item.name} for ?${item.price.toLocaleString()}`);
      setShowPurchaseAnimation(true);
      setShowCorrect(true);
      
      setTimeout(() => {
        setShowPurchaseAnimation(false);
        setShowCorrect(false);
      }, 2000);
    } else {
      // Wrong purchase - too expensive
      setMoneyFeedbackType('wrong');
      setMoneyFeedbackMessage(`? Sorry! The ${item.name} costs ?${item.price.toLocaleString()}, but you only have ?${currentBudget.toLocaleString()}`);
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
    if (activity === "Safe Street Crossing" && !isStreetGameActive) {
      console.log('Effect: Initializing Street Game');
      initializeStreetGame();
    }
  }, [activity]); // Remove currentQuestionIndex dependency

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

  // Initialize household chores game when activity starts
  useEffect(() => {
    if (isChoreGame) {
      initializeChoreGame();
    }
  }, [currentQuestionIndex, isChoreGame]);

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
      setPuzzleFeedbackMessage("?? Excellent! You solved the puzzle!");
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
      setPuzzleFeedbackMessage("?? Not quite right. Try again!");
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
      setMatchingFeedbackMessage("?? PERFECT SCORE! All 7 answers correct! Excellent work! ??");
      setMatchingFeedbackType("correct");
    } else if (finalScore >= 5) {
      setMatchingFeedbackMessage(`?? Great job! ${finalScore}/7 correct. ${7 - finalScore} to review.`);
      setMatchingFeedbackType("partial");
    } else {
      setMatchingFeedbackMessage(`?? Keep trying! ${finalScore}/7 correct. Review and try again!`);
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

  // Household Chores Helper Game Functions
  const getRandomChore = () => {
    if (!questions || questions.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  };

  const initializeChoreGame = () => {
    if (!questions || questions.length === 0) return;
    
    const choreData = getRandomChore();
    if (!choreData) return;
    
    setCurrentChoreId(choreData.choreId);
    setCurrentChoreStep(0);
    setChoreProgress([]);
    setCompletedChoreSteps([]);
    setDraggedChoreItems([]);
    setDroppedChoreItems([]);
    setChoreScore(0);
    setIsChoreComplete(false);
    setShowChoreFeedback(false);
    setChoreFeedbackType('');
    setChoreFeedbackMessage('');
    setCharacterThought(`Let's learn how to ${choreData.choreName.toLowerCase()}! Watch carefully and follow the steps.`);
    setShowCharacterSpeech(true);
    
    // Set up the tools and environment for this chore
    const steps = choreData.steps;
    const allTools = [];
    const allEnvironmentItems = [];
    
    steps.forEach(step => {
      if (step.requiredTools) allTools.push(...step.requiredTools);
      if (step.environmentItems) allEnvironmentItems.push(...step.environmentItems);
    });
    
    setChoreToolsAvailable([...new Set(allTools)]);
    setChoreEnvironmentItems([...new Set(allEnvironmentItems)]);
    
    setTimeout(() => setShowCharacterSpeech(false), 3000);
  };

  const handleChoreAction = (actionType, itemId) => {
    if (isChoreComplete || !currentChoreId) return;
    
    const choreData = questions.find(q => q.choreId === currentChoreId);
    if (!choreData) return;
    
    const currentStep = choreData.steps[currentChoreStep];
    if (!currentStep) return;
    
    let isCorrectAction = false;
    
    // Check if this action is correct for the current step
    if (actionType === 'use_tool' && currentStep.requiredTools?.includes(itemId)) {
      isCorrectAction = true;
    } else if (actionType === 'interact' && currentStep.environmentItems?.includes(itemId)) {
      isCorrectAction = true;
    } else if (actionType === 'sequence' && currentStep.actionType === 'sequence') {
      isCorrectAction = true;
    }
    
    if (isCorrectAction) {
      // Add to progress
      const newProgress = [...choreProgress, { step: currentChoreStep, action: actionType, item: itemId }];
      setChoreProgress(newProgress);
      setCompletedChoreSteps([...completedChoreSteps, currentChoreStep]);
      
      // Update character feedback
      const feedbackMessages = [
        "Great job! You're doing it right!",
        "Perfect! Keep going!",
        "Excellent work! That's exactly right!",
        "You're learning so well!"
      ];
      setCharacterThought(feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]);
      setShowCharacterSpeech(true);
      
      // Move to next step or complete
      if (currentChoreStep < choreData.steps.length - 1) {
        setTimeout(() => {
          setCurrentChoreStep(prev => prev + 1);
          setShowCharacterSpeech(false);
        }, 2000);
      } else {
        // Complete the chore
        setIsChoreComplete(true);
        setChoreScore(choreData.steps.length);
        setChoreFeedbackType('correct');
        setChoreFeedbackMessage(`?? Amazing! You completed "${choreData.title}"! You've learned an important life skill!`);
        setShowChoreFeedback(true);
        setCharacterThought("You did it! I'm so proud of you! You're becoming very independent!");
        
        // Award badge
        setTimeout(() => {
          setIsAnswered(true);
        }, 3000);
      }
    } else {
      // Incorrect action - provide guidance
      setChoreFeedbackType('incorrect');
      setChoreFeedbackMessage(`Not quite right. Try ${currentStep.instruction}`);
      setShowChoreFeedback(true);
      setCharacterThought(`Remember: ${currentStep.instruction}. You can do it!`);
      setShowCharacterSpeech(true);
      
      setTimeout(() => {
        setShowChoreFeedback(false);
        setShowCharacterSpeech(false);
      }, 3000);
    }
  };

  const handleChoreDrag = (item, isCorrectPlacement) => {
    if (isCorrectPlacement) {
      setDroppedChoreItems([...droppedChoreItems, item]);
      handleChoreAction('drag', item);
    } else {
      setChoreFeedbackType('incorrect');
      setChoreFeedbackMessage('Try placing that item in the right spot!');
      setShowChoreFeedback(true);
      setTimeout(() => setShowChoreFeedback(false), 2000);
    }
  };

  const resetChoreState = () => {
    setCurrentChoreId('');
    setCurrentChoreStep(0);
    setChoreProgress([]);
    setCompletedChoreSteps([]);
    setChoreToolsAvailable([]);
    setChoreEnvironmentItems([]);
    setDraggedChoreItems([]);
    setDroppedChoreItems([]);
    setChoreScore(0);
    setIsChoreComplete(false);
    setShowChoreFeedback(false);
    setChoreFeedbackType('');
    setChoreFeedbackMessage('');
    setCharacterThought('');
    setShowCharacterSpeech(false);
  };

  // Helper functions for chore game icons
  const getToolIcon = (tool) => {
    const toolIcons = {
      'soap': '??',
      'sponge': '??',
      'towel': '??',
      'broom': '??',
      'dustpan': '???',
      'vacuum': '??',
      'pillow': '???',
      'sheet': '???',
      'blanket': '??',
      'toy box': '??',
      'basket': '??',
      'trash bag': '???'
    };
    return toolIcons[tool] || '??';
  };

  const getEnvironmentIcon = (item) => {
    const envIcons = {
      'sink': '??',
      'dishes': '???',
      'floor': '??',
      'bed': '???',
      'living room': '???',
      'toys': '??',
      'trash can': '???',
      'kitchen': '??',
      'bedroom': '???',
      'water': '??',
      'counter': '??'
    };
    return envIcons[item] || '??';
  };

  // Handle answer selection
  const handleAnswerClick = (choice) => {
    if (isAnswered) return;
    
    // Track timing for this question
    const questionStartTime = new Date();
    
    setSelectedAnswer(choice);
    setIsAnswered(true);

    const isCorrect = choice === questions[currentQuestionIndex].correctAnswer;
    const isSocialDailyLifeSkill = category === "Social / Daily Life Skill";

    if (isCorrect) {
      setScore(prev => prev + 1);
      setShowCorrect(true);
      
      // Track if first question was correct and show badge preview
      if (currentQuestionIndex === 0) {
        setSessionStats(prev => ({ ...prev, firstQuestionCorrect: true }));
        // Show preview for first try hero badge
        setPreviewBadge({
          name: 'First Try Hero',
          icon: '??',
          message: 'Great start! Keep it up!'
        });
        setShowBadgePreview(true);
        setTimeout(() => setShowBadgePreview(false), 2000);
      }
      
      // Show perfect score preview when getting close to end
      if (score + 1 === questions.length && currentQuestionIndex === questions.length - 1) {
        setPreviewBadge({
          name: 'Perfect Score Champion',
          icon: '??',
          message: 'Perfect! Amazing work!'
        });
        setShowBadgePreview(true);
        setTimeout(() => setShowBadgePreview(false), 3000);
      }
      
      setTimeout(() => {
        setShowCorrect(false);
        // Auto-proceed for Social / Daily Life Skill activities
        if (isSocialDailyLifeSkill) {
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            resetCashierState();
            resetStreetState();
            resetMatchingGame();
          } else {
            setShowModal(true);
          }
        }
      }, 1500);
    } else {
      setShowWrong(true);
      setTimeout(() => {
        setShowWrong(false);
        // Auto-proceed for Social / Daily Life Skill activities
        if (isSocialDailyLifeSkill) {
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            resetCashierState();
            resetStreetState();
            resetMatchingGame();
          } else {
            setShowModal(true);
          }
        }
      }, 1500);
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
    
    // Show badge modal if badges were earned
    const finalBadges = calculateSessionBadges(score, total);
    if (finalBadges && finalBadges.length > 0) {
      setEarnedBadges(finalBadges);
      saveBadgesToStorage(finalBadges);
      setShowBadgeModal(true);
      playBadgeSound();
      
      // Track new badges separately for preview
      const existingBadgeIds = JSON.parse(localStorage.getItem('earnedBadges') || '[]').map(b => b.id);
      const newBadges = finalBadges.filter(badge => !existingBadgeIds.includes(badge.id));
      if (newBadges.length > 0) {
        setNewEarnedBadges(newBadges);
        setShowBadgePreview(true);
        setTimeout(() => setShowBadgePreview(false), 3000);
      }
    }
    
    onComplete(score, total);
  };

  // Show badge modal if badges were earned
  useEffect(() => {
    if (showModal) {
      const finalBadges = calculateSessionBadges(score, total);
      if (finalBadges && finalBadges.length > 0) {
        setEarnedBadges(finalBadges);
        saveBadgesToStorage(finalBadges);
        setShowBadgeModal(true);
        playBadgeSound();
        
        // Track new badges separately for preview
        const existingBadgeIds = JSON.parse(localStorage.getItem('earnedBadges') || '[]').map(b => b.id);
        const newBadges = finalBadges.filter(badge => !existingBadgeIds.includes(badge.id));
        if (newBadges.length > 0) {
          setNewEarnedBadges(newBadges);
          setShowBadgePreview(true);
          setTimeout(() => setShowBadgePreview(false), 3000);
        }
      }
    }
  }, [showModal, score, total]);

  if (showCorrect) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center animate-fade-in-scale">
          <div className="text-8xl mb-4">😄</div>
          <div className="text-green-500 text-4xl font-bold">CORRECT!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main content would continue here with all the game UI */}
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Educational Activity</h2>
        <p>The game UI is being restored...</p>
      </div>
    </div>
  );
};

export default Flashcards;
