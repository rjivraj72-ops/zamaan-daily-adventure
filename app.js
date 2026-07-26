function loadPolishedUi() {
  if (document.querySelector('link[data-ui-polish="production"]')) {
    return;
  }
  const polishLink = document.createElement("link");
  polishLink.rel = "stylesheet";
  polishLink.href = "polish.css?v=20260712-personality-voice";
  polishLink.dataset.uiPolish = "production";
  document.head.appendChild(polishLink);
}

loadPolishedUi();

const voicePrompts = {
  welcome: [
    "audio/personality/welcome-1.mp3",
    "audio/personality/welcome-2.mp3",
    "audio/personality/welcome-3.mp3"
  ],
  startPath: [
    "audio/personality/start-path-1.mp3",
    "audio/personality/start-path-2.mp3",
    "audio/personality/travel-1.mp3"
  ],
  beforeQuestion: [
    "audio/personality/start-path-1.mp3",
    "audio/personality/keep-going-1.mp3"
  ],
  memoryGame: [
    "audio/personality/start-path-1.mp3",
    "audio/personality/keep-going-1.mp3"
  ],
  moneyMath: [
    "audio/personality/money-math-1.mp3",
    "audio/personality/money-math-2.mp3"
  ],
  spanishCards: [
    "audio/personality/spanish-1.mp3",
    "audio/personality/spanish-2.mp3"
  ],
  talkTime: [
    "audio/personality/talk-time-1.mp3",
    "audio/personality/talk-time-2.mp3"
  ],
  firstPersonReminder: "audio/first-person-reminder.mp3",
  thirdPersonReminder: "audio/third-person-reminder.mp3",
  familyWords: [
    "audio/personality/family-words-1.mp3",
    "audio/personality/family-words-2.mp3"
  ],
  correct: [
    "audio/personality/correct-1.mp3",
    "audio/personality/correct-2.mp3",
    "audio/personality/correct-3.mp3",
    "audio/personality/keep-going-1.mp3"
  ],
  incorrect: [
    "audio/personality/try-again-1.mp3",
    "audio/personality/try-again-2.mp3",
    "audio/personality/try-again-3.mp3"
  ],
  hint: [
    "audio/personality/hint-1.mp3",
    "audio/personality/hint-2.mp3"
  ],
  keepGoing: [
    "audio/personality/keep-going-1.mp3",
    "audio/personality/keep-going-2.mp3"
  ],
  halfwayDone: [
    "audio/personality/halfway-1.mp3",
    "audio/personality/halfway-2.mp3"
  ],
  almostDone: [
    "audio/personality/almost-done-1.mp3",
    "audio/personality/almost-done-2.mp3"
  ],
  finished: [
    "audio/personality/finished-1.mp3",
    "audio/personality/finished-2.mp3",
    "audio/personality/family-cheer-1.mp3"
  ],
  sendUpdate: [
    "audio/personality/send-update-1.mp3",
    "audio/personality/send-update-2.mp3"
  ],
  extraGames: "audio/extra-games.mp3",
  caregiverCompletion: "audio/caregiver-completion.mp3",
  pickOneMoreCard: "audio/pick-one-more-card.mp3",
  nextStep: "audio/next-step.mp3",
  workoutBreak: [
    "audio/personality/workout-break-1.mp3",
    "audio/personality/workout-break-2.mp3"
  ],
  businessPractice: [
    "audio/personality/granola-ceo-1.mp3",
    "audio/personality/granola-ceo-2.mp3"
  ],
  travel: [
    "audio/personality/travel-1.mp3",
    "audio/personality/travel-2.mp3"
  ],
  familyCheer: [
    "audio/personality/family-cheer-1.mp3",
    "audio/personality/family-cheer-2.mp3"
  ],
  settingsSaved: "audio/settings-saved.mp3",
  soundOn: "audio/sound-on.mp3",
  progressReset: "audio/progress-reset.mp3",
  moodHappy: "audio/mood-happy.mp3",
  moodCalm: "audio/mood-calm.mp3",
  moodTired: "audio/mood-tired.mp3",
  moodUnsure: "audio/mood-unsure.mp3",
  conversationCoachStart: [
    "audio/personality/coach-start-1.mp3",
    "audio/personality/coach-start-2.mp3"
  ],
  conversationCoachFamily: [
    "audio/personality/coach-family-1.mp3",
    "audio/personality/coach-family-2.mp3"
  ],
  conversationCoachTravel: [
    "audio/personality/coach-travel-1.mp3",
    "audio/personality/coach-travel-2.mp3"
  ],
  conversationCoachBusiness: [
    "audio/personality/coach-business-1.mp3",
    "audio/personality/coach-business-2.mp3"
  ],
  conversationCoachSentence: [
    "audio/personality/coach-sentence-1.mp3",
    "audio/personality/coach-sentence-2.mp3"
  ],
  conversationCoachNice: [
    "audio/personality/coach-nice-1.mp3",
    "audio/personality/coach-nice-2.mp3"
  ],
  conversationCoachNext: [
    "audio/personality/coach-next-1.mp3",
    "audio/personality/coach-next-2.mp3"
  ]
};

let currentVoicePrompt = null;

function getHiddenVoicePlayer() {
  let player = document.querySelector("audio[data-voice-prompt]");
  if (player) return player;

  player = document.createElement("audio");
  player.dataset.voicePrompt = "true";
  player.hidden = true;
  player.controls = false;
  player.preload = "none";
  player.setAttribute("aria-hidden", "true");
  player.setAttribute("playsinline", "");
  player.setAttribute("webkit-playsinline", "");
  player.style.display = "none";
  if ("disableRemotePlayback" in player) {
    player.disableRemotePlayback = true;
  }
  document.body.appendChild(player);
  return player;
}

function loadExternalQuestionBank() {
  try {
    const request = new XMLHttpRequest();
    request.open("GET", `question-bank.json?v=${Date.now()}`, false);
    request.send(null);
    if (request.status >= 200 && request.status < 300) {
      return JSON.parse(request.responseText);
    }
  } catch (error) {
    return null;
  }
  return null;
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDayNumber(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const current = new Date(year, month - 1, day);
  const anchor = new Date(2026, 0, 5);
  const diff = Math.floor((current - anchor) / 86400000);
  return Math.max(diff, 0);
}

const todayKey = getLocalDateKey();
const curriculumDay = getDayNumber(todayKey);
const sectionIds = ["brain", "life", "language", "talk"];
const totalRounds = 12;
const maxRounds = {
  brain: 3,
  life: 3,
  language: 3,
  talk: 3
};

const conversationCoachDeck = [
  {
    topic: "Family Words",
    title: "Keyaan is my brother",
    prompt: "Who is Keyaan to you?",
    model: "Keyaan is my brother.",
    voiceKey: "conversationCoachFamily"
  },
  {
    topic: "Family Words",
    title: "Mom and Dad",
    prompt: "Who are you to Mom and Dad?",
    model: "I am Mom and Dad's son.",
    voiceKey: "conversationCoachFamily"
  },
  {
    topic: "Family Words",
    title: "Cousins",
    prompt: "Who are Marcus and Jasmine to you?",
    model: "Marcus and Jasmine are my cousins.",
    voiceKey: "conversationCoachFamily"
  },
  {
    topic: "Travel Talk",
    title: "Paris memory",
    prompt: "Tell me one thing you remember about Paris.",
    model: "I remember seeing the Eiffel Tower in Paris.",
    voiceKey: "conversationCoachTravel"
  },
  {
    topic: "Travel Talk",
    title: "Barcelona memory",
    prompt: "Who did you travel with in Barcelona?",
    model: "I traveled with my family in Barcelona.",
    voiceKey: "conversationCoachTravel"
  },
  {
    topic: "Travel Talk",
    title: "Favorite trip",
    prompt: "What place would you like to visit again?",
    model: "I would like to visit Sorrento again.",
    voiceKey: "conversationCoachTravel"
  },
  {
    topic: "Granola Kid",
    title: "Buyer greeting",
    prompt: "What can you say to a buyer?",
    model: "Hi, I am Zamaan from Granola Kid.",
    voiceKey: "conversationCoachBusiness"
  },
  {
    topic: "Granola Kid",
    title: "Thank a buyer",
    prompt: "How can you thank someone for trying a sample?",
    model: "Thank you for trying our granola.",
    voiceKey: "conversationCoachBusiness"
  },
  {
    topic: "Granola Kid",
    title: "Co-packer",
    prompt: "Who makes the granola?",
    model: "Our co-packer makes the granola.",
    voiceKey: "conversationCoachBusiness"
  }
];

const extraGameOrder = [
  { id: "sort", label: "Sort" },
  { id: "pattern", label: "Pattern" },
  { id: "money-math", label: "Money Math" },
  { id: "business", label: "Business" },
  { id: "pronouns", label: "Family Words" },
  { id: "conversation-coach", label: "Conversation Coach" }
];

const defaultState = {
  name: "Zamaan",
  talkPrompt: "What is one thing you want to do today?",
  message: "Great job. You finished today's adventure.",
  mood: "",
  completed: [],
  rounds: {
    brain: 0,
    life: 0,
    language: 0,
    talk: 0
  },
  date: todayKey
};

const defaultHistory = {
  days: {}
};

const saved = JSON.parse(localStorage.getItem("dailyAdventure") || "null");
const state = saved && saved.date === todayKey
  ? { ...defaultState, ...saved, rounds: { ...defaultState.rounds, ...(saved.rounds || {}) } }
  : defaultState;
if (state.name === "Alex") {
  state.name = "Zamaan";
}
if (state.message === "Nice work. You stayed with it.") {
  state.message = defaultState.message;
}
const history = { ...defaultHistory, ...(JSON.parse(localStorage.getItem("dailyAdventureHistory") || "null") || {}) };
const activityLogs = JSON.parse(localStorage.getItem("dailyAdventureLogs") || "{}");

const curriculum = [
  {
    name: "Morning Routine",
    brain: [
    {
      title: "Find the pair",
      prompt: "Tap two cards that go together.",
      cards: [
        { text: "Toothbrush", pair: "teeth" },
        { text: "Bread", pair: "toast" },
        { text: "Toothpaste", pair: "teeth" },
        { text: "Toaster", pair: "toast" }
      ]
    },
    {
      title: "Find the pair",
      prompt: "Tap two cards that go together.",
      cards: [
        { text: "Rain", pair: "weather" },
        { text: "Fork", pair: "table" },
        { text: "Umbrella", pair: "weather" },
        { text: "Plate", pair: "table" }
      ]
    },
    {
      title: "Find the pair",
      prompt: "Tap two cards that go together.",
      cards: [
        { text: "Pillow", pair: "bed" },
        { text: "Soap", pair: "bath" },
        { text: "Blanket", pair: "bed" },
        { text: "Towel", pair: "bath" }
      ]
    }
  ],
    life: [
    {
      title: "Make toast",
      prompt: "Tap the steps in the right order.",
      steps: [
        "Put bread in the toaster",
        "Wait for the toast",
        "Put toast on a plate"
      ]
    },
    {
      title: "Brush teeth",
      prompt: "Tap the steps in the right order.",
      steps: [
        "Put toothpaste on the brush",
        "Brush your teeth",
        "Rinse your mouth"
      ]
    },
    {
      title: "Get ready to go",
      prompt: "Tap the steps in the right order.",
      steps: [
        "Put on shoes",
        "Take your keys or bag",
        "Close the door"
      ]
    }
  ],
    talk: [
    "What do you remember about Paris?",
    "Who did you travel with in Paris?",
    "How did you feel when you saw the Eiffel Tower?"
    ],
    mini: {
      sort: { title: "Food or not food?", prompt: "Tap the things you can eat.", instruction: "Find 2 food choices.", correct: ["Apple", "Soup"], wrong: ["Chair", "Shoes"], success: "You found both foods." },
      pattern: { title: "What comes next?", sequence: ["blue", "red", "blue", "red"], answer: "blue", choices: ["Blue", "Red", "Green"] },
      money: { title: "Pay for a snack", prompt: "The snack costs $3. Which choice pays exactly $3?", answer: "$3", choices: ["$1", "$3", "$5"] }
    }
  },
  {
    name: "Home Helpers",
    brain: [
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Laundry", pair: "wash" }, { text: "Broom", pair: "clean" }, { text: "Washer", pair: "wash" }, { text: "Dustpan", pair: "clean" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Key", pair: "door" }, { text: "Lamp", pair: "light" }, { text: "Door", pair: "door" }, { text: "Switch", pair: "light" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Plant", pair: "water" }, { text: "Mail", pair: "letter" }, { text: "Watering can", pair: "water" }, { text: "Envelope", pair: "letter" }] }
    ],
    life: [
      { title: "Do laundry", prompt: "Tap the steps in the right order.", steps: ["Put clothes in washer", "Add soap", "Start the washer"] },
      { title: "Clean table", prompt: "Tap the steps in the right order.", steps: ["Move dishes", "Wipe the table", "Put cloth away"] },
      { title: "Water a plant", prompt: "Tap the steps in the right order.", steps: ["Fill watering can", "Pour water on soil", "Put can away"] }
    ],
    talk: ["What did you like about Monaco?", "Where did you walk or visit in Monaco?", "How did Monaco feel different from home?"],
    mini: {
      sort: { title: "Cleaning items", prompt: "Tap the things used for cleaning.", instruction: "Find 2 cleaning choices.", correct: ["Broom", "Soap"], wrong: ["Banana", "Hat"], success: "You found the cleaning items." },
      pattern: { title: "What comes next?", sequence: ["green", "green", "blue", "green"], answer: "green", choices: ["Green", "Blue", "Red"] },
      money: { title: "Buy soap", prompt: "Soap costs $4. Which choice pays exactly $4?", answer: "$4", choices: ["$2", "$4", "$6"] }
    }
  },
  {
    name: "Community Day",
    brain: [
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Library", pair: "book" }, { text: "Bus", pair: "ride" }, { text: "Book", pair: "book" }, { text: "Bus stop", pair: "ride" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Doctor", pair: "health" }, { text: "Cashier", pair: "store" }, { text: "Clinic", pair: "health" }, { text: "Register", pair: "store" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Park", pair: "outside" }, { text: "Movie", pair: "theater" }, { text: "Bench", pair: "outside" }, { text: "Ticket", pair: "theater" }] }
    ],
    life: [
      { title: "Ride the bus", prompt: "Tap the steps in the right order.", steps: ["Wait at bus stop", "Show pass or pay", "Sit down safely"] },
      { title: "Visit library", prompt: "Tap the steps in the right order.", steps: ["Choose a book", "Check it out", "Take it home"] },
      { title: "Buy a drink", prompt: "Tap the steps in the right order.", steps: ["Choose drink", "Pay cashier", "Say thank you"] }
    ],
    talk: ["What do you remember about Venice?", "Where did you see water or boats in Venice?", "Who was with you in Venice?"],
    mini: {
      sort: { title: "Community places", prompt: "Tap the places you can visit.", instruction: "Find 2 places.", correct: ["Library", "Park"], wrong: ["Fork", "Pillow"], success: "You found the places." },
      pattern: { title: "What comes next?", sequence: ["red", "blue", "blue", "red"], answer: "blue", choices: ["Blue", "Red", "Green"] },
      money: { title: "Buy a drink", prompt: "The drink costs $2. Which choice pays exactly $2?", answer: "$2", choices: ["$1", "$2", "$5"] }
    }
  },
  {
    name: "Healthy Choices",
    brain: [
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Water", pair: "drink" }, { text: "Shoes", pair: "walk" }, { text: "Cup", pair: "drink" }, { text: "Sidewalk", pair: "walk" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Apple", pair: "fruit" }, { text: "Toothbrush", pair: "teeth" }, { text: "Banana", pair: "fruit" }, { text: "Toothpaste", pair: "teeth" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Pill box", pair: "medicine" }, { text: "Bed", pair: "sleep" }, { text: "Medicine", pair: "medicine" }, { text: "Pillow", pair: "sleep" }] }
    ],
    life: [
      { title: "Wash hands", prompt: "Tap the steps in the right order.", steps: ["Turn on water", "Use soap and scrub", "Rinse and dry"] },
      { title: "Take a walk", prompt: "Tap the steps in the right order.", steps: ["Put on shoes", "Check weather", "Walk safely"] },
      { title: "Drink water", prompt: "Tap the steps in the right order.", steps: ["Get a cup", "Fill with water", "Take a drink"] }
    ],
    talk: ["What did you enjoy in Sorrento?", "What did you see near the water in Sorrento?", "How did you feel during that trip?"],
    mini: {
      sort: { title: "Healthy choices", prompt: "Tap the healthy choices.", instruction: "Find 2 healthy choices.", correct: ["Water", "Walk"], wrong: ["Too much candy", "No sleep"], success: "You found healthy choices." },
      pattern: { title: "What comes next?", sequence: ["blue", "green", "blue", "green"], answer: "blue", choices: ["Blue", "Green", "Red"] },
      money: { title: "Buy fruit", prompt: "Fruit costs $5. Which choice pays exactly $5?", answer: "$5", choices: ["$1", "$3", "$5"] }
    }
  },
  {
    name: "Kitchen Skills",
    brain: [
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Spoon", pair: "soup" }, { text: "Cup", pair: "drink" }, { text: "Soup", pair: "soup" }, { text: "Juice", pair: "drink" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Fridge", pair: "cold" }, { text: "Oven", pair: "hot" }, { text: "Ice", pair: "cold" }, { text: "Pan", pair: "hot" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Napkin", pair: "table" }, { text: "Cereal", pair: "breakfast" }, { text: "Plate", pair: "table" }, { text: "Milk", pair: "breakfast" }] }
    ],
    life: [
      { title: "Make cereal", prompt: "Tap the steps in the right order.", steps: ["Pour cereal", "Add milk", "Use spoon"] },
      { title: "Set table", prompt: "Tap the steps in the right order.", steps: ["Put down plate", "Add fork or spoon", "Add napkin"] },
      { title: "Clean a spill", prompt: "Tap the steps in the right order.", steps: ["Get towel", "Wipe spill", "Throw towel in laundry"] }
    ],
    talk: ["What do you remember about Lisbon?", "Where did you walk or explore in Lisbon?", "What food or snack did you enjoy while traveling?"],
    mini: {
      sort: { title: "Kitchen items", prompt: "Tap the things used in the kitchen.", instruction: "Find 2 kitchen choices.", correct: ["Spoon", "Plate"], wrong: ["Sock", "Book"], success: "You found kitchen items." },
      pattern: { title: "What comes next?", sequence: ["red", "red", "blue", "red"], answer: "red", choices: ["Red", "Blue", "Green"] },
      money: { title: "Buy cereal", prompt: "Cereal costs $6. Which choice pays exactly $6?", answer: "$6", choices: ["$4", "$6", "$8"] }
    }
  },
  {
    name: "Safety Practice",
    brain: [
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Stop sign", pair: "stop" }, { text: "Phone", pair: "call" }, { text: "Stop", pair: "stop" }, { text: "911", pair: "call" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Seat belt", pair: "car" }, { text: "Smoke alarm", pair: "fire" }, { text: "Car", pair: "car" }, { text: "Fire drill", pair: "fire" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Crosswalk", pair: "street" }, { text: "Helmet", pair: "bike" }, { text: "Street", pair: "street" }, { text: "Bicycle", pair: "bike" }] }
    ],
    life: [
      { title: "Cross street", prompt: "Tap the steps in the right order.", steps: ["Stop at curb", "Look both ways", "Cross when safe"] },
      { title: "Car safety", prompt: "Tap the steps in the right order.", steps: ["Sit in seat", "Buckle seat belt", "Keep belt on"] },
      { title: "If lost", prompt: "Tap the steps in the right order.", steps: ["Stay calm", "Find safe helper", "Call family"] }
    ],
    talk: ["What did you like about the Algarve?", "When did you go to the beach or see the water?", "How can you stay safe when traveling?"],
    mini: {
      sort: { title: "Safe choices", prompt: "Tap the safe choices.", instruction: "Find 2 safe choices.", correct: ["Wear seat belt", "Use crosswalk"], wrong: ["Run in street", "Touch hot stove"], success: "You found safe choices." },
      pattern: { title: "What comes next?", sequence: ["green", "red", "green", "red"], answer: "green", choices: ["Green", "Red", "Blue"] },
      money: { title: "Emergency card", prompt: "A card costs $1. Which choice pays exactly $1?", answer: "$1", choices: ["$1", "$2", "$5"] }
    }
  },
  {
    name: "Feelings Day",
    brain: [
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Smile", pair: "happy" }, { text: "Tears", pair: "sad" }, { text: "Happy", pair: "happy" }, { text: "Sad", pair: "sad" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Calm", pair: "relax" }, { text: "Angry", pair: "mad" }, { text: "Deep breath", pair: "relax" }, { text: "Mad face", pair: "mad" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Friend", pair: "kind" }, { text: "Help", pair: "support" }, { text: "Kind words", pair: "kind" }, { text: "Support", pair: "support" }] }
    ],
    life: [
      { title: "Calm down", prompt: "Tap the steps in the right order.", steps: ["Stop and breathe", "Name the feeling", "Ask for help"] },
      { title: "Say sorry", prompt: "Tap the steps in the right order.", steps: ["Look at person", "Say I am sorry", "Try again kindly"] },
      { title: "Share feelings", prompt: "Tap the steps in the right order.", steps: ["Choose feeling", "Use calm words", "Listen to response"] }
    ],
    talk: ["What do you remember about Cordoba?", "What did you see that was beautiful in Cordoba?", "Who helped make the trip fun?"],
    mini: {
      sort: { title: "Feeling words", prompt: "Tap the feeling words.", instruction: "Find 2 feelings.", correct: ["Happy", "Calm"], wrong: ["Table", "Shoe"], success: "You found feeling words." },
      pattern: { title: "What comes next?", sequence: ["blue", "blue", "red", "blue"], answer: "blue", choices: ["Blue", "Red", "Green"] },
      money: { title: "Buy a card", prompt: "A card costs $2. Which choice pays exactly $2?", answer: "$2", choices: ["$1", "$2", "$4"] }
    }
  },
  {
    name: "Weather Day",
    brain: [
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Raincoat", pair: "rain" }, { text: "Sunglasses", pair: "sun" }, { text: "Rain", pair: "rain" }, { text: "Sun", pair: "sun" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Snow", pair: "winter" }, { text: "Shorts", pair: "summer" }, { text: "Gloves", pair: "winter" }, { text: "Warm day", pair: "summer" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Cloud", pair: "sky" }, { text: "Wind", pair: "breeze" }, { text: "Sky", pair: "sky" }, { text: "Breeze", pair: "breeze" }] }
    ],
    life: [
      { title: "Dress for rain", prompt: "Tap the steps in the right order.", steps: ["Check weather", "Put on raincoat", "Take umbrella"] },
      { title: "Sunny day", prompt: "Tap the steps in the right order.", steps: ["Check sun", "Put on sunscreen", "Wear hat"] },
      { title: "Cold day", prompt: "Tap the steps in the right order.", steps: ["Check temperature", "Put on coat", "Wear gloves"] }
    ],
    talk: ["What do you remember about Granada?", "Where did you visit in Granada?", "How did the weather feel when you traveled?"],
    mini: {
      sort: { title: "Rainy day items", prompt: "Tap the rainy day items.", instruction: "Find 2 rainy choices.", correct: ["Umbrella", "Raincoat"], wrong: ["Sunscreen", "Sandals"], success: "You found rainy day items." },
      pattern: { title: "What comes next?", sequence: ["red", "green", "red", "green"], answer: "red", choices: ["Red", "Green", "Blue"] },
      money: { title: "Buy umbrella", prompt: "An umbrella costs $7. Which choice pays exactly $7?", answer: "$7", choices: ["$5", "$7", "$9"] }
    }
  },
  {
    name: "Friendship",
    brain: [
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Wave", pair: "hello" }, { text: "Gift", pair: "birthday" }, { text: "Hello", pair: "hello" }, { text: "Birthday", pair: "birthday" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Listen", pair: "talk" }, { text: "Game", pair: "play" }, { text: "Talk", pair: "talk" }, { text: "Play", pair: "play" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Share", pair: "kind" }, { text: "Phone", pair: "call" }, { text: "Kind", pair: "kind" }, { text: "Call", pair: "call" }] }
    ],
    life: [
      { title: "Greet someone", prompt: "Tap the steps in the right order.", steps: ["Look at person", "Say hello", "Ask a question"] },
      { title: "Take turns", prompt: "Tap the steps in the right order.", steps: ["Wait your turn", "Play your turn", "Let friend go next"] },
      { title: "Call a friend", prompt: "Tap the steps in the right order.", steps: ["Choose contact", "Say hello", "Have a short talk"] }
    ],
    talk: ["What did you like about Barcelona?", "Who did you spend time with in Barcelona?", "What kind thing can you say to someone you travel with?"],
    mini: {
      sort: { title: "Kind actions", prompt: "Tap the kind actions.", instruction: "Find 2 kind choices.", correct: ["Share", "Listen"], wrong: ["Yell", "Push"], success: "You found kind actions." },
      pattern: { title: "What comes next?", sequence: ["green", "blue", "green", "blue"], answer: "green", choices: ["Green", "Blue", "Red"] },
      money: { title: "Buy a small gift", prompt: "A gift costs $4. Which choice pays exactly $4?", answer: "$4", choices: ["$2", "$4", "$5"] }
    }
  },
  {
    name: "Exercise",
    brain: [
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Shoes", pair: "walk" }, { text: "Ball", pair: "throw" }, { text: "Walk", pair: "walk" }, { text: "Throw", pair: "throw" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Music", pair: "dance" }, { text: "Pool", pair: "swim" }, { text: "Dance", pair: "dance" }, { text: "Swim", pair: "swim" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Stretch", pair: "body" }, { text: "Bottle", pair: "water" }, { text: "Body", pair: "body" }, { text: "Water", pair: "water" }] }
    ],
    life: [
      { title: "Go for walk", prompt: "Tap the steps in the right order.", steps: ["Put on shoes", "Choose safe path", "Walk with care"] },
      { title: "Stretch", prompt: "Tap the steps in the right order.", steps: ["Stand still", "Reach arms up", "Relax body"] },
      { title: "Dance break", prompt: "Tap the steps in the right order.", steps: ["Choose music", "Make space", "Dance safely"] }
    ],
    talk: ["What city made you want to walk or move around?", "What music or sounds do you remember from your trips?", "How does your body feel after walking on vacation?"],
    mini: {
      sort: { title: "Movement words", prompt: "Tap the movement words.", instruction: "Find 2 movement choices.", correct: ["Walk", "Dance"], wrong: ["Sleep", "Chair"], success: "You found movement words." },
      pattern: { title: "What comes next?", sequence: ["blue", "red", "green", "blue"], answer: "red", choices: ["Red", "Blue", "Green"] },
      money: { title: "Buy water", prompt: "Water costs $1. Which choice pays exactly $1?", answer: "$1", choices: ["$1", "$3", "$5"] }
    }
  },
  {
    name: "Shopping",
    brain: [
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Cart", pair: "store" }, { text: "Money", pair: "pay" }, { text: "Store", pair: "store" }, { text: "Pay", pair: "pay" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "List", pair: "shop" }, { text: "Receipt", pair: "buy" }, { text: "Shop", pair: "shop" }, { text: "Buy", pair: "buy" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Bag", pair: "carry" }, { text: "Shelf", pair: "items" }, { text: "Carry", pair: "carry" }, { text: "Items", pair: "items" }] }
    ],
    life: [
      { title: "Use a shopping list", prompt: "Tap the steps in the right order.", steps: ["Read list", "Find item", "Put item in cart"] },
      { title: "Pay cashier", prompt: "Tap the steps in the right order.", steps: ["Wait in line", "Pay cashier", "Take receipt"] },
      { title: "Put groceries away", prompt: "Tap the steps in the right order.", steps: ["Bring bags inside", "Put cold food away", "Put bags away"] }
    ],
    talk: ["What did you buy or look at while traveling?", "What is one souvenir or item you remember?", "How do you say thank you when someone helps you on a trip?"],
    mini: {
      sort: { title: "Store items", prompt: "Tap the things you might buy at a store.", instruction: "Find 2 store items.", correct: ["Milk", "Soap"], wrong: ["Cloud", "Doorbell"], success: "You found store items." },
      pattern: { title: "What comes next?", sequence: ["red", "blue", "red", "blue"], answer: "red", choices: ["Red", "Blue", "Green"] },
      money: { title: "Buy milk", prompt: "Milk costs $3. Which choice pays exactly $3?", answer: "$3", choices: ["$2", "$3", "$6"] }
    }
  },
  {
    name: "Time Practice",
    brain: [
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Morning", pair: "breakfast" }, { text: "Night", pair: "bed" }, { text: "Breakfast", pair: "breakfast" }, { text: "Bedtime", pair: "bed" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Clock", pair: "time" }, { text: "Calendar", pair: "date" }, { text: "Time", pair: "time" }, { text: "Date", pair: "date" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Lunch", pair: "noon" }, { text: "Alarm", pair: "wake" }, { text: "Noon", pair: "noon" }, { text: "Wake up", pair: "wake" }] }
    ],
    life: [
      { title: "Morning routine", prompt: "Tap the steps in the right order.", steps: ["Wake up", "Get dressed", "Eat breakfast"] },
      { title: "Bedtime routine", prompt: "Tap the steps in the right order.", steps: ["Put on pajamas", "Brush teeth", "Get in bed"] },
      { title: "Get to appointment", prompt: "Tap the steps in the right order.", steps: ["Check time", "Get ready", "Leave on time"] }
    ],
    talk: ["What do you do in the morning when you travel?", "When do you like to explore a city: morning, afternoon, or evening?", "What helps you get ready for a travel day?"],
    mini: {
      sort: { title: "Morning or night", prompt: "Tap the morning activities.", instruction: "Find 2 morning choices.", correct: ["Breakfast", "Get dressed"], wrong: ["Pajamas", "Bedtime"], success: "You found morning activities." },
      pattern: { title: "What comes next?", sequence: ["green", "red", "red", "green"], answer: "red", choices: ["Red", "Green", "Blue"] },
      money: { title: "Buy calendar", prompt: "A calendar costs $5. Which choice pays exactly $5?", answer: "$5", choices: ["$2", "$5", "$7"] }
    }
  },
  {
    name: "Personal Care",
    brain: [
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Comb", pair: "hair" }, { text: "Soap", pair: "hands" }, { text: "Hair", pair: "hair" }, { text: "Hands", pair: "hands" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Shirt", pair: "clothes" }, { text: "Deodorant", pair: "fresh" }, { text: "Pants", pair: "clothes" }, { text: "Fresh", pair: "fresh" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Shampoo", pair: "shower" }, { text: "Towel", pair: "dry" }, { text: "Shower", pair: "shower" }, { text: "Dry", pair: "dry" }] }
    ],
    life: [
      { title: "Comb hair", prompt: "Tap the steps in the right order.", steps: ["Get comb", "Comb hair", "Put comb away"] },
      { title: "Take shower", prompt: "Tap the steps in the right order.", steps: ["Turn on water", "Wash body", "Dry with towel"] },
      { title: "Choose clothes", prompt: "Tap the steps in the right order.", steps: ["Check weather", "Pick clean clothes", "Get dressed"] }
    ],
    talk: ["What do you pack for a trip?", "What clothes do you like wearing when you travel?", "How do you get ready before leaving the hotel?"],
    mini: {
      sort: { title: "Bathroom items", prompt: "Tap the bathroom items.", instruction: "Find 2 bathroom choices.", correct: ["Soap", "Towel"], wrong: ["Fork", "Remote"], success: "You found bathroom items." },
      pattern: { title: "What comes next?", sequence: ["blue", "green", "green", "blue"], answer: "green", choices: ["Green", "Blue", "Red"] },
      money: { title: "Buy shampoo", prompt: "Shampoo costs $6. Which choice pays exactly $6?", answer: "$6", choices: ["$3", "$6", "$8"] }
    }
  },
  {
    name: "Hobbies",
    brain: [
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Paint", pair: "art" }, { text: "Guitar", pair: "music" }, { text: "Picture", pair: "art" }, { text: "Song", pair: "music" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Puzzle", pair: "pieces" }, { text: "Movie", pair: "screen" }, { text: "Pieces", pair: "pieces" }, { text: "Screen", pair: "screen" }] },
      { title: "Find the pair", prompt: "Tap two cards that go together.", cards: [{ text: "Book", pair: "read" }, { text: "Camera", pair: "photo" }, { text: "Read", pair: "read" }, { text: "Photo", pair: "photo" }] }
    ],
    life: [
      { title: "Start a puzzle", prompt: "Tap the steps in the right order.", steps: ["Open box", "Find edge pieces", "Start puzzle"] },
      { title: "Paint a picture", prompt: "Tap the steps in the right order.", steps: ["Get paper", "Choose colors", "Paint picture"] },
      { title: "Watch movie", prompt: "Tap the steps in the right order.", steps: ["Choose movie", "Sit comfortably", "Press play"] }
    ],
    talk: ["Which trip would you like to talk about today?", "What place would you like to visit again?", "Where would you like to travel next?"],
    mini: {
      sort: { title: "Hobby items", prompt: "Tap the hobby items.", instruction: "Find 2 hobby choices.", correct: ["Puzzle", "Paint"], wrong: ["Toothpaste", "Umbrella"], success: "You found hobby items." },
      pattern: { title: "What comes next?", sequence: ["red", "green", "blue", "red"], answer: "green", choices: ["Green", "Red", "Blue"] },
      money: { title: "Buy paint", prompt: "Paint costs $4. Which choice pays exactly $4?", answer: "$4", choices: ["$1", "$4", "$7"] }
    }
  }
];

const languageDecks = [
  [
    { english: "Water", spanish: "agua", choices: ["agua", "pan", "casa"] },
    { english: "Bread", spanish: "pan", choices: ["sol", "pan", "libro"] },
    { english: "Thank you", spanish: "gracias", choices: ["hola", "gracias", "alto"] }
  ],
  [
    { english: "House", spanish: "casa", choices: ["casa", "leche", "amigo"] },
    { english: "Clean", spanish: "limpio", choices: ["trabajo", "limpio", "frio"] },
    { english: "Work", spanish: "trabajo", choices: ["trabajo", "plato", "noche"] }
  ],
  [
    { english: "Bus", spanish: "autobus", choices: ["autobus", "manzana", "pelo"] },
    { english: "Library", spanish: "biblioteca", choices: ["cliente", "biblioteca", "lluvia"] },
    { english: "Friend", spanish: "amigo", choices: ["jabon", "amigo", "dinero"] }
  ],
  [
    { english: "Apple", spanish: "manzana", choices: ["manzana", "precio", "ayuda"] },
    { english: "Walk", spanish: "caminar", choices: ["caminar", "musica", "toalla"] },
    { english: "Calm", spanish: "tranquilo", choices: ["frio", "tranquilo", "cliente"] }
  ],
  [
    { english: "Milk", spanish: "leche", choices: ["leche", "sol", "hoy"] },
    { english: "Spoon", spanish: "cuchara", choices: ["cuchara", "alto", "venta"] },
    { english: "Plate", spanish: "plato", choices: ["plato", "adios", "pintar"] }
  ],
  [
    { english: "Stop", spanish: "alto", choices: ["alto", "feliz", "libro"] },
    { english: "Help", spanish: "ayuda", choices: ["ayuda", "precio", "bailar"] },
    { english: "Safe", spanish: "seguro", choices: ["seguro", "pan", "casa"] }
  ],
  [
    { english: "Happy", spanish: "feliz", choices: ["feliz", "agua", "cliente"] },
    { english: "Tired", spanish: "cansado", choices: ["trabajo", "cansado", "plato"] },
    { english: "Calm", spanish: "tranquilo", choices: ["tranquilo", "jabon", "sol"] }
  ],
  [
    { english: "Sun", spanish: "sol", choices: ["sol", "leche", "venta"] },
    { english: "Rain", spanish: "lluvia", choices: ["lluvia", "pelo", "precio"] },
    { english: "Cold", spanish: "frio", choices: ["frio", "amigo", "cuchara"] }
  ],
  [
    { english: "Hello", spanish: "hola", choices: ["hola", "noche", "dinero"] },
    { english: "Goodbye", spanish: "adios", choices: ["adios", "agua", "caminar"] },
    { english: "Friend", spanish: "amigo", choices: ["libro", "amigo", "alto"] }
  ],
  [
    { english: "Dance", spanish: "bailar", choices: ["bailar", "toalla", "cliente"] },
    { english: "Music", spanish: "musica", choices: ["musica", "frio", "pan"] },
    { english: "Water", spanish: "agua", choices: ["agua", "pintar", "precio"] }
  ],
  [
    { english: "Money", spanish: "dinero", choices: ["dinero", "sol", "jabon"] },
    { english: "Price", spanish: "precio", choices: ["precio", "amigo", "leche"] },
    { english: "Customer", spanish: "cliente", choices: ["cliente", "hoy", "casa"] }
  ],
  [
    { english: "Morning", spanish: "manana", choices: ["manana", "lluvia", "plato"] },
    { english: "Night", spanish: "noche", choices: ["noche", "seguro", "venta"] },
    { english: "Today", spanish: "hoy", choices: ["hoy", "libro", "feliz"] }
  ],
  [
    { english: "Soap", spanish: "jabon", choices: ["jabon", "cliente", "sol"] },
    { english: "Towel", spanish: "toalla", choices: ["toalla", "dinero", "hola"] },
    { english: "Hair", spanish: "pelo", choices: ["pelo", "ayuda", "manzana"] }
  ],
  [
    { english: "Book", spanish: "libro", choices: ["libro", "frio", "cuchara"] },
    { english: "Music", spanish: "musica", choices: ["musica", "precio", "alto"] },
    { english: "Paint", spanish: "pintar", choices: ["pintar", "agua", "noche"] }
  ]
];

const moneyMathDecks = [
  [
    { title: "Snack change", prompt: "You have $5. A snack costs $3. How much money is left?", answer: "$2", choices: ["$1", "$2", "$4"] },
    { title: "Two items", prompt: "A drink is $2 and chips are $3. How much together?", answer: "$5", choices: ["$4", "$5", "$6"] },
    { title: "Business sale", prompt: "A customer pays $10 for a $7 item. How much change?", answer: "$3", choices: ["$2", "$3", "$5"] }
  ],
  [
    { title: "Save money", prompt: "You save $2 today and $2 tomorrow. How much saved?", answer: "$4", choices: ["$3", "$4", "$5"] },
    { title: "Buy cereal", prompt: "Cereal costs $6. You have $8. How much is left?", answer: "$2", choices: ["$1", "$2", "$3"] },
    { title: "Small purchase", prompt: "A card costs $1 and a sticker costs $2. How much total?", answer: "$3", choices: ["$2", "$3", "$4"] }
  ],
  [
    { title: "Earn money", prompt: "You earn $4, then earn $3 more. How much money?", answer: "$7", choices: ["$6", "$7", "$8"] },
    { title: "Umbrella change", prompt: "An umbrella costs $7. You pay $10. How much change?", answer: "$3", choices: ["$2", "$3", "$4"] },
    { title: "Gift budget", prompt: "You have $5. A gift costs $4. How much is left?", answer: "$1", choices: ["$1", "$2", "$3"] }
  ],
  [
    { title: "Water bottles", prompt: "One water is $1. Two waters cost how much?", answer: "$2", choices: ["$1", "$2", "$3"] },
    { title: "Store math", prompt: "Milk costs $3 and soap costs $4. How much together?", answer: "$7", choices: ["$6", "$7", "$8"] },
    { title: "Calendar change", prompt: "A calendar costs $5. You pay $10. How much change?", answer: "$5", choices: ["$4", "$5", "$6"] }
  ],
  [
    { title: "Care items", prompt: "Soap costs $2 and shampoo costs $6. How much together?", answer: "$8", choices: ["$7", "$8", "$9"] },
    { title: "Art supplies", prompt: "Paint costs $4. You buy two. How much total?", answer: "$8", choices: ["$6", "$8", "$10"] },
    { title: "Lunch budget", prompt: "Lunch costs $6. You have $10. How much is left?", answer: "$4", choices: ["$2", "$4", "$6"] }
  ],
  [
    { title: "Customer order", prompt: "A customer buys 2 items for $3 each. How much total?", answer: "$6", choices: ["$5", "$6", "$8"] },
    { title: "Make change", prompt: "The price is $4. The customer pays $5. How much change?", answer: "$1", choices: ["$1", "$2", "$3"] },
    { title: "Add sales", prompt: "You sell one item for $5 and one for $2. How much money?", answer: "$7", choices: ["$6", "$7", "$8"] }
  ],
  [
    { title: "Two snacks", prompt: "One snack is $2. Two snacks cost how much?", answer: "$4", choices: ["$2", "$4", "$6"] },
    { title: "Save more", prompt: "You have $3 and save $5 more. How much now?", answer: "$8", choices: ["$6", "$8", "$9"] },
    { title: "Spend money", prompt: "You have $9 and spend $4. How much is left?", answer: "$5", choices: ["$4", "$5", "$6"] }
  ],
  [
    { title: "Rainy day buy", prompt: "A raincoat costs $8. You pay $10. How much change?", answer: "$2", choices: ["$1", "$2", "$3"] },
    { title: "Two drinks", prompt: "A drink is $2. Two drinks cost how much?", answer: "$4", choices: ["$3", "$4", "$5"] },
    { title: "Add coins", prompt: "$1 plus $3 equals how much?", answer: "$4", choices: ["$2", "$4", "$5"] }
  ],
  [
    { title: "Gift and card", prompt: "A gift is $4 and a card is $2. How much together?", answer: "$6", choices: ["$5", "$6", "$7"] },
    { title: "Change back", prompt: "The total is $6. You pay $10. How much change?", answer: "$4", choices: ["$3", "$4", "$5"] },
    { title: "Save for gift", prompt: "You saved $5 and need $8. How much more?", answer: "$3", choices: ["$2", "$3", "$4"] }
  ],
  [
    { title: "Water sale", prompt: "You sell 3 waters for $1 each. How much money?", answer: "$3", choices: ["$2", "$3", "$4"] },
    { title: "Buy water", prompt: "Water costs $1. You have $5. How much is left?", answer: "$4", choices: ["$3", "$4", "$5"] },
    { title: "Add dollars", prompt: "$2 plus $6 equals how much?", answer: "$8", choices: ["$7", "$8", "$9"] }
  ],
  [
    { title: "Grocery total", prompt: "Milk is $3 and bread is $2. How much together?", answer: "$5", choices: ["$4", "$5", "$6"] },
    { title: "Pay cashier", prompt: "The total is $5. You pay $10. How much change?", answer: "$5", choices: ["$4", "$5", "$6"] },
    { title: "Business total", prompt: "Two customers pay $4 each. How much money?", answer: "$8", choices: ["$6", "$8", "$10"] }
  ],
  [
    { title: "Morning sale", prompt: "You sell one item for $6 and one for $3. How much total?", answer: "$9", choices: ["$8", "$9", "$10"] },
    { title: "Appointment budget", prompt: "You have $10 and spend $5. How much is left?", answer: "$5", choices: ["$4", "$5", "$6"] },
    { title: "Double dollars", prompt: "$4 plus $4 equals how much?", answer: "$8", choices: ["$6", "$8", "$10"] }
  ],
  [
    { title: "Soap and towel", prompt: "Soap is $2 and a towel is $5. How much together?", answer: "$7", choices: ["$6", "$7", "$8"] },
    { title: "Shampoo change", prompt: "Shampoo costs $6. You pay $10. How much change?", answer: "$4", choices: ["$3", "$4", "$5"] },
    { title: "Care budget", prompt: "You have $8 and spend $3. How much is left?", answer: "$5", choices: ["$4", "$5", "$6"] }
  ],
  [
    { title: "Paint sale", prompt: "Paint costs $4. You sell 2. How much money?", answer: "$8", choices: ["$6", "$8", "$10"] },
    { title: "Book and music", prompt: "A book is $5 and music is $3. How much together?", answer: "$8", choices: ["$7", "$8", "$9"] },
    { title: "Art change", prompt: "Art supplies cost $7. You pay $10. How much change?", answer: "$3", choices: ["$2", "$3", "$4"] }
  ]
];

const businessPracticeDecks = [
  { title: "Our business", prompt: "Our co-packer makes the granola. What does our business focus on?", answer: "Sales and marketing", choices: ["Sales and marketing", "Building cars", "Washing dishes"] },
  { title: "Who is a buyer?", prompt: "Who might buy granola for a store, cafe, or office?", answer: "A buyer", choices: ["A buyer", "A bus driver", "A dentist"] },
  { title: "Sample follow-up", prompt: "A buyer tried a granola sample. What should we do next?", answer: "Follow up kindly", choices: ["Follow up kindly", "Never talk again", "Hide the sample"] },
  { title: "Brand story", prompt: "What helps people remember our granola?", answer: "A clear brand story", choices: ["A clear brand story", "No information", "A messy note"] },
  { title: "Marketing", prompt: "What is marketing?", answer: "Helping people learn about our granola", choices: ["Helping people learn about our granola", "Keeping it secret", "Throwing papers away"] },
  { title: "Sales", prompt: "What is sales?", answer: "Helping buyers decide if granola is a good fit", choices: ["Helping buyers decide if granola is a good fit", "Ignoring buyers", "Changing the weather"] },
  { title: "Co-packer role", prompt: "Who makes the granola for our business?", answer: "Our co-packer", choices: ["Our co-packer", "The buyer", "The delivery truck"] },
  { title: "End customer", prompt: "Who is the end customer?", answer: "The person who eats the granola", choices: ["The person who eats the granola", "The shelf", "The box"] },
  { title: "Buyer question", prompt: "A buyer asks about our granola. What should Zamaan do first?", answer: "Listen carefully", choices: ["Listen carefully", "Talk over them", "Walk away"] },
  { title: "Good follow-up", prompt: "Which follow-up message sounds best?", answer: "Thank you for trying our granola.", choices: ["Thank you for trying our granola.", "Do not answer me.", "I forgot everything."] },
  { title: "Sales meeting", prompt: "Before talking to a buyer, what should we know?", answer: "Our granola story", choices: ["Our granola story", "A random song", "Nothing at all"] },
  { title: "Customer feedback", prompt: "An end customer says they like the granola. What should we say?", answer: "Thank you for the feedback.", choices: ["Thank you for the feedback.", "That does not matter.", "Stop talking."] },
  { title: "Next buyer step", prompt: "After a buyer is interested, what is a good next step?", answer: "Ask about the next order step", choices: ["Ask about the next order step", "Forget their name", "Close the computer"] },
  { title: "Business focus", prompt: "What does Zamaan practice for the granola business?", answer: "Sales, marketing, and buyer care", choices: ["Sales, marketing, and buyer care", "Making shoes", "Fixing phones"] }
];

const pronounPracticeDecks = [
  { title: "My brother", prompt: "Keyaan is Zamaan's ____.", answer: "brother", choices: ["brother", "son", "dad"] },
  { title: "Mom's son", prompt: "Mom says, 'Keyaan is my son.' Who is Keyaan to Mom?", answer: "son", choices: ["son", "brother", "uncle"] },
  { title: "My cousin", prompt: "Marcus is Zamaan's ____.", answer: "cousin", choices: ["cousin", "son", "grandmother"] },
  { title: "Her cousin", prompt: "Jasmine is a girl. For Zamaan, Jasmine is his ____.", answer: "cousin", choices: ["cousin", "brother", "dad"] },
  { title: "Grandmother", prompt: "Zamaan can say, 'She is my grandmother.' Who is she?", answer: "Grandmother", choices: ["Grandmother", "Keyaan", "Harold"] },
  { title: "My grandmothers", prompt: "Zamaan's grandmothers are his ____.", answer: "family", choices: ["family", "buyers", "co-packers"] },
  { title: "My friend", prompt: "Harold is Zamaan's ____.", answer: "friend", choices: ["friend", "son", "mom"] },
  { title: "His friend", prompt: "Aaron is a boy. For Zamaan, Aaron is his ____.", answer: "friend", choices: ["friend", "grandmother", "brother"] },
  { title: "Another friend", prompt: "David is Zamaan's ____.", answer: "friend", choices: ["friend", "son", "dad"] },
  { title: "Our family", prompt: "Zamaan and Keyaan are ____.", answer: "brothers", choices: ["brothers", "customers", "co-packers"] },
  { title: "Mom's children", prompt: "Zamaan and Keyaan are Mom's ____.", answer: "sons", choices: ["sons", "brothers", "buyers"] },
  { title: "I am", prompt: "Zamaan can say, 'I am Mom's ____.'", answer: "son", choices: ["son", "brother", "mom"] },
  { title: "He is", prompt: "Zamaan can say, 'Keyaan is my ____.'", answer: "brother", choices: ["brother", "son", "mom"] },
  { title: "Family or friend", prompt: "Which sentence is right for Zamaan?", answer: "Harold is my friend.", choices: ["Harold is my friend.", "Harold is my son.", "Harold is my grandmother."] }
];

const sentenceFrames = [
  {
    first: "Who + What: I was with ___. We ___.",
    third: "Who + What: Zamaan was with ___. They ___."
  },
  {
    first: "Where + When: I went to ___ in the morning / afternoon / evening.",
    third: "Where + When: Zamaan went to ___ in the morning / afternoon / evening."
  },
  {
    first: "How + Why: I felt ___. I felt that way because ___.",
    third: "How + Why: Zamaan felt ___. He felt that way because ___."
  }
];

const answerStyleHints = {
  first: {
    label: "I / my answer",
    hint: "Example: I went to Paris with Mom.",
    placeholder: "Try 1 or 2 sentences. Example: I went to Paris with Mom."
  },
  third: {
    label: "Zamaan answer",
    hint: "Example: Zamaan went to Paris with Mom.",
    placeholder: "Try 1 or 2 sentences. Example: Zamaan went to Paris with Mom."
  }
};

function getDifficultyLevel() {
  const savedLevel = Number(localStorage.getItem("dailyAdventureDifficulty") || "2");
  return [1, 2, 3].includes(savedLevel) ? savedLevel : 2;
}

function saveDifficultyLevel(level) {
  const normalizedLevel = [1, 2, 3].includes(Number(level)) ? String(level) : "2";
  localStorage.setItem("dailyAdventureDifficulty", normalizedLevel);
}

function isFocusModeEnabled() {
  return localStorage.getItem("dailyAdventureFocusMode") !== "off";
}

function saveFocusMode(enabled) {
  localStorage.setItem("dailyAdventureFocusMode", enabled ? "on" : "off");
}

function getDifficultyLabel() {
  const level = getDifficultyLevel();
  if (level === 1) return "Level 1 - more support";
  if (level === 3) return "Level 3 - more challenge";
  return "Level 2 - current level";
}

function getPlanLabel() {
  return `${todayPlan.name} · ${getDifficultyLabel()}`;
}

function getMoneyMathForDifficulty(baseDeck, level, dayIndex) {
  if (level === 1) {
    const simpleDecks = [
      [
        { title: "One more dollar", prompt: "You have $1 and get $1 more. How much money?", answer: "$2", choices: ["$1", "$2", "$3"] },
        { title: "Small change", prompt: "You have $3. You spend $1. How much is left?", answer: "$2", choices: ["$1", "$2", "$3"] },
        { title: "Two snacks", prompt: "One snack costs $1. Two snacks cost how much?", answer: "$2", choices: ["$1", "$2", "$3"] }
      ],
      [
        { title: "Count dollars", prompt: "$2 plus $1 equals how much?", answer: "$3", choices: ["$2", "$3", "$4"] },
        { title: "Pay exact", prompt: "The item costs $2. Which money pays exactly $2?", answer: "$2", choices: ["$1", "$2", "$5"] },
        { title: "Money left", prompt: "You have $4. You spend $2. How much is left?", answer: "$2", choices: ["$1", "$2", "$3"] }
      ]
    ];
    return simpleDecks[dayIndex % simpleDecks.length];
  }

  if (level === 3) {
    const challengeDecks = [
      [
        { title: "Granola order", prompt: "A buyer orders 2 cases at $6 each. How much total?", answer: "$12", choices: ["$10", "$12", "$14"] },
        { title: "Buyer change", prompt: "The sample pack costs $7. The buyer pays $20. How much change?", answer: "$13", choices: ["$11", "$13", "$15"] },
        { title: "Two-step sale", prompt: "You sell one bag for $5 and two bars for $3 each. How much total?", answer: "$11", choices: ["$8", "$11", "$13"] }
      ],
      [
        { title: "Marketing budget", prompt: "You have $15. You spend $6 on flyers. How much is left?", answer: "$9", choices: ["$7", "$9", "$11"] },
        { title: "Repeat order", prompt: "A cafe buys 3 boxes at $4 each. How much total?", answer: "$12", choices: ["$10", "$12", "$16"] },
        { title: "Savings goal", prompt: "You saved $8 and need $15. How much more do you need?", answer: "$7", choices: ["$5", "$7", "$9"] }
      ]
    ];
    return challengeDecks[dayIndex % challengeDecks.length];
  }

  return baseDeck;
}

function applyExternalQuestionBank(questionBank) {
  if (!questionBank || typeof questionBank !== "object") return;

  const extraDays = Array.isArray(questionBank.curriculum)
    ? questionBank.curriculum
    : Array.isArray(questionBank.days)
      ? questionBank.days
      : [];
  extraDays.forEach((day) => {
    if (day && day.name && Array.isArray(day.brain) && Array.isArray(day.life) && Array.isArray(day.talk) && day.mini) {
      curriculum.push(day);
    }
  });

  if (Array.isArray(questionBank.languageDecks)) {
    questionBank.languageDecks.forEach((deck) => {
      if (Array.isArray(deck) && deck.length) languageDecks.push(deck);
    });
  }

  if (Array.isArray(questionBank.moneyMathDecks)) {
    questionBank.moneyMathDecks.forEach((deck) => {
      if (Array.isArray(deck) && deck.length) moneyMathDecks.push(deck);
    });
  }

  if (Array.isArray(questionBank.businessPracticeDecks)) {
    questionBank.businessPracticeDecks.forEach((question) => {
      if (question && question.title && question.prompt && question.answer && Array.isArray(question.choices)) {
        businessPracticeDecks.push(question);
      }
    });
  }

  if (Array.isArray(questionBank.pronounPracticeDecks)) {
    questionBank.pronounPracticeDecks.forEach((question) => {
      if (question && question.title && question.prompt && question.answer && Array.isArray(question.choices)) {
        pronounPracticeDecks.push(question);
      }
    });
  }
}

const externalQuestionBank = loadExternalQuestionBank();
applyExternalQuestionBank(externalQuestionBank);
const activeDayIndex = curriculumDay % curriculum.length;
const activeCycleLength = curriculum.length;
const activeDayNumber = activeDayIndex + 1;

const todayPlan = curriculum[activeDayIndex];
const todayLanguage = languageDecks[activeDayIndex % languageDecks.length];
const todayMoneyMath = getMoneyMathForDifficulty(moneyMathDecks[activeDayIndex % moneyMathDecks.length], getDifficultyLevel(), activeDayIndex);
const todayBusinessPractice = businessPracticeDecks[activeDayIndex % businessPracticeDecks.length];
const todayPronounPractice = pronounPracticeDecks[activeDayIndex % pronounPracticeDecks.length];

const title = document.querySelector("#page-title");
const todayLabel = document.querySelector("#todayLabel");
const progressCount = document.querySelector("#progressCount");
const progressBar = document.querySelector("#progressBar");
const roundsLeftLabel = document.querySelector("#roundsLeftLabel");
const todayPath = document.querySelector("#todayPath");
const celebration = document.querySelector("#celebration");
const stars = [...document.querySelectorAll(".star")];
const activities = [...document.querySelectorAll(".activity")];
const talkPrompt = document.querySelector("#talkPrompt");
const talkAnswer = document.querySelector("#talkAnswer");
const sentenceExamples = document.querySelector("#sentenceExamples");
const answerStyleButtons = [...document.querySelectorAll("[data-answer-style]")];
const answerStyleHint = document.querySelector("#answerStyleHint");
const languagePrompt = document.querySelector("#languagePrompt");
const languageWord = document.querySelector("#languageWord");
const languageChoices = document.querySelector(".language-choices");
const caregiverToggle = document.querySelector(".caregiver-toggle");
const caregiverPanel = document.querySelector("#caregiver-panel");
const nameInput = document.querySelector("#nameInput");
const difficultyInput = document.querySelector("#difficultyInput");
const focusModeInput = document.querySelector("#focusModeInput");
const largeTextInput = document.querySelector("#largeTextInput");
const highContrastInput = document.querySelector("#highContrastInput");
const extraHintsInput = document.querySelector("#extraHintsInput");
const reduceMotionInput = document.querySelector("#reduceMotionInput");
const replayAudioInput = document.querySelector("#replayAudioInput");
const promptInput = document.querySelector("#promptInput");
const messageInput = document.querySelector("#messageInput");
const pinInput = document.querySelector("#pinInput");
const whatsappPhoneInput = document.querySelector("#whatsappPhoneInput");
const resetProgress = document.querySelector("#resetProgress");
const lockApp = document.querySelector("#lockApp");
const memoryGame = document.querySelector("[data-memory-game]");
const sequenceGame = document.querySelector("[data-sequence-game]");
const miniGames = document.querySelector(".mini-games");
const pinGate = document.querySelector("#pinGate");
const pinMessage = document.querySelector("#pinMessage");
const pinDots = [...document.querySelectorAll("#pinDisplay span")];
const reportSummary = document.querySelector("#reportSummary");
const reportList = document.querySelector("#reportList");
const syncUrlInput = document.querySelector("#syncUrlInput");
const familyCodeInput = document.querySelector("#familyCodeInput");
const familyCodeRevealButton = document.createElement("button");
const syncStatus = document.querySelector("#syncStatus");
const lastSyncStatus = document.querySelector("#lastSyncStatus");
const shareSyncSetup = document.querySelector("#shareSyncSetup");
const copySyncSetup = document.querySelector("#copySyncSetup");
const syncSetupCode = document.querySelector("#syncSetupCode");
const copySyncCode = document.querySelector("#copySyncCode");
const importSyncCode = document.querySelector("#importSyncCode");
const testSync = document.querySelector("#testSync");
const loadParentView = document.querySelector("#loadParentView");
const parentViewStatus = document.querySelector("#parentViewStatus");
const parentViewResults = document.querySelector("#parentViewResults");
const levelBadge = document.querySelector("#levelBadge");
const soundToggle = document.querySelector("#soundToggle");
const toggleExtraGames = document.querySelector("#toggleExtraGames");
const extraGames = document.querySelector("#extraGames");
const gamesDescription = document.querySelector("#gamesDescription");
const movementBreak = document.querySelector("#movementBreak");
const startMovementBreak = document.querySelector("#startMovementBreak");
const skipMovementBreak = document.querySelector("#skipMovementBreak");
const movementTimer = document.querySelector("#movementTimer");
const completionPanel = document.querySelector("#completionPanel");
const sendCompletionUpdate = document.querySelector("#sendCompletionUpdate");
const shareCompletionUpdate = document.querySelector("#shareCompletionUpdate");
const parentNoteInput = document.querySelector("#parentNoteInput");
const hasDailyPage = Boolean(document.querySelector("[data-complete-talk]"));

let memoryPicks = [];
let sequenceStep = 1;
let enteredPin = "";
let selectedAnswerStyle = "first";
let latestParentViewData = null;
let movementInterval = null;
const sortPicks = new Set();
const retryCounts = new Map();
const accessibilityDefaults = {
  largeText: false,
  highContrast: false,
  extraHints: false,
  reduceMotion: false,
  replayAudio: true
};

function save() {
  localStorage.setItem("dailyAdventure", JSON.stringify(state));
}

function saveHistory() {
  localStorage.setItem("dailyAdventureHistory", JSON.stringify(history));
}

function saveLogs() {
  localStorage.setItem("dailyAdventureLogs", JSON.stringify(activityLogs));
}

function isSoundEnabled() {
  return localStorage.getItem("dailyAdventureSound") !== "off";
}

function saveSoundEnabled(enabled) {
  localStorage.setItem("dailyAdventureSound", enabled ? "on" : "off");
}

function getWhatsappPhone() {
  return localStorage.getItem("dailyAdventureWhatsappPhone") || "";
}

function saveWhatsappPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  localStorage.setItem("dailyAdventureWhatsappPhone", digits);
}

function getAccessibilitySettings() {
  try {
    const saved = JSON.parse(localStorage.getItem("dailyAdventureAccessibility") || "{}");
    return { ...accessibilityDefaults, ...saved };
  } catch (error) {
    return { ...accessibilityDefaults };
  }
}

function saveAccessibilitySettings(settings) {
  localStorage.setItem("dailyAdventureAccessibility", JSON.stringify({
    ...accessibilityDefaults,
    ...settings
  }));
  applyAccessibilitySettings();
}

function applyAccessibilitySettings() {
  const settings = getAccessibilitySettings();
  document.body.classList.toggle("a11y-large-text", settings.largeText);
  document.body.classList.toggle("a11y-high-contrast", settings.highContrast);
  document.body.classList.toggle("a11y-reduce-motion", settings.reduceMotion);
  document.body.classList.toggle("a11y-extra-hints", settings.extraHints);
  document.body.classList.toggle("a11y-replay-audio", settings.replayAudio);

  if (largeTextInput) largeTextInput.checked = settings.largeText;
  if (highContrastInput) highContrastInput.checked = settings.highContrast;
  if (extraHintsInput) extraHintsInput.checked = settings.extraHints;
  if (reduceMotionInput) reduceMotionInput.checked = settings.reduceMotion;
  if (replayAudioInput) replayAudioInput.checked = settings.replayAudio;
}

function isExtraHintsEnabled() {
  return getAccessibilitySettings().extraHints;
}

function isReplayAudioEnabled() {
  return getAccessibilitySettings().replayAudio;
}

function getScrollBehavior() {
  return getAccessibilitySettings().reduceMotion ? "auto" : "smooth";
}

function getRetryFeedback(key, hint, correctAnswer) {
  const attempts = (retryCounts.get(key) || 0) + 1;
  retryCounts.set(key, attempts);
  if (attempts === 1 && !isExtraHintsEnabled()) return "Good try. Try again.";
  if (attempts <= (isExtraHintsEnabled() ? 1 : 2)) return `Here is a hint: ${hint}`;
  return `The answer is ${correctAnswer}. Tap it to continue.`;
}

function getRetryAttemptCount(key) {
  return retryCounts.get(key) || 0;
}

function clearRetry(key) {
  retryCounts.delete(key);
}

function getSyncConfig() {
  return {
    url: localStorage.getItem("dailyAdventureSyncUrl") || "",
    familyCode: localStorage.getItem("dailyAdventureFamilyCode") || ""
  };
}

function saveSyncConfig() {
  if (!syncUrlInput || !familyCodeInput) return;
  localStorage.setItem("dailyAdventureSyncUrl", syncUrlInput.value.trim());
  localStorage.setItem("dailyAdventureFamilyCode", familyCodeInput.value.trim());
  updateSyncStatus();
}

function setupFamilyCodeReveal() {
  if (!familyCodeInput || familyCodeRevealButton.isConnected) return;

  const wrapper = document.createElement("div");
  wrapper.className = "secret-input-row";
  familyCodeInput.parentNode.insertBefore(wrapper, familyCodeInput);
  wrapper.appendChild(familyCodeInput);

  familyCodeRevealButton.type = "button";
  familyCodeRevealButton.className = "secret-toggle";
  familyCodeRevealButton.textContent = "Show 👁";
  familyCodeRevealButton.setAttribute("aria-label", "Show family code");
  familyCodeRevealButton.addEventListener("click", () => {
    const willShow = familyCodeInput.type === "password";
    familyCodeInput.type = willShow ? "text" : "password";
    familyCodeRevealButton.textContent = willShow ? "Hide 🙈" : "Show 👁";
    familyCodeRevealButton.setAttribute("aria-label", willShow ? "Hide family code" : "Show family code");
  });

  wrapper.appendChild(familyCodeRevealButton);
}

function updateSyncStatus() {
  if (!syncStatus) return;
  const { url, familyCode } = getSyncConfig();
  syncStatus.textContent = url && familyCode
    ? "Sync is set up. New completed rounds will be sent to the private Sheet."
    : "Sync is not set up yet.";
  updateLastSyncStatus();
}

function updateLastSyncStatus() {
  if (!lastSyncStatus) return;

  const lastSyncedAt = localStorage.getItem("dailyAdventureLastSyncedAt");
  lastSyncStatus.textContent = lastSyncedAt
    ? `Last synced: ${new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(lastSyncedAt))}`
    : "Last synced: never";
}

function markLastSynced() {
  localStorage.setItem("dailyAdventureLastSyncedAt", new Date().toISOString());
  updateLastSyncStatus();
}

function encodeSetupData(data) {
  return btoa(JSON.stringify(data));
}

function decodeSetupData(value) {
  return JSON.parse(atob(value));
}

function getSetupLink() {
  const syncUrl = syncUrlInput?.value.trim() || getSyncConfig().url;
  const familyCode = familyCodeInput?.value.trim() || getSyncConfig().familyCode;

  if (!syncUrl || !familyCode) {
    if (syncStatus) {
      syncStatus.textContent = "Add the Sync web app URL and family code first. Then send the iPhone setup link.";
    }
    return "";
  }

  const setupData = encodeURIComponent(encodeSetupData({ syncUrl, familyCode }));
  return `${window.location.href.split("#")[0]}#syncSetup=${setupData}`;
}

function getSetupCode() {
  const syncUrl = syncUrlInput?.value.trim() || getSyncConfig().url;
  const familyCode = familyCodeInput?.value.trim() || getSyncConfig().familyCode;

  if (!syncUrl || !familyCode) {
    if (syncStatus) {
      syncStatus.textContent = "Add the Sync web app URL and family code first. Then copy the setup code.";
    }
    return "";
  }

  return encodeSetupData({ syncUrl, familyCode });
}

function saveDecodedSetup(setup) {
  if (!setup.syncUrl || !setup.familyCode) return false;

  localStorage.setItem("dailyAdventureSyncUrl", setup.syncUrl);
  localStorage.setItem("dailyAdventureFamilyCode", setup.familyCode);

  if (syncUrlInput) {
    syncUrlInput.value = setup.syncUrl;
  }
  if (familyCodeInput) {
    familyCodeInput.value = setup.familyCode;
  }

  updateSyncStatus();
  return true;
}

function applyIncomingSyncSetup() {
  const hash = window.location.hash.slice(1);
  if (!hash) return false;

  const params = new URLSearchParams(hash);
  const setupData = params.get("syncSetup");
  if (!setupData) return false;

  try {
    const setup = decodeSetupData(decodeURIComponent(setupData));
    if (!saveDecodedSetup(setup)) return false;
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    return true;
  } catch {
    return false;
  }
}

async function copySetupCode() {
  saveSyncConfig();
  const setupCode = getSetupCode();
  if (!setupCode) return;

  if (syncSetupCode) {
    syncSetupCode.value = setupCode;
  }

  try {
    await copyTextToClipboard(setupCode);
    if (syncStatus) {
      syncStatus.textContent = "Setup code copied. Open the Home Screen app, paste it here, then tap Import setup code.";
    }
  } catch {
    if (syncStatus) {
      syncStatus.textContent = "Setup code is ready. Select it and copy it manually.";
    }
  }
}

function importSetupCode() {
  const setupCode = syncSetupCode?.value.trim();
  if (!setupCode) {
    if (syncStatus) {
      syncStatus.textContent = "Paste the setup code first, then tap Import setup code.";
    }
    return;
  }

  try {
    const setup = decodeSetupData(setupCode);
    if (!saveDecodedSetup(setup)) throw new Error("Missing setup values");
    if (syncStatus) {
      syncStatus.textContent = "Sync settings restored on this Home Screen app.";
    }
  } catch {
    if (syncStatus) {
      syncStatus.textContent = "That setup code did not work. Copy a fresh setup code from Safari.";
    }
  }
}

function sendTestSync() {
  saveSyncConfig();
  const { url, familyCode } = getSyncConfig();

  if (!url || !familyCode) {
    if (syncStatus) {
      syncStatus.textContent = "Add the Sync web app URL and family code first. Then tap Test sync.";
    }
    return;
  }

  const completedAt = new Date().toISOString();
  sendSyncPayload({
    date: todayKey,
    childName: state.name,
    mood: state.mood,
    curriculumDay: activeDayNumber,
    plan: getPlanLabel(),
    section: "Sync Test",
    round: "",
    title: "Caregiver Sync Test",
    prompt: "This is a caregiver test row.",
    answer: "If you see this row, sync is connected.",
    completedAt
  }, "Test sync sent. Check the Daily Adventure Log tab.");
}

function getParentViewUrl() {
  const { url, familyCode } = getSyncConfig();
  if (!url || !familyCode) return "";

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}mode=parentView&familyCode=${encodeURIComponent(familyCode)}`;
}

async function loadParentViewData() {
  saveSyncConfig();
  const parentUrl = getParentViewUrl();

  if (!parentUrl) {
    if (parentViewStatus) {
      parentViewStatus.textContent = "Add the Sync web app URL and family code first.";
    }
    return;
  }

  if (parentViewStatus) {
    parentViewStatus.textContent = "Loading parent view from the private Sheet...";
  }

  try {
    const response = await fetch(parentUrl, { method: "GET" });
    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.error || "Parent view did not load.");
    }

    latestParentViewData = data;
    renderParentView(data);
    if (parentViewStatus) {
      parentViewStatus.textContent = `Loaded ${formatShortDateTime(data.updatedAt)}.`;
    }
  } catch {
    if (parentViewStatus) {
      parentViewStatus.textContent = "Could not load parent view. Check the Web App URL, family code, and Apps Script deployment.";
    }
  }
}

function logLearningAttempt(gameName, titleText, promptText, selectedAnswer, correctAnswer, isCorrect, detail = {}) {
  const result = isCorrect ? "Correct" : "Try again";
  const notes = [];
  if (detail.attempts) notes.push(`Attempts: ${detail.attempts}`);
  if (detail.hintShown) notes.push("Hint shown: yes");
  if (detail.answerShown) notes.push("Answer shown: yes");
  if (detail.card) notes.push(`Card: ${detail.card}`);
  sendSyncPayload({
    date: todayKey,
    childName: state.name,
    mood: state.mood,
    curriculumDay: activeDayNumber,
    plan: getPlanLabel(),
    section: "Learning Game Attempt",
    round: "",
    title: `${gameName}: ${titleText}`,
    prompt: promptText,
    answer: [
      `Selected: ${selectedAnswer}`,
      `Correct: ${correctAnswer}`,
      `Result: ${result}`,
      ...notes
    ].join(" | "),
    completedAt: new Date().toISOString()
  }, "Learning game attempt sent to the private Sheet.");
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

async function shareOrCopySetupLink(preferShare = false) {
  saveSyncConfig();
  const setupLink = getSetupLink();
  if (!setupLink) return;

  const message = `Open this on the iPhone to connect Daily Adventure to the private Google Sheet:\n${setupLink}`;

  try {
    if (preferShare && navigator.share) {
      await navigator.share({
        title: "Daily Adventure setup",
        text: message
      });
      if (syncStatus) {
        syncStatus.textContent = "Setup link is ready to send. Choose Messages or another app.";
      }
      return;
    }

    await copyTextToClipboard(message);
    if (syncStatus) {
      syncStatus.textContent = "Setup link copied. Paste it into iMessage, email, or Notes.";
    }
  } catch {
    if (syncStatus) {
      syncStatus.textContent = "Could not copy automatically. Try Copy setup link again.";
    }
  }
}

function getTodayLogs() {
  if (!activityLogs[todayKey]) {
    activityLogs[todayKey] = [];
  }
  return activityLogs[todayKey];
}

function getCompletedSectionNames() {
  return sectionIds
    .filter((id) => state.rounds[id] >= maxRounds[id])
    .map(labelFor);
}

function getTalkTimeSummaries() {
  return getTodayLogs()
    .filter((entry) => entry.section === "talk")
    .map((entry) => {
      const prompt = String(entry.prompt || "").replace(/\s*Answer style:.*$/i, "").trim();
      const answer = String(entry.answer || "");
      const typedMatch = answer.match(/Answer:\s*(.+)$/);

      return {
        prompt,
        answer: typedMatch && typedMatch[1]
          ? typedMatch[1].trim()
          : "I said my Talk Time answer out loud."
      };
    });
}

function buildCompletionUpdateMessage() {
  const completedSections = getCompletedSectionNames();
  const talkTimeSummaries = getTalkTimeSummaries();
  const talkTimeLines = talkTimeSummaries.flatMap((summary, index) => [
    `Talk Time ${index + 1}:`,
    `Question: ${summary.prompt}`,
    `My answer: ${summary.answer}`
  ]);
  const mood = state.mood || "not picked";
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric"
  }).format(new Date());

  return [
    `Hi Mom and Dad, I finished my Daily Adventure today.`,
    ``,
    `Date: ${dateLabel}`,
    `I completed ${getRoundTotal()} of ${totalRounds} rounds.`,
    `Stars earned: ${state.completed.length} of 4`,
    `Mood: ${mood}`,
    `I practiced: ${completedSections.join(", ") || "my daily activities"}.`,
    talkTimeLines.length ? `` : null,
    talkTimeLines.length ? `My Talk Time:` : null,
    ...talkTimeLines,
    ``,
    `I did it!`,
    `Love, ${state.name}`
  ].filter((line) => line !== null).join("\n");
}

async function shareCompletionMessage() {
  const message = buildCompletionUpdateMessage();

  if (navigator.share) {
    await navigator.share({
      title: "Daily Adventure update",
      text: message
    });
    return;
  }

  await copyTextToClipboard(message);
  if (celebration) {
    celebration.textContent = "Update copied. Paste it into WhatsApp or Messages.";
  }
}

function openWhatsappCompletionMessage() {
  if (getRoundTotal() < totalRounds) return;

  const message = encodeURIComponent(buildCompletionUpdateMessage());
  const phone = getWhatsappPhone();
  const whatsappUrl = phone
    ? `whatsapp://send?phone=${phone}&text=${message}`
    : `whatsapp://send?text=${message}`;
  window.location.href = whatsappUrl;
}

function addActivityLog(entry) {
  const savedEntry = {
    ...entry,
    completedAt: new Date().toISOString()
  };

  getTodayLogs().push(savedEntry);
  saveLogs();
  syncActivityLog(savedEntry);
}

function syncActivityLog(entry) {
  const { url, familyCode } = getSyncConfig();
  if (!url || !familyCode) return;

  const payload = {
    familyCode,
    date: todayKey,
    childName: state.name,
    mood: state.mood,
    curriculumDay: activeDayNumber,
    plan: getPlanLabel(),
    section: labelFor(entry.section),
    round: entry.round,
    title: entry.title,
    prompt: entry.prompt,
    answer: entry.answer,
    completedAt: entry.completedAt
  };

  sendSyncPayload(payload, "Last completed round was sent to the private Sheet.");
}

function sendSyncPayload(payload, successMessage) {
  const { url, familyCode } = getSyncConfig();
  if (!url || !familyCode) {
    if (syncStatus) {
      syncStatus.textContent = "Sync is not set up yet.";
    }
    return;
  }

  fetch(url, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify({ ...payload, familyCode })
  }).then(() => {
    markLastSynced();
    if (syncStatus) {
      syncStatus.textContent = successMessage;
    }
  }).catch(() => {
    if (syncStatus) {
      syncStatus.textContent = "Could not sync just now. The app saved it on this device.";
    }
  });
}

function getAppPin() {
  return localStorage.getItem("dailyAdventurePin") || "1234";
}

function saveAppPin(pin) {
  localStorage.setItem("dailyAdventurePin", pin);
}

function showPinGate() {
  enteredPin = "";
  updatePinDisplay();
  if (pinMessage) {
    pinMessage.textContent = "";
  }
  document.body.classList.add("locked");
}

function unlockApp() {
  sessionStorage.setItem("dailyAdventureUnlocked", "true");
  document.body.classList.remove("locked");
  const welcomeMessage = `Welcome, ${state.name}. Ready for today's adventure?`;
  if (celebration) {
    celebration.textContent = welcomeMessage;
  }
  speak(welcomeMessage, "welcome");
}

function updatePinDisplay() {
  pinDots.forEach((dot, index) => {
    dot.classList.toggle("filled", index < enteredPin.length);
  });
}

function checkPin() {
  if (enteredPin === getAppPin()) {
    unlockApp();
    return;
  }

  if (pinMessage) {
    pinMessage.textContent = "Try again.";
  }
  speak("Try again.", "incorrect");
  enteredPin = "";
  updatePinDisplay();
}

function resolveVoicePrompt(promptKey) {
  const prompt = voicePrompts[promptKey];
  if (!Array.isArray(prompt)) {
    return prompt;
  }

  const storageKey = `dailyAdventureVoiceIndex-${promptKey}`;
  const currentIndex = Number(localStorage.getItem(storageKey) || "0");
  const safeIndex = Number.isFinite(currentIndex) ? currentIndex : 0;
  const audioPath = prompt[safeIndex % prompt.length];
  localStorage.setItem(storageKey, String(safeIndex + 1));
  return audioPath;
}

function speak(_text, promptKey = "") {
  if (!isSoundEnabled()) return;

  const audioPath = resolveVoicePrompt(promptKey);
  if (!audioPath) {
    return;
  }

  try {
    if (currentVoicePrompt) {
      currentVoicePrompt.pause();
      currentVoicePrompt.currentTime = 0;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    currentVoicePrompt = getHiddenVoicePlayer();
    currentVoicePrompt.removeAttribute("controls");
    currentVoicePrompt.src = audioPath;
    currentVoicePrompt.currentTime = 0;
    currentVoicePrompt.play().catch(() => {});
  } catch (error) {
    // Stay quiet if a natural audio clip cannot play.
  }
}

function getRoundTotal() {
  return sectionIds.reduce((total, id) => total + state.rounds[id], 0);
}

function completeSection(id) {
  if (!state.completed.includes(id)) {
    state.completed.push(id);
  }
}

function completeRound(id, message, detail = {}) {
  const roundNumber = Math.min(state.rounds[id] + 1, maxRounds[id]);

  if (state.rounds[id] < maxRounds[id]) {
    state.rounds[id] += 1;
  }

  if (state.rounds[id] >= maxRounds[id]) {
    completeSection(id);
  }

  addActivityLog({
    section: id,
    round: roundNumber,
    title: detail.title || labelFor(id),
    prompt: detail.prompt || "",
    answer: detail.answer || ""
  });
  save();
  updateProgress();
  updateHistory();
  renderCaregiverReport();
  window.setTimeout(() => {
    const activeActivity = document.querySelector(".activity.active:not([hidden])");
    if (activeActivity) activeActivity.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
  }, 900);
  const doneRounds = getRoundTotal();
  const roundsLeft = Math.max(totalRounds - doneRounds, 0);
  const progressMessage = roundsLeft > 0 ? `${message} ${roundsLeft} round${roundsLeft === 1 ? "" : "s"} left.` : message;
  const progressVoice = doneRounds === totalRounds
    ? "finished"
    : doneRounds === Math.floor(totalRounds / 2)
      ? "halfwayDone"
      : roundsLeft <= 2
        ? "almostDone"
        : detail.voiceKey || "correct";
  speak(doneRounds === totalRounds
    ? `Congratulations, ${state.name}. You finished today's adventure.`
    : progressMessage, progressVoice);
}

function nextActivityId() {
  return sectionIds.find((id) => !state.completed.includes(id)) || "talk";
}

function updateGreeting() {
  if (title) {
    title.textContent = `Hi, ${state.name}. Ready for today's adventure?`;
  }
  const intro = document.querySelector(".intro");
  if (intro) {
    intro.textContent = `Today is Day ${activeDayNumber} of ${activeCycleLength}: ${todayPlan.name}. ${getDifficultyLabel()}. Finish the four short sections, then unlock extra learning games.`;
  }
  if (nameInput) {
    nameInput.value = state.name;
  }
  if (difficultyInput) {
    difficultyInput.value = String(getDifficultyLevel());
  }
  if (focusModeInput) {
    focusModeInput.checked = isFocusModeEnabled();
  }
  if (levelBadge) {
    levelBadge.textContent = `Level ${getDifficultyLevel()}`;
  }
  if (soundToggle) {
    const enabled = isSoundEnabled();
    soundToggle.textContent = enabled ? "Sound on" : "Sound off";
    soundToggle.setAttribute("aria-pressed", String(enabled));
  }
  if (parentNoteInput) {
    parentNoteInput.value = localStorage.getItem("dailyAdventureParentNote") || "";
  }
  if (promptInput) {
    promptInput.value = state.talkPrompt;
  }
  if (messageInput) {
    messageInput.value = state.message;
  }
  if (pinInput) {
    pinInput.value = getAppPin();
  }
  if (whatsappPhoneInput) {
    whatsappPhoneInput.value = getWhatsappPhone();
  }
  if (syncUrlInput) {
    syncUrlInput.value = getSyncConfig().url;
  }
  if (familyCodeInput) {
    familyCodeInput.value = getSyncConfig().familyCode;
  }
  updateSyncStatus();
}

function addReplayButton(activity, promptKey, label) {
  if (!activity) return;

  const existing = activity.querySelector(".replay-audio-button");
  if (!isReplayAudioEnabled()) {
    if (existing) existing.remove();
    return;
  }

  const header = activity.querySelector(".activity-header");
  if (!header || existing) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "replay-audio-button";
  button.textContent = "Listen";
  button.setAttribute("aria-label", `Replay ${label} instructions`);
  button.addEventListener("click", () => speak(label, promptKey));
  header.appendChild(button);
}

function renderTodayPath(nextId) {
  if (!todayPath) return;

  const doneRounds = getRoundTotal();
  todayPath.innerHTML = sectionIds.map((id, index) => {
    const isDone = state.completed.includes(id);
    const isCurrent = id === nextId && doneRounds < totalRounds;
    const round = Math.min(state.rounds[id] + 1, maxRounds[id]);
    const status = isDone ? "Done" : isCurrent ? `Round ${round} of ${maxRounds[id]}` : "Next";
    const classes = ["path-step"];
    if (isDone) classes.push("done");
    if (isCurrent) classes.push("current");

    return `
      <div class="${classes.join(" ")}">
        <span>${index + 1}</span>
        <strong>${labelFor(id)}</strong>
        <small>${status}</small>
      </div>
    `;
  }).join("");
}

function updateExtraGamesAccess(doneRounds) {
  if (!toggleExtraGames || !extraGames) return;

  const focusMode = isFocusModeEnabled();
  const dailyComplete = doneRounds === totalRounds;
  const locked = focusMode && !dailyComplete;
  const extraComplete = areExtraGamesComplete();

  toggleExtraGames.disabled = locked;
  toggleExtraGames.setAttribute("aria-disabled", String(locked));

  if (locked) {
    const roundsLeft = totalRounds - doneRounds;
    extraGames.hidden = true;
    toggleExtraGames.textContent = "Finish daily rounds first";
    toggleExtraGames.setAttribute("aria-expanded", "false");
    if (gamesDescription) {
      gamesDescription.textContent = `Stay with today's path. ${roundsLeft} round${roundsLeft === 1 ? "" : "s"} left, then extra games unlock.`;
    }
    return;
  }

  toggleExtraGames.textContent = extraGames.hidden
    ? extraComplete ? "Review extra path" : "Start extra path"
    : "Hide extra path";
  if (gamesDescription) {
    gamesDescription.textContent = extraComplete
      ? "Extra practice is complete. Now send Mom and Dad the final update."
      : dailyComplete
        ? "Great work finishing today's 12 rounds. Finish each extra activity one at a time."
        : "Extra games are available because Focus Mode is off. Finish each extra activity one at a time.";
  }
}

function updateProgress() {
  if (!progressCount || !progressBar || !celebration) return;

  const doneRounds = getRoundTotal();
  const doneSections = state.completed.length;
  const nextId = nextActivityId();
  const roundsLeft = Math.max(totalRounds - doneRounds, 0);
  progressCount.textContent = `${doneRounds} of ${totalRounds} rounds`;
  if (roundsLeftLabel) {
    roundsLeftLabel.textContent = roundsLeft === 0
      ? "Daily adventure complete"
      : `${roundsLeft} round${roundsLeft === 1 ? "" : "s"} left today`;
  }
  progressBar.style.width = `${(doneRounds / totalRounds) * 100}%`;
  renderTodayPath(nextId);
  updateExtraGamesAccess(doneRounds);

  stars.forEach((star, index) => {
    star.classList.toggle("earned", index < doneSections);
  });

  activities.forEach((activity) => {
    const id = activity.dataset.activity;
    const round = Math.min(state.rounds[id] + 1, maxRounds[id]);
    const type = activity.querySelector(".activity-type");
    const isDone = state.completed.includes(id);

    activity.classList.toggle("done", isDone);
    activity.classList.toggle("active", id === nextId);
    activity.hidden = doneRounds === totalRounds || id !== nextId;
    type.textContent = isDone
      ? `${labelFor(id)} complete`
      : `${labelFor(id)} round ${round} of ${maxRounds[id]}`;
  });

  celebration.textContent = doneRounds === totalRounds
    ? areExtraGamesComplete()
      ? `Congratulations, ${state.name}. ${state.message}`
      : `Great work, ${state.name}. Now finish the extra practice path, one step at a time.`
    : doneRounds > 0
      ? `Good progress. ${roundsLeft} round${roundsLeft === 1 ? "" : "s"} left today.`
      : "Start with Memory. Finish rounds to earn stars and mark the calendar.";

  if (completionPanel) {
    completionPanel.hidden = doneRounds !== totalRounds || !areExtraGamesComplete();
  }

  if (movementBreak && doneRounds >= 6 && doneRounds < totalRounds) {
    const wasHandled = sessionStorage.getItem(`dailyAdventureMovement-${todayKey}`) === "done";
    movementBreak.hidden = wasHandled;
  }
}

function renderCaregiverReport() {
  if (!reportSummary || !reportList) return;

  const logs = getTodayLogs();
  const doneRounds = getRoundTotal();
  const mood = state.mood ? ` Mood: ${state.mood}.` : "";
  reportSummary.textContent = `${doneRounds} of ${totalRounds} rounds completed. Day ${activeDayNumber} of ${activeCycleLength}: ${getPlanLabel()}.${mood}`;

  if (!logs.length) {
    reportList.innerHTML = "";
    return;
  }

  reportList.innerHTML = logs.map((entry) => {
    const time = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(entry.completedAt));
    const answer = entry.answer
      ? `<span class="report-answer">Answer: ${escapeHtml(entry.answer)}</span>`
      : "";

    return `
      <article class="report-item ${entry.section}">
        <small>${time} · ${labelFor(entry.section)} round ${entry.round}</small>
        <strong>${escapeHtml(entry.title)}</strong>
        <span>${escapeHtml(entry.prompt)}</span>
        ${answer}
      </article>
    `;
  }).join("");
}

function renderParentView(data) {
  if (!parentViewResults) return;

  const today = data.today;
  const weeklyTrend = data.weeklyTrend || {};
  const comparison = data.weeklyComparison || {};
  const todayHtml = today
    ? `
      <article class="parent-card parent-card-large highlight">
        <small>Today</small>
        <strong>${escapeHtml(today.rounds)} of ${totalRounds} rounds · ${escapeHtml(today.status)}</strong>
        <span>Mood: ${escapeHtml(today.mood || "Not picked yet")}</span>
        <span>Plan: ${escapeHtml(today.plan || "Daily Adventure")}</span>
        <span>Last completed: ${escapeHtml(today.lastCompleted || "Not yet")}</span>
      </article>
    `
    : `
      <article class="parent-card parent-card-large highlight">
        <small>Today</small>
        <strong>No shared Sheet data for today yet.</strong>
        <span>Once Zamaan completes a round on a synced device, it will appear here.</span>
      </article>
    `;

  const dailyHtml = (data.recentDaily || []).length
    ? data.recentDaily.map((day) => `
      <span class="parent-day ${day.status === "Complete" ? "complete" : "started"}">
        <strong>${escapeHtml(day.date.slice(5))}</strong>
        <small>${escapeHtml(day.rounds)}/${totalRounds}</small>
      </span>
    `).join("")
    : `<p class="parent-empty">No recent daily summaries yet.</p>`;

  const talkHtml = (data.recentTalk || []).length
    ? data.recentTalk.slice(0, 2).map((item) => `
      <article class="parent-list-item">
        <strong>${escapeHtml(item.date)} · ${escapeHtml(item.responseType)}</strong>
        <span>${escapeHtml(item.prompt)}</span>
        <em>${escapeHtml(item.answer || "No typed answer")}</em>
      </article>
    `).join("")
    : `<p class="parent-empty">No Talk Time answers yet.</p>`;

  const attemptsHtml = (data.learningAttempts || []).length
    ? data.learningAttempts.slice(0, 4).map((item) => `
      <article class="parent-list-item">
        <strong>${escapeHtml(item.game)}</strong>
        <span>${escapeHtml(item.correct)} correct out of ${escapeHtml(item.attempts)} attempts · ${escapeHtml(item.accuracy)}</span>
      </article>
    `).join("")
    : `<p class="parent-empty">No extra learning-game attempts yet.</p>`;

  const needsPracticeHtml = (data.needsPractice || []).map((item) => `
    <article class="practice-item">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.detail)}</span>
    </article>
  `).join("");

  const practiceNextHtml = (data.practiceNext || []).length
    ? data.practiceNext.slice(0, 3).map((item) => `
      <article class="practice-next-card">
        <div>
          <small>${escapeHtml(item.masteryStatus)} · Priority ${escapeHtml(item.priorityScore)}</small>
          <strong>${escapeHtml(item.skillArea)}: ${escapeHtml(item.questionText)}</strong>
          <span>${escapeHtml(item.correct || 0)} correct out of ${escapeHtml(item.attempts || 0)} attempts · ${escapeHtml(item.accuracy || "0%")}</span>
        </div>
        <p>${escapeHtml(item.nextPracticeActivity)}</p>
      </article>
    `).join("")
    : `<p class="parent-empty">No priority practice yet. Complete a few learning games to build this list.</p>`;

  const skillTrendsHtml = (data.skillTrends || []).length
    ? data.skillTrends.map((item) => `
      <article class="parent-list-item">
        <strong>${escapeHtml(item.skill)}</strong>
        <span>${escapeHtml(item.correct)} correct out of ${escapeHtml(item.attempts)} attempts · ${escapeHtml(item.accuracy)}</span>
      </article>
    `).join("")
    : `<p class="parent-empty">No skill-level attempts in the last 7 days yet.</p>`;

  const missedQuestionsHtml = (data.missedQuestions || []).length
    ? data.missedQuestions.map((item) => `
      <article class="parent-list-item missed-item">
        <strong>${escapeHtml(item.skill)}</strong>
        <span>${escapeHtml(item.prompt)}</span>
        <small>${escapeHtml(item.misses)} missed attempt${Number(item.misses) === 1 ? "" : "s"}</small>
      </article>
    `).join("")
    : `<p class="parent-empty">No missed-question pattern yet.</p>`;

  parentViewResults.innerHTML = `
    <div class="parent-summary-grid">
      ${todayHtml}
      <article class="parent-card">
        <small>Last 7 days</small>
        <strong>${escapeHtml(weeklyTrend.completeDays || 0)} complete days</strong>
        <span>${escapeHtml(weeklyTrend.rounds || 0)} rounds completed</span>
        <span>${escapeHtml(weeklyTrend.talkAnswers || 0)} recent Talk Time answers</span>
      </article>
      <article class="parent-card">
        <small>Learning games</small>
        <strong>${escapeHtml(data.dashboard.attemptAccuracy)} accuracy</strong>
        <span>${escapeHtml(data.dashboard.correctAttempts)} correct out of ${escapeHtml(data.dashboard.totalAttempts)} attempts</span>
      </article>
    </div>
    <div class="parent-list practice-list">
      <h4>Needs Practice</h4>
      ${needsPracticeHtml}
    </div>
    <div class="parent-list practice-next-list">
      <h4>What to Practice Next</h4>
      ${practiceNextHtml}
    </div>
    <div class="weekly-comparison">
      <h4>This Week vs Last Week</h4>
      <div class="comparison-grid">
        <article><small>Rounds</small><strong>${escapeHtml(comparison.currentRounds || 0)}</strong><span>Last week: ${escapeHtml(comparison.previousRounds || 0)}</span></article>
        <article><small>Complete days</small><strong>${escapeHtml(comparison.currentCompleteDays || 0)}</strong><span>Last week: ${escapeHtml(comparison.previousCompleteDays || 0)}</span></article>
        <article><small>Game accuracy</small><strong>${escapeHtml(comparison.currentAccuracy || "0%")}</strong><span>Last week: ${escapeHtml(comparison.previousAccuracy || "0%")}</span></article>
      </div>
    </div>
    <div class="parent-list">
      <h4>7-Day Check</h4>
      <div class="parent-days">
      ${dailyHtml}
      </div>
    </div>
    <div class="parent-list">
      <h4>Recent Talk Time</h4>
      ${talkHtml}
    </div>
    <div class="parent-list">
      <h4>Learning Games</h4>
      ${attemptsHtml}
    </div>
    <div class="parent-list">
      <h4>Skill Trends</h4>
      ${skillTrendsHtml}
    </div>
    <div class="parent-list">
      <h4>Questions to Review</h4>
      ${missedQuestionsHtml}
    </div>
    <div class="ai-prompt-panel">
      <div>
        <h4>Weekly AI Summary</h4>
        <p>Copy this prompt, then open ChatGPT to continue the parent progress thread.</p>
      </div>
      <div class="ai-actions">
        <button id="copyWeeklyPrompt" class="secondary-button" type="button">Copy weekly AI prompt</button>
        <a class="button-link secondary-button ai-open-link" href="chatgpt://" data-ai-target="chatgpt">Open ChatGPT app</a>
      </div>
      <div class="ai-fallback-actions">
        <a href="https://chatgpt.com/" target="_blank" rel="noopener">ChatGPT web fallback</a>
      </div>
      <textarea id="weeklyPromptPreview" rows="5" readonly>${escapeHtml(buildWeeklyAiPrompt(data))}</textarea>
    </div>
  `;
}

function buildQuestionGeneratorPanel() {
  return `
    <div class="ai-prompt-panel">
      <div>
        <h4>Create New Questions</h4>
        <p>Use this when you want ChatGPT to create the next set of questions. The app automatically rotates through the question file that is already uploaded.</p>
      </div>
      <div class="question-cycle-reminder">
        <strong>Parent reminder:</strong> Start a fresh question set every 2 weeks, or sooner if Zamaan is mastering the current set.
      </div>
      <div class="ai-actions">
        <button id="copyQuestionGeneratorPrompt" class="secondary-button" type="button">Copy ChatGPT prompt</button>
        <a class="button-link secondary-button" href="question-generator-prompt.txt" target="_blank" rel="noopener">Open prompt file</a>
      </div>
      <label>
        ChatGPT Prompt
        <textarea id="questionGeneratorPromptPreview" rows="6" readonly>Tap copy to load the question generator prompt.</textarea>
      </label>
    </div>
  `;
}

function buildWeeklyAiPrompt(data) {
  const dashboard = data.dashboard || {};
  const weeklyTrend = data.weeklyTrend || {};
  const today = data.today;
  const needsPractice = data.needsPractice || [];
  const recentDaily = data.recentDaily || [];
  const recentTalk = data.recentTalk || [];
  const learningAttempts = data.learningAttempts || [];
  const comparison = data.weeklyComparison || {};
  const skillTrends = data.skillTrends || [];
  const missedQuestions = data.missedQuestions || [];
  const practiceNext = data.practiceNext || [];
  const masteryStrengths = data.masteryStrengths || [];
  const parentNote = localStorage.getItem("dailyAdventureParentNote") || "No parent note added.";

  return [
    "You are helping Zamaan's mom and dad understand his Daily Adventure learning progress.",
    "Please use a warm, practical parent-friendly tone. Avoid diagnostic language. Focus on patterns, encouragement, and simple next steps.",
    "Use Skill Mastery first when choosing strengths and practice areas. Practice areas should come from the highest priority_score items, considering mastery_status.",
    "",
    "Please provide:",
    "1. A short weekly progress summary.",
    "2. Three strengths, using Strong or Mastered skill_mastery items when available.",
    "3. Two practice areas, chosen from the highest priority_score skill_mastery items.",
    "4. Patterns in Talk Time, Money Math, Spanish, and Family Words/Pronouns.",
    "5. Top 2 home activities for next week, using next_practice_activity from the priority skills.",
    "",
    "Dashboard:",
    `- Total rounds completed: ${dashboard.totalRounds || 0}`,
    `- Completed days overall: ${dashboard.completedDays || 0}`,
    `- Overall completion rate: ${dashboard.completionRate || "0%"}`,
    `- Learning game attempts: ${dashboard.totalAttempts || 0}`,
    `- Learning game correct: ${dashboard.correctAttempts || 0}`,
    `- Learning game accuracy: ${dashboard.attemptAccuracy || "0%"}`,
    "",
    "Last 7 days:",
    `- Days with activity: ${weeklyTrend.daysUsed || 0}`,
    `- Complete days: ${weeklyTrend.completeDays || 0}`,
    `- Rounds completed: ${weeklyTrend.rounds || 0}`,
    `- Recent Talk Time answers: ${weeklyTrend.talkAnswers || 0}`,
    `- Previous week rounds: ${comparison.previousRounds || 0}`,
    `- Previous week game accuracy: ${comparison.previousAccuracy || "0%"}`,
    "",
    "Parent note:",
    `- ${parentNote}`,
    "",
    "Today:",
    today
      ? `- ${today.date}: ${today.rounds} of ${totalRounds} rounds, ${today.status}, mood ${today.mood || "not picked"}, plan ${today.plan || "Daily Adventure"}`
      : "- No synced data for today yet.",
    "",
    "Needs practice shown in the app:",
    formatPromptList(needsPractice, (item) => `- ${item.title}: ${item.detail}`),
    "",
    "Skill Mastery Strengths:",
    formatPromptList(masteryStrengths, (item) => `- ${item.skillArea}: ${item.questionText} | ${item.masteryStatus}, ${item.accuracy}, ${item.attempts} attempts`),
    "",
    "Skill Mastery Practice Priorities:",
    formatPromptList(practiceNext, (item) => `- ${item.skillArea}: ${item.questionText} | ${item.masteryStatus}, ${item.accuracy}, priority ${item.priorityScore} | Parent activity: ${item.nextPracticeActivity}`),
    "",
    "Recent daily detail:",
    formatPromptList(recentDaily, (day) => `- ${day.date}: ${day.rounds} of ${totalRounds} rounds, ${day.status}, ${day.completion} complete`),
    "",
    "Recent Talk Time:",
    formatPromptList(recentTalk, (item) => `- ${item.date}: Prompt: ${item.prompt} | Answer: ${item.answer || "No typed answer"} | Type: ${item.responseType}`),
    "",
    "Learning game attempts:",
    formatPromptList(learningAttempts, (item) => `- ${item.game}: ${item.correct} correct out of ${item.attempts}, accuracy ${item.accuracy}`),
    "",
    "Skill trends this week:",
    formatPromptList(skillTrends, (item) => `- ${item.skill}: ${item.correct} correct out of ${item.attempts}, accuracy ${item.accuracy}`),
    "",
    "Frequently missed questions:",
    formatPromptList(missedQuestions, (item) => `- ${item.skill}: ${item.prompt} | Misses: ${item.misses}`)
  ].join("\n");
}

function formatPromptList(items, formatter) {
  if (!items.length) return "- No data yet.";
  return items.map(formatter).join("\n");
}

async function copyWeeklyPrompt() {
  return copyWeeklyPromptText("Weekly AI prompt copied. Paste it into your ChatGPT project.");
}

async function copyWeeklyPromptText(successMessage) {
  if (!latestParentViewData) {
    if (parentViewStatus) {
      parentViewStatus.textContent = "Load parent view first, then copy the weekly AI prompt.";
    }
    return false;
  }

  const prompt = buildWeeklyAiPrompt(latestParentViewData);
  const preview = document.querySelector("#weeklyPromptPreview");
  if (preview) {
    preview.value = prompt;
  }

  try {
    await copyTextToClipboard(prompt);
    if (parentViewStatus) {
      parentViewStatus.textContent = successMessage;
    }
    return true;
  } catch {
    if (parentViewStatus) {
      parentViewStatus.textContent = "Prompt is ready below. Select it and copy it manually.";
    }
    return false;
  }
}

async function copyQuestionGeneratorPrompt() {
  try {
    const response = await fetch(`question-generator-prompt.txt?v=${Date.now()}`);
    if (!response.ok) throw new Error("Prompt file not found");
    const prompt = await response.text();
    const preview = document.querySelector("#questionGeneratorPromptPreview");
    if (preview) {
      preview.value = prompt;
    }
    await copyTextToClipboard(prompt);
    if (parentViewStatus) {
      parentViewStatus.textContent = "Question generator prompt copied. Paste it into ChatGPT or Gemini.";
    }
    return true;
  } catch {
    if (parentViewStatus) {
      parentViewStatus.textContent = "Could not load the question generator prompt. Open question-generator-prompt.txt from GitHub.";
    }
    return false;
  }
}

function copyPromptForAiAssistant(target) {
  copyWeeklyPromptText(
    "Weekly AI prompt copied. Trying to open the ChatGPT app."
  );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatShortDateTime(value) {
  if (!value) return "just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function labelFor(id) {
  if (id === "brain") return "Memory Game";
  if (id === "life") return "Life Skill";
  if (id === "language") return "Spanish Cards";
  return "Talk Time";
}

function renderBrainRound() {
  if (!memoryGame) return;

  const round = Math.min(state.rounds.brain, maxRounds.brain - 1);
  const deck = todayPlan.brain[round];
  const activity = document.querySelector('[data-activity="brain"]');
  if (!activity) return;
  addReplayButton(activity, "memoryGame", "Memory Game");

  activity.querySelector("h2").textContent = state.completed.includes("brain") ? "Memory complete" : deck.title;
  activity.querySelector(".prompt").textContent = state.completed.includes("brain")
    ? "You finished all memory rounds for today."
    : deck.prompt;
  activity.querySelector(".feedback").textContent = "";

  memoryGame.innerHTML = deck.cards.map((card) => (
    `<button class="game-card" data-pair="${card.pair}">${card.text}</button>`
  )).join("");
  memoryPicks = [];
}

function renderLifeRound() {
  const round = Math.min(state.rounds.life, maxRounds.life - 1);
  const deck = todayPlan.life[round];
  const activity = document.querySelector('[data-activity="life"]');
  if (!activity || !sequenceGame) return;
  addReplayButton(activity, "beforeQuestion", "Life Skill");
  const shuffledSteps = [deck.steps[0], deck.steps[2], deck.steps[1]];

  activity.querySelector("h2").textContent = state.completed.includes("life") ? "Life skills complete" : deck.title;
  activity.querySelector(".prompt").textContent = state.completed.includes("life")
    ? "You finished all life-skill rounds for today."
    : deck.prompt;
  activity.querySelector(".feedback").textContent = "";

  sequenceGame.innerHTML = shuffledSteps.map((step) => {
    const order = deck.steps.indexOf(step) + 1;
    return `<button class="sequence-choice" data-order="${order}">${step}</button>`;
  }).join("");
  sequenceStep = 1;
}

function renderLanguageRound() {
  if (!languagePrompt || !languageWord || !languageChoices) return;

  const round = Math.min(state.rounds.language, maxRounds.language - 1);
  const deck = todayLanguage[round];
  const activity = document.querySelector('[data-activity="language"]');
  if (!activity) return;
  addReplayButton(activity, "spanishCards", "Spanish Cards");

  const isDone = state.completed.includes("language");

  activity.querySelector("h2").textContent = isDone ? "Spanish cards complete" : "Learn a word";
  languagePrompt.textContent = isDone
    ? "You finished all Spanish cards for today."
    : `Which Spanish word means ${deck.english.toLowerCase()}?`;
  languageWord.textContent = isDone ? "Great work" : deck.english;
  languageChoices.innerHTML = isDone
    ? ""
    : deck.choices.map((choice) => (
      `<button class="choice language-choice" data-language-choice="${choice}">${choice}</button>`
    )).join("");
  activity.querySelector(".feedback").textContent = "";
}

function renderTalkRound() {
  if (!talkPrompt || !talkAnswer) return;

  const round = Math.min(state.rounds.talk, maxRounds.talk - 1);
  const prompt = round === 0 && state.talkPrompt !== defaultState.talkPrompt
    ? state.talkPrompt
    : todayPlan.talk[round];
  const activity = document.querySelector('[data-activity="talk"]');
  if (!activity) return;
  addReplayButton(activity, "talkTime", "Talk Time");

  activity.querySelector("h2").textContent = state.completed.includes("talk") ? "Talk Time complete" : "Share an answer";
  talkPrompt.textContent = state.completed.includes("talk")
    ? "You finished all Talk Time rounds for today."
    : prompt;
  updateAnswerStyleUi();
  talkAnswer.value = "";
  activity.querySelector(".feedback").textContent = "";
}

function updateAnswerStyleUi() {
  const isTalkDone = state.completed.includes("talk");
  const style = answerStyleHints[selectedAnswerStyle] || answerStyleHints.first;

  answerStyleButtons.forEach((button) => {
    const isSelected = button.dataset.answerStyle === selectedAnswerStyle;
    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  if (answerStyleHint) {
    answerStyleHint.textContent = style.hint;
  }

  if (talkAnswer) {
    talkAnswer.placeholder = style.placeholder;
  }

  if (sentenceExamples) {
    sentenceExamples.innerHTML = isTalkDone
      ? ""
      : sentenceFrames.map((frame) => `<li>${frame[selectedAnswerStyle]}</li>`).join("");
  }
}

function renderDailyRounds() {
  if (!hasDailyPage) return;

  renderBrainRound();
  renderLifeRound();
  renderLanguageRound();
  renderTalkRound();
  attachRoundHandlers();
}

function renderMiniGames() {
  if (!miniGames) return;

  const sortChoices = [...todayPlan.mini.sort.correct, ...todayPlan.mini.sort.wrong];
  const pattern = todayPlan.mini.pattern;
  const moneyMathQuestions = todayMoneyMath;
  const businessPractice = todayBusinessPractice;
  const pronounPractice = todayPronounPractice;
  const conversationCoach = getConversationCoachPrompt();
  const extraProgress = getExtraProgress();
  const currentExtraStep = getCurrentExtraStep();

  miniGames.innerHTML = `
    ${renderExtraPathHeader(extraProgress, currentExtraStep)}

    <article class="${getExtraGameClass("sort", extraProgress, currentExtraStep)}" data-mini-game="sort" ${getExtraGameHidden("sort", currentExtraStep)}>
      <div class="mini-game-header">
        <span>Sort</span>
        <strong>${todayPlan.mini.sort.title}</strong>
      </div>
      <p>${todayPlan.mini.sort.prompt}</p>
      <div class="tile-grid">
        ${sortChoices.map((choice) => (
          `<button class="tile" data-sort-correct="${todayPlan.mini.sort.correct.includes(choice)}">${choice}</button>`
        )).join("")}
      </div>
      <p class="mini-feedback" aria-live="polite">${todayPlan.mini.sort.instruction}</p>
    </article>

    <article class="${getExtraGameClass("pattern", extraProgress, currentExtraStep)}" data-mini-game="pattern" ${getExtraGameHidden("pattern", currentExtraStep)}>
      <div class="mini-game-header">
        <span>Pattern</span>
        <strong>${pattern.title}</strong>
      </div>
      <div class="pattern-row" aria-label="${pattern.sequence.join(" ")} pattern">
        ${pattern.sequence.map((color) => `<span class="pattern-dot ${color}"></span>`).join("")}
        <span class="pattern-dot mystery">?</span>
      </div>
      <div class="tile-grid three">
        ${pattern.choices.map((choice) => (
          `<button class="tile color-choice" data-pattern="${choice.toLowerCase()}">${choice}</button>`
        )).join("")}
      </div>
      <p class="mini-feedback" aria-live="polite">Choose the next color.</p>
    </article>

    <article class="${getExtraGameClass("money-math", extraProgress, currentExtraStep)}" data-mini-game="money-math" ${getExtraGameHidden("money-math", currentExtraStep)}>
      <div class="mini-game-header">
        <span>Money Math</span>
        <strong>3 quick questions</strong>
      </div>
      <div class="money-math-list">
        ${moneyMathQuestions.map((question, index) => (
          `<div class="money-question" data-money-question="${index}">
            <strong>${index + 1}. ${question.title}</strong>
            <p>${question.prompt}</p>
            <div class="tile-grid three">
              ${question.choices.map((choice) => (
                `<button class="tile money-math-choice" data-money-question-index="${index}" data-money-math-correct="${choice === question.answer}">${choice}</button>`
              )).join("")}
            </div>
          </div>`
        )).join("")}
      </div>
      <p class="mini-feedback" aria-live="polite">Answer all 3 money questions.</p>
    </article>

    <article class="${getExtraGameClass("business", extraProgress, currentExtraStep)}" data-mini-game="business" ${getExtraGameHidden("business", currentExtraStep)}>
      <div class="mini-game-header">
        <span>Business</span>
        <strong>${businessPractice.title}</strong>
      </div>
      <p>${businessPractice.prompt}</p>
      <div class="tile-grid">
        ${businessPractice.choices.map((choice) => (
          `<button class="tile business-choice" data-business-correct="${choice === businessPractice.answer}">${choice}</button>`
        )).join("")}
      </div>
      <p class="mini-feedback" aria-live="polite">Choose the best business action.</p>
    </article>

    <article class="${getExtraGameClass("pronouns", extraProgress, currentExtraStep)}" data-mini-game="pronouns" ${getExtraGameHidden("pronouns", currentExtraStep)}>
      <div class="mini-game-header">
        <span>Family Words</span>
        <strong>${pronounPractice.title}</strong>
      </div>
      <p>${pronounPractice.prompt}</p>
      <div class="tile-grid">
        ${pronounPractice.choices.map((choice) => (
          `<button class="tile pronoun-choice" data-pronoun-correct="${choice === pronounPractice.answer}">${choice}</button>`
        )).join("")}
      </div>
      <p class="mini-feedback" aria-live="polite">Choose the family word.</p>
    </article>

    <article class="${getExtraGameClass("conversation-coach", extraProgress, currentExtraStep)} conversation-coach-card" data-mini-game="conversation-coach" ${getExtraGameHidden("conversation-coach", currentExtraStep)}>
      <div class="mini-game-header">
        <span>Conversation Coach</span>
        <strong>${escapeHtml(conversationCoach.title)}</strong>
      </div>
      <div class="coach-chat" aria-label="Conversation Coach chat">
        <div class="coach-message-row coach-message-row-bot">
          <div class="coach-avatar">C</div>
          <div class="coach-bubble coach-bubble-bot">
            <span>Coach</span>
            <p>${escapeHtml(conversationCoach.prompt)}</p>
          </div>
        </div>
        <div class="coach-message-row coach-message-row-user coach-suggested-reply">
          <div class="coach-bubble coach-bubble-user">
            <span>Zamaan can say</span>
            <p>${escapeHtml(conversationCoach.model)}</p>
          </div>
        </div>
      </div>
      <div class="coach-actions">
        <button class="tile" data-coach-action="hear">Hear Coach</button>
        <button class="tile" data-coach-action="reply">Send Reply</button>
        <button class="tile" data-coach-action="help">Help Me</button>
        <button class="tile" data-coach-action="next">New Chat</button>
      </div>
      <p class="mini-feedback" aria-live="polite">Tap Send Reply after saying the blue message.</p>
    </article>

    ${areExtraGamesComplete()
      ? `<article class="mini-game extra-path-complete">
          <div class="mini-game-header">
            <span>Done</span>
            <strong>Extra practice complete</strong>
          </div>
          <p>Nice focus. Now send Mom and Dad your final update.</p>
        </article>`
      : ""}
  `;

  attachMiniGameHandlers();
}

function getExtraProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(`dailyAdventureExtraProgress-${todayKey}`) || "[]");
    return Array.isArray(saved) ? saved.filter((id) => extraGameOrder.some((game) => game.id === id)) : [];
  } catch {
    return [];
  }
}

function saveExtraProgress(progress) {
  localStorage.setItem(`dailyAdventureExtraProgress-${todayKey}`, JSON.stringify(progress));
}

function areExtraGamesComplete() {
  return getExtraProgress().length >= extraGameOrder.length;
}

function getCurrentExtraStep() {
  const progress = getExtraProgress();
  return extraGameOrder.find((game) => !progress.includes(game.id))?.id || "complete";
}

function getExtraGameClass(id, progress, currentStep) {
  const classes = ["mini-game", "extra-path-step"];
  if (progress.includes(id)) classes.push("done");
  if (id === currentStep) classes.push("active");
  return classes.join(" ");
}

function getExtraGameHidden(id, currentStep) {
  return id === currentStep ? "" : "hidden";
}

function renderExtraPathHeader(progress, currentStep) {
  const complete = currentStep === "complete";
  const currentLabel = extraGameOrder.find((game) => game.id === currentStep)?.label || "All done";
  return `
    <div class="extra-path-header">
      <div>
        <span>Extra Path</span>
        <strong>${complete ? "All extra practice complete" : `Next: ${escapeHtml(currentLabel)}`}</strong>
      </div>
      <p>${progress.length} of ${extraGameOrder.length} extra activities complete</p>
      <div class="extra-path-steps">
        ${extraGameOrder.map((game, index) => {
          const done = progress.includes(game.id);
          const active = game.id === currentStep;
          return `
            <span class="extra-path-chip ${done ? "done" : ""} ${active ? "active" : ""}">
              ${index + 1}. ${escapeHtml(game.label)}
            </span>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function completeExtraGame(id, message = "Nice work. The next extra activity is ready.") {
  const progress = getExtraProgress();
  if (!progress.includes(id)) {
    progress.push(id);
    saveExtraProgress(progress);
  }

  window.setTimeout(() => {
    renderMiniGames();
    updateProgress();
    if (areExtraGamesComplete()) {
      speak("All extra practice is complete. Now send Mom and Dad your update.", "sendUpdate");
      if (completionPanel) completionPanel.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
    } else {
      speak(message, "keepGoing");
    }
  }, 650);
}

function getConversationCoachIndex() {
  const index = Number(sessionStorage.getItem(`dailyAdventureCoachIndex-${todayKey}`) || "0");
  return Number.isFinite(index) ? index : 0;
}

function setConversationCoachIndex(index) {
  sessionStorage.setItem(`dailyAdventureCoachIndex-${todayKey}`, String(index));
}

function getConversationCoachPrompt() {
  const offset = curriculumDay % conversationCoachDeck.length;
  const index = (offset + getConversationCoachIndex()) % conversationCoachDeck.length;
  return conversationCoachDeck[index];
}

function attachRoundHandlers() {
  document.querySelectorAll("[data-memory-game] .game-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (state.completed.includes("brain")) return;

      const activity = card.closest(".activity");
      const feedback = activity.querySelector(".feedback");

      if (card.classList.contains("matched") || memoryPicks.includes(card)) return;

      card.classList.add("selected");
      memoryPicks.push(card);

      if (memoryPicks.length < 2) {
        feedback.textContent = "Pick one more card.";
        speak("Pick one more card.", "pickOneMoreCard");
        return;
      }

      const [first, second] = memoryPicks;
      const isMatch = first.dataset.pair === second.dataset.pair;
      const roundIndex = Math.min(state.rounds.brain, maxRounds.brain - 1);
      const deck = todayPlan.brain[roundIndex];

      if (isMatch) {
        clearRetry(`memory-${roundIndex}`);
        first.classList.add("matched");
        second.classList.add("matched");
        const isLast = state.rounds.brain + 1 >= maxRounds.brain;
        const message = isLast ? "Memory section finished." : "That's a pair. New cards are ready.";
        feedback.textContent = message;
        completeRound("brain", message, {
          title: deck.title,
          prompt: `${deck.prompt} Matched: ${first.textContent} and ${second.textContent}.`
        });
        window.setTimeout(renderDailyRounds, 700);
      } else {
        first.classList.add("wrong");
        second.classList.add("wrong");
        const pairs = {};
        deck.cards.forEach((item) => {
          pairs[item.pair] = [...(pairs[item.pair] || []), item.text];
        });
        const answer = Object.values(pairs)[0].join(" and ");
        feedback.textContent = getRetryFeedback(`memory-${roundIndex}`, "Look for two things that are used together.", answer);
        speak(feedback.textContent, "incorrect");
        window.setTimeout(() => {
          first.classList.remove("selected", "wrong");
          second.classList.remove("selected", "wrong");
        }, 700);
      }

      memoryPicks = [];
    });
  });

  document.querySelectorAll("[data-sequence-game] .sequence-choice").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.completed.includes("life")) return;

      const activity = button.closest(".activity");
      const feedback = activity.querySelector(".feedback");
      const order = Number(button.dataset.order);
      const roundIndex = Math.min(state.rounds.life, maxRounds.life - 1);
      const deck = todayPlan.life[roundIndex];

      if (button.classList.contains("selected")) return;

      if (order === sequenceStep) {
        clearRetry(`life-${roundIndex}`);
        button.classList.add("selected");
        button.dataset.picked = String(sequenceStep);
        sequenceStep += 1;

        if (sequenceStep > 3) {
          const isLast = state.rounds.life + 1 >= maxRounds.life;
          const message = isLast ? "Life skills section finished." : "You put the steps in order. New steps are ready.";
          feedback.textContent = message;
          completeRound("life", message, {
            title: deck.title,
            prompt: deck.steps.join(" → ")
          });
          window.setTimeout(renderDailyRounds, 700);
        } else {
          feedback.textContent = `Good. Now find step ${sequenceStep}.`;
          speak(`Good. Now find step ${sequenceStep}.`, "nextStep");
        }
        return;
      }

      button.classList.add("wrong");
      feedback.textContent = getRetryFeedback(`life-${roundIndex}`, `Start with: ${deck.steps[0]}.`, deck.steps[sequenceStep - 1]);
      speak(feedback.textContent, "incorrect");
      window.setTimeout(resetSequenceGame, 800);
    });
  });

  document.querySelectorAll("[data-language-game] .language-choice").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.completed.includes("language")) return;

      const activity = button.closest(".activity");
      const feedback = activity.querySelector(".feedback");
      const roundIndex = Math.min(state.rounds.language, maxRounds.language - 1);
      const deck = todayLanguage[roundIndex];
      const retryKey = `language-${roundIndex}`;
      const isCorrect = button.dataset.languageChoice === deck.spanish;

      activity.querySelectorAll(".language-choice").forEach((choice) => {
        choice.classList.remove("correct", "wrong");
      });

      if (!isCorrect) {
        button.classList.add("wrong");
        feedback.textContent = getRetryFeedback(retryKey, `It starts with ${deck.spanish.charAt(0).toUpperCase()}.`, deck.spanish);
        const attempts = getRetryAttemptCount(retryKey);
        logLearningAttempt("Spanish Cards", deck.english, `Which Spanish word means ${deck.english.toLowerCase()}?`, button.dataset.languageChoice, deck.spanish, false, {
          attempts,
          hintShown: attempts >= 2,
          answerShown: attempts >= 3,
          card: `${deck.english} = ${deck.spanish}`
        });
        speak(feedback.textContent, "incorrect");
        return;
      }

      const attempts = getRetryAttemptCount(retryKey) + 1;
      logLearningAttempt("Spanish Cards", deck.english, `Which Spanish word means ${deck.english.toLowerCase()}?`, button.dataset.languageChoice, deck.spanish, true, {
        attempts,
        hintShown: attempts > 2,
        answerShown: attempts > 3,
        card: `${deck.english} = ${deck.spanish}`
      });
      clearRetry(retryKey);
      button.classList.add("correct");
      const isLast = state.rounds.language + 1 >= maxRounds.language;
      const message = isLast ? "Spanish cards finished." : "Correct. New Spanish card is ready.";
      feedback.textContent = `${deck.english} means ${deck.spanish}.`;
      completeRound("language", message, {
        title: "Spanish Card",
        prompt: `${deck.english} = ${deck.spanish}`,
        answer: deck.spanish
      });
      window.setTimeout(renderDailyRounds, 700);
    });
  });
}

function updateHistory() {
  history.days[todayKey] = {
    completed: getRoundTotal() === totalRounds,
    rounds: getRoundTotal(),
    mood: state.mood,
    plan: getPlanLabel(),
    day: activeDayNumber,
    updatedAt: new Date().toISOString()
  };
  saveHistory();
  renderCalendar();
}

function renderCalendar() {
  const calendar = document.querySelector("#calendarGrid");
  if (!calendar) return;

  const days = [];
  const now = new Date();
  for (let i = 13; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const record = history.days[key];
    days.push({ date, key, record });
  }

  calendar.innerHTML = days.map(({ date, key, record }) => {
    const label = new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
    const day = date.getDate();
    const status = record?.completed ? "done" : record?.rounds ? "started" : "";
    const rounds = record?.rounds || 0;
    return `
      <div class="calendar-day ${status}" aria-label="${label} ${day}, ${rounds} of ${totalRounds} rounds">
        <span>${label}</span>
        <strong>${day}</strong>
        <small>${rounds}/${totalRounds}</small>
      </div>
    `;
  }).join("");
}

if (todayLabel) {
  todayLabel.textContent = `${new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric"
  }).format(new Date())} · Day ${activeDayNumber} of ${activeCycleLength}`;
}

document.querySelectorAll(".mood-button").forEach((button) => {
  button.classList.toggle("selected", button.dataset.mood === state.mood);
  button.addEventListener("click", () => {
    state.mood = button.dataset.mood;
    document.querySelectorAll(".mood-button").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    save();
    updateHistory();
    speak(`You chose ${state.mood}.`, `mood${state.mood}`);
  });
});

document.querySelectorAll("[data-pin-key]").forEach((button) => {
  button.addEventListener("click", () => {
    if (enteredPin.length >= 8) return;
    enteredPin += button.dataset.pinKey;
    if (pinMessage) {
      pinMessage.textContent = "";
    }
    updatePinDisplay();

    if (enteredPin.length === getAppPin().length) {
      window.setTimeout(checkPin, 120);
    }
  });
});

const pinClear = document.querySelector("[data-pin-clear]");
if (pinClear) {
  pinClear.addEventListener("click", () => {
    enteredPin = "";
    if (pinMessage) {
      pinMessage.textContent = "";
    }
    updatePinDisplay();
  });
}

const pinBack = document.querySelector("[data-pin-back]");
if (pinBack) {
  pinBack.addEventListener("click", () => {
    enteredPin = enteredPin.slice(0, -1);
    if (pinMessage) {
      pinMessage.textContent = "";
    }
    updatePinDisplay();
  });
}

function attachMiniGameHandlers() {
  sortPicks.clear();

  document.querySelectorAll("[data-mini-game='sort'] .tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      const game = tile.closest(".mini-game");
      const feedback = game.querySelector(".mini-feedback");
      const isCorrect = tile.dataset.sortCorrect === "true";
      const correctAnswer = todayPlan.mini.sort.correct.join(" or ");

      logLearningAttempt("Sort", todayPlan.mini.sort.title, todayPlan.mini.sort.prompt, tile.textContent, correctAnswer, isCorrect);
      if (isCorrect) {
        clearRetry("sort");
        tile.classList.add("selected", "correct");
        sortPicks.add(tile.textContent);
        feedback.textContent = sortPicks.size === todayPlan.mini.sort.correct.length
          ? todayPlan.mini.sort.success
          : "Yes. Find one more.";
        speak(feedback.textContent, "correct");
        if (sortPicks.size === todayPlan.mini.sort.correct.length) {
          completeExtraGame("sort", "Sort is finished. The next extra activity is ready.");
        }
      } else {
        tile.classList.add("wrong");
        feedback.textContent = getRetryFeedback("sort", "Think about what the question is asking you to group.", correctAnswer);
        speak(feedback.textContent, "incorrect");
        window.setTimeout(() => tile.classList.remove("wrong"), 700);
      }
    });
  });

  document.querySelectorAll("[data-mini-game='pattern'] .tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      const game = tile.closest(".mini-game");
      const feedback = game.querySelector(".mini-feedback");
      const isCorrect = tile.dataset.pattern === todayPlan.mini.pattern.answer;

      logLearningAttempt("Pattern", todayPlan.mini.pattern.title, "Choose the next color.", tile.textContent, capitalize(todayPlan.mini.pattern.answer), isCorrect);
      game.querySelectorAll(".tile").forEach((item) => item.classList.remove("correct", "wrong"));
      tile.classList.add(isCorrect ? "correct" : "wrong");
      if (isCorrect) clearRetry("pattern");
      feedback.textContent = isCorrect
        ? `Yes. ${capitalize(todayPlan.mini.pattern.answer)} comes next.`
        : getRetryFeedback("pattern", "Look at which colors repeat.", capitalize(todayPlan.mini.pattern.answer));
      speak(feedback.textContent, isCorrect ? "correct" : "incorrect");
      if (isCorrect) {
        completeExtraGame("pattern", "Pattern is finished. The next extra activity is ready.");
      }
    });
  });

  document.querySelectorAll("[data-mini-game='money-math'] .tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      const game = tile.closest(".mini-game");
      const feedback = game.querySelector(".mini-feedback");
      const question = tile.closest(".money-question");
      const questionIndex = Number(tile.dataset.moneyQuestionIndex);
      const currentQuestion = todayMoneyMath[questionIndex];
      const isCorrect = tile.dataset.moneyMathCorrect === "true";

      logLearningAttempt("Money Math", currentQuestion.title, currentQuestion.prompt, tile.textContent, currentQuestion.answer, isCorrect);
      question.querySelectorAll(".tile").forEach((item) => item.classList.remove("correct", "wrong"));
      tile.classList.add(isCorrect ? "correct" : "wrong");
      if (isCorrect) {
        clearRetry(`money-${questionIndex}`);
        question.dataset.answered = "true";
      }

      const answeredCount = game.querySelectorAll(".money-question[data-answered='true']").length;
      feedback.textContent = isCorrect
        ? answeredCount === todayMoneyMath.length
          ? "Nice money math. You answered all 3."
          : `Correct. ${currentQuestion.answer} is right.`
        : getRetryFeedback(`money-${questionIndex}`, "Count the dollars one step at a time.", currentQuestion.answer);
      speak(feedback.textContent, isCorrect ? "moneyMath" : "incorrect");
      if (answeredCount === todayMoneyMath.length) {
        completeExtraGame("money-math", "Money Math is finished. The next extra activity is ready.");
      }
    });
  });

  document.querySelectorAll("[data-mini-game='business'] .tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      const game = tile.closest(".mini-game");
      const feedback = game.querySelector(".mini-feedback");
      const isCorrect = tile.dataset.businessCorrect === "true";

      logLearningAttempt("Business", todayBusinessPractice.title, todayBusinessPractice.prompt, tile.textContent, todayBusinessPractice.answer, isCorrect);
      game.querySelectorAll(".tile").forEach((item) => item.classList.remove("correct", "wrong"));
      tile.classList.add(isCorrect ? "correct" : "wrong");
      if (isCorrect) clearRetry("business");
      feedback.textContent = isCorrect
        ? "Good business choice."
        : getRetryFeedback("business", "Think about the helpful action for a buyer or customer.", todayBusinessPractice.answer);
      speak(feedback.textContent, isCorrect ? "businessPractice" : "incorrect");
      if (isCorrect) {
        completeExtraGame("business", "Business practice is finished. The next extra activity is ready.");
      }
    });
  });

  document.querySelectorAll("[data-mini-game='pronouns'] .tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      const game = tile.closest(".mini-game");
      const feedback = game.querySelector(".mini-feedback");
      const isCorrect = tile.dataset.pronounCorrect === "true";

      logLearningAttempt("Family Words", todayPronounPractice.title, todayPronounPractice.prompt, tile.textContent, todayPronounPractice.answer, isCorrect);
      game.querySelectorAll(".tile").forEach((item) => item.classList.remove("correct", "wrong"));
      tile.classList.add(isCorrect ? "correct" : "wrong");
      if (isCorrect) clearRetry("family-words");
      feedback.textContent = isCorrect
        ? "Good family word."
        : getRetryFeedback("family-words", "Think about who the person is to Zamaan.", todayPronounPractice.answer);
      speak(feedback.textContent, isCorrect ? "familyWords" : "incorrect");
      if (isCorrect) {
        completeExtraGame("pronouns", "Family Words is finished. The next extra activity is ready.");
      }
    });
  });

  document.querySelectorAll("[data-mini-game='conversation-coach'] [data-coach-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const game = button.closest(".mini-game");
      const feedback = game.querySelector(".mini-feedback");
      const chat = game.querySelector(".coach-chat");
      const coachPrompt = getConversationCoachPrompt();
      const action = button.dataset.coachAction;

      if (action === "hear") {
        feedback.textContent = "Listen to Coach, then say the blue reply.";
        speak(feedback.textContent, coachPrompt.voiceKey || "conversationCoachStart");
        return;
      }

      if (action === "help") {
        feedback.textContent = "Try saying the blue message out loud.";
        addCoachBotBubble(chat, `Try saying: ${coachPrompt.model}`);
        speak(feedback.textContent, "conversationCoachSentence");
        return;
      }

      if (action === "reply") {
        feedback.textContent = "Nice reply. That sounded like a real conversation.";
        addCoachUserBubble(chat, coachPrompt.model);
        window.setTimeout(() => {
          addCoachBotBubble(chat, "Nice sentence. Want another one?");
        }, 250);
        logLearningAttempt("Conversation Coach", coachPrompt.title, coachPrompt.prompt, "Practiced sentence", coachPrompt.model, true, {
          card: coachPrompt.topic
        });
        speak(feedback.textContent, "conversationCoachNice");
        completeExtraGame("conversation-coach", "Conversation Coach is finished.");
        return;
      }

      setConversationCoachIndex(getConversationCoachIndex() + 1);
      renderMiniGames();
      speak("Okay. Let's try another one.", "conversationCoachNext");
    });
  });
}

function addCoachBotBubble(chat, text) {
  if (!chat) return;
  chat.insertAdjacentHTML("beforeend", `
    <div class="coach-message-row coach-message-row-bot">
      <div class="coach-avatar">C</div>
      <div class="coach-bubble coach-bubble-bot">
        <span>Coach</span>
        <p>${escapeHtml(text)}</p>
      </div>
    </div>
  `);
  chat.scrollTop = chat.scrollHeight;
}

function addCoachUserBubble(chat, text) {
  if (!chat) return;
  const suggestedReply = chat.querySelector(".coach-suggested-reply");
  if (suggestedReply) suggestedReply.remove();
  chat.insertAdjacentHTML("beforeend", `
    <div class="coach-message-row coach-message-row-user">
      <div class="coach-bubble coach-bubble-user">
        <span>Zamaan</span>
        <p>${escapeHtml(text)}</p>
      </div>
    </div>
  `);
  chat.scrollTop = chat.scrollHeight;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

if (soundToggle) {
  soundToggle.addEventListener("click", () => {
    const enabled = !isSoundEnabled();
    saveSoundEnabled(enabled);
    soundToggle.textContent = enabled ? "Sound on" : "Sound off";
    soundToggle.setAttribute("aria-pressed", String(enabled));
    if (enabled) speak("Sound is on.", "soundOn");
  });
}

if (toggleExtraGames && extraGames) {
  toggleExtraGames.addEventListener("click", () => {
    if (toggleExtraGames.disabled) return;
    const willOpen = extraGames.hidden;
    extraGames.hidden = !willOpen;
    toggleExtraGames.textContent = willOpen ? "Hide extra games" : "Play more";
    toggleExtraGames.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) speak("Nice work. Your extra games are ready now.", "extraGames");
  });
}

function finishMovementBreak(message) {
  if (movementInterval) window.clearInterval(movementInterval);
  movementInterval = null;
  sessionStorage.setItem(`dailyAdventureMovement-${todayKey}`, "done");
  if (movementBreak) movementBreak.hidden = true;
  if (movementTimer) movementTimer.textContent = "";
  speak(message, "keepGoing");
}

if (startMovementBreak) {
  startMovementBreak.addEventListener("click", () => {
    let secondsLeft = 120;
    startMovementBreak.disabled = true;
    if (movementTimer) movementTimer.textContent = "2:00 remaining";
    speak("Movement break started. Stand up, stretch, and move.", "workoutBreak");
    movementInterval = window.setInterval(() => {
      secondsLeft -= 1;
      const minutes = Math.floor(secondsLeft / 60);
      const seconds = String(secondsLeft % 60).padStart(2, "0");
      if (movementTimer) movementTimer.textContent = `${minutes}:${seconds} remaining`;
      if (secondsLeft <= 0) {
        startMovementBreak.disabled = false;
        finishMovementBreak("Nice movement break. Ready for the next round.");
      }
    }, 1000);
  });
}

if (skipMovementBreak) {
  skipMovementBreak.addEventListener("click", () => {
    finishMovementBreak("Okay. Keep going with your adventure.");
  });
}

if (sendCompletionUpdate) {
  sendCompletionUpdate.addEventListener("click", () => {
    speak("You did it. Now you can send Mom and Dad your update.", "sendUpdate");
    openWhatsappCompletionMessage();
  });
}

if (shareCompletionUpdate) {
  shareCompletionUpdate.addEventListener("click", async () => {
    try {
      await shareCompletionMessage();
    } catch {
      if (celebration) {
        celebration.textContent = "Could not share just now. Try WhatsApp again.";
      }
    }
  });
}

const completeTalkButton = document.querySelector("[data-complete-talk]");
if (completeTalkButton) {
  completeTalkButton.addEventListener("click", () => {
  if (state.completed.includes("talk")) return;

  const answer = talkAnswer.value.trim();
  const prompt = talkPrompt.textContent;
  const answerStyle = answerStyleHints[selectedAnswerStyle] || answerStyleHints.first;
  const isLast = state.rounds.talk + 1 >= maxRounds.talk;
  const message = answer
    ? isLast ? "Thank you for sharing. Talk Time is finished." : "Thank you for sharing. New question is ready."
    : isLast ? "Talk Time is finished." : "New Talk Time question is ready.";
  document.querySelector('[data-activity="talk"] .feedback').textContent = message;
  completeRound("talk", message, {
    title: "Talk Time",
    prompt: `${prompt} Answer style: ${answerStyle.label}.`,
    answer: answer
      ? `Style: ${answerStyle.label} | Answer: ${answer}`
      : `Style: ${answerStyle.label} | Said out loud or skipped typing.`
  });
  window.setTimeout(renderDailyRounds, 500);
  });
}

answerStyleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedAnswerStyle = button.dataset.answerStyle || "first";
    updateAnswerStyleUi();
    speak(selectedAnswerStyle === "third"
      ? "Zamaan answer."
      : "I and my answer.", selectedAnswerStyle === "third" ? "thirdPersonReminder" : "firstPersonReminder");
  });
});

if (caregiverToggle && caregiverPanel) {
  caregiverToggle.addEventListener("click", () => {
    const isOpen = caregiverToggle.getAttribute("aria-expanded") === "true";
    caregiverToggle.setAttribute("aria-expanded", String(!isOpen));
    caregiverPanel.hidden = isOpen;
    if (isOpen === false) {
      renderCaregiverReport();
    }
  });
} else if (caregiverPanel) {
  caregiverPanel.hidden = false;
}

const saveSettings = document.querySelector("#saveSettings");
if (saveSettings) {
  saveSettings.addEventListener("click", () => {
    state.name = nameInput?.value.trim() || "Zamaan";
    if (difficultyInput) {
      saveDifficultyLevel(difficultyInput.value);
    }
    if (focusModeInput) {
      saveFocusMode(focusModeInput.checked);
    }
    saveAccessibilitySettings({
      largeText: Boolean(largeTextInput?.checked),
      highContrast: Boolean(highContrastInput?.checked),
      extraHints: Boolean(extraHintsInput?.checked),
      reduceMotion: Boolean(reduceMotionInput?.checked),
      replayAudio: replayAudioInput ? replayAudioInput.checked : true
    });
    if (parentNoteInput) {
      localStorage.setItem("dailyAdventureParentNote", parentNoteInput.value.trim());
    }
    state.talkPrompt = promptInput?.value.trim() || defaultState.talkPrompt;
    state.message = messageInput?.value.trim() || defaultState.message;
    saveAppPin(pinInput?.value.replace(/\D/g, "").slice(0, 8) || "1234");
    if (whatsappPhoneInput) {
      saveWhatsappPhone(whatsappPhoneInput.value);
    }
    saveSyncConfig();
    save();
    updateGreeting();
    if (hasDailyPage) {
      updateProgress();
      renderDailyRounds();
    }
    if (celebration) {
      celebration.textContent = "Settings saved.";
    }
    if (parentViewStatus) {
      parentViewStatus.textContent = "Settings saved.";
    }
    speak("Settings saved.", "settingsSaved");
    renderCaregiverReport();
  });
}

if (shareSyncSetup) {
  shareSyncSetup.addEventListener("click", () => {
    shareOrCopySetupLink(true);
  });
}

if (copySyncSetup) {
  copySyncSetup.addEventListener("click", () => {
    shareOrCopySetupLink(false);
  });
}

if (copySyncCode) {
  copySyncCode.addEventListener("click", copySetupCode);
}

if (importSyncCode) {
  importSyncCode.addEventListener("click", importSetupCode);
}

if (testSync) {
  testSync.addEventListener("click", sendTestSync);
}

if (loadParentView) {
  loadParentView.addEventListener("click", loadParentViewData);
}

if (parentViewResults) {
  parentViewResults.addEventListener("click", (event) => {
    if (event.target?.id === "copyWeeklyPrompt") {
      copyWeeklyPrompt();
    }
    if (event.target?.id === "copyQuestionGeneratorPrompt") {
      copyQuestionGeneratorPrompt();
    }
    const aiLink = event.target?.closest?.("[data-ai-target]");
    if (aiLink) {
      if (!latestParentViewData) {
        event.preventDefault();
        if (parentViewStatus) {
          parentViewStatus.textContent = "Load parent view first, then open ChatGPT.";
        }
        return;
      }
      copyPromptForAiAssistant(aiLink.dataset.aiTarget);
    }
  });
}

if (lockApp) {
  lockApp.addEventListener("click", () => {
    sessionStorage.removeItem("dailyAdventureUnlocked");
    if (caregiverToggle && caregiverPanel) {
      caregiverToggle.setAttribute("aria-expanded", "false");
      caregiverPanel.hidden = true;
    }
    showPinGate();
  });
}

if (resetProgress) {
  resetProgress.addEventListener("click", () => {
  state.completed = [];
  state.rounds = { brain: 0, life: 0, language: 0, talk: 0 };
  if (talkAnswer) {
    talkAnswer.value = "";
  }
  document.querySelectorAll(".feedback").forEach((feedback) => {
    feedback.textContent = "";
  });
  document.querySelectorAll(".choice, .game-card, .sequence-choice, .tile").forEach((choice) => {
    choice.classList.remove("correct", "wrong", "selected", "matched");
    choice.removeAttribute("data-picked");
  });
  document.querySelectorAll(".mini-feedback").forEach((feedback) => {
    feedback.textContent = feedback.closest("[data-mini-game='sort']")
      ? "Find 2 food choices."
      : feedback.closest("[data-mini-game='pattern']")
        ? "Choose the next color."
        : "Pick the exact amount.";
  });
  memoryPicks = [];
  sequenceStep = 1;
  sortPicks.clear();
  localStorage.removeItem(`dailyAdventureExtraProgress-${todayKey}`);
  sessionStorage.removeItem(`dailyAdventureCoachIndex-${todayKey}`);
  delete history.days[todayKey];
  delete activityLogs[todayKey];
  save();
  saveHistory();
  saveLogs();
  if (hasDailyPage) {
    renderDailyRounds();
    renderMiniGames();
    updateProgress();
  }
  renderCalendar();
  renderCaregiverReport();
  speak("Today's progress has been reset.", "progressReset");
  });
}

function resetSequenceGame() {
  sequenceStep = 1;
  document.querySelectorAll("[data-sequence-game] .sequence-choice").forEach((button) => {
    button.classList.remove("selected", "wrong");
    button.removeAttribute("data-picked");
  });
}

const syncSetupApplied = applyIncomingSyncSetup();

applyAccessibilitySettings();
setupFamilyCodeReveal();
updateGreeting();
if (hasDailyPage) {
  renderDailyRounds();
  renderMiniGames();
  updateProgress();
  updateHistory();
}
renderCaregiverReport();

if (loadParentView) {
  const { url, familyCode } = getSyncConfig();
  if (url && familyCode) {
    loadParentViewData();
  }
}

if (syncSetupApplied && celebration) {
  celebration.textContent = "Sync settings were added on this device.";
}

if (sessionStorage.getItem("dailyAdventureUnlocked") !== "true") {
  showPinGate();
}
