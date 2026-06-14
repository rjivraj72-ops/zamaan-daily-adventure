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
  return ((diff % 14) + 14) % 14;
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

const todayPlan = curriculum[curriculumDay];
const todayLanguage = languageDecks[curriculumDay];
const todayMoneyMath = moneyMathDecks[curriculumDay];
const todayBusinessPractice = businessPracticeDecks[curriculumDay];
const todayPronounPractice = pronounPracticeDecks[curriculumDay];

const title = document.querySelector("#page-title");
const todayLabel = document.querySelector("#todayLabel");
const progressCount = document.querySelector("#progressCount");
const progressBar = document.querySelector("#progressBar");
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
const promptInput = document.querySelector("#promptInput");
const messageInput = document.querySelector("#messageInput");
const pinInput = document.querySelector("#pinInput");
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

let memoryPicks = [];
let sequenceStep = 1;
let enteredPin = "";
let selectedAnswerStyle = "first";
const sortPicks = new Set();

function save() {
  localStorage.setItem("dailyAdventure", JSON.stringify(state));
}

function saveHistory() {
  localStorage.setItem("dailyAdventureHistory", JSON.stringify(history));
}

function saveLogs() {
  localStorage.setItem("dailyAdventureLogs", JSON.stringify(activityLogs));
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
    curriculumDay: curriculumDay + 1,
    plan: todayPlan.name,
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

function logLearningAttempt(gameName, titleText, promptText, selectedAnswer, correctAnswer, isCorrect) {
  const result = isCorrect ? "Correct" : "Try again";
  sendSyncPayload({
    date: todayKey,
    childName: state.name,
    mood: state.mood,
    curriculumDay: curriculumDay + 1,
    plan: todayPlan.name,
    section: "Learning Game Attempt",
    round: "",
    title: `${gameName}: ${titleText}`,
    prompt: promptText,
    answer: `Selected: ${selectedAnswer} | Correct: ${correctAnswer} | Result: ${result}`,
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
    curriculumDay: curriculumDay + 1,
    plan: todayPlan.name,
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
  pinMessage.textContent = "";
  document.body.classList.add("locked");
}

function unlockApp() {
  sessionStorage.setItem("dailyAdventureUnlocked", "true");
  document.body.classList.remove("locked");
  const welcomeMessage = `Welcome, ${state.name}. Ready for today's adventure?`;
  celebration.textContent = welcomeMessage;
  speak(welcomeMessage);
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

  pinMessage.textContent = "Try again.";
  speak("Try again.");
  enteredPin = "";
  updatePinDisplay();
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
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
  speak(getRoundTotal() === totalRounds
    ? `Congratulations, ${state.name}. You finished today's adventure.`
    : message);
}

function nextActivityId() {
  return sectionIds.find((id) => !state.completed.includes(id)) || "talk";
}

function updateGreeting() {
  title.textContent = `Hi, ${state.name}. Ready for today's adventure?`;
  document.querySelector(".intro").textContent = `Today is Day ${curriculumDay + 1} of 14: ${todayPlan.name}. Four short sections plus extra learning games.`;
  nameInput.value = state.name;
  promptInput.value = state.talkPrompt;
  messageInput.value = state.message;
  pinInput.value = getAppPin();
  if (syncUrlInput) {
    syncUrlInput.value = getSyncConfig().url;
  }
  if (familyCodeInput) {
    familyCodeInput.value = getSyncConfig().familyCode;
  }
  updateSyncStatus();
}

function updateProgress() {
  const doneRounds = getRoundTotal();
  const doneSections = state.completed.length;
  progressCount.textContent = `${doneRounds} of ${totalRounds} rounds`;
  progressBar.style.width = `${(doneRounds / totalRounds) * 100}%`;

  stars.forEach((star, index) => {
    star.classList.toggle("earned", index < doneSections);
  });

  activities.forEach((activity) => {
    const id = activity.dataset.activity;
    const round = Math.min(state.rounds[id] + 1, maxRounds[id]);
    const type = activity.querySelector(".activity-type");
    const isDone = state.completed.includes(id);

    activity.classList.toggle("done", isDone);
    activity.classList.toggle("active", id === nextActivityId());
    type.textContent = isDone
      ? `${labelFor(id)} complete`
      : `${labelFor(id)} ${round} of ${maxRounds[id]}`;
  });

  celebration.textContent = doneRounds === totalRounds
    ? `Congratulations, ${state.name}. ${state.message}`
    : doneRounds > 0
      ? "Good progress. Another short round is ready."
      : "Finish rounds to earn stars and mark the calendar.";
}

function renderCaregiverReport() {
  if (!reportSummary || !reportList) return;

  const logs = getTodayLogs();
  const doneRounds = getRoundTotal();
  const mood = state.mood ? ` Mood: ${state.mood}.` : "";
  reportSummary.textContent = `${doneRounds} of ${totalRounds} rounds completed. Day ${curriculumDay + 1}: ${todayPlan.name}.${mood}`;

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
  const todayHtml = today
    ? `
      <article class="parent-card highlight">
        <small>Today</small>
        <strong>${escapeHtml(today.rounds)} of ${totalRounds} rounds · ${escapeHtml(today.status)}</strong>
        <span>Mood: ${escapeHtml(today.mood || "Not picked yet")}</span>
        <span>Plan: ${escapeHtml(today.plan || "Daily Adventure")}</span>
        <span>Last completed: ${escapeHtml(today.lastCompleted || "Not yet")}</span>
      </article>
    `
    : `
      <article class="parent-card highlight">
        <small>Today</small>
        <strong>No shared Sheet data for today yet.</strong>
        <span>Once Zamaan completes a round on a synced device, it will appear here.</span>
      </article>
    `;

  const dailyHtml = (data.recentDaily || []).length
    ? data.recentDaily.map((day) => `
      <article class="parent-list-item">
        <strong>${escapeHtml(day.date)} · ${escapeHtml(day.status)}</strong>
        <span>${escapeHtml(day.rounds)} of ${totalRounds} rounds, ${escapeHtml(day.completion)} complete</span>
      </article>
    `).join("")
    : `<p class="parent-empty">No recent daily summaries yet.</p>`;

  const talkHtml = (data.recentTalk || []).length
    ? data.recentTalk.map((item) => `
      <article class="parent-list-item">
        <strong>${escapeHtml(item.date)} · ${escapeHtml(item.responseType)}</strong>
        <span>${escapeHtml(item.prompt)}</span>
        <em>${escapeHtml(item.answer || "No typed answer")}</em>
      </article>
    `).join("")
    : `<p class="parent-empty">No Talk Time answers yet.</p>`;

  const attemptsHtml = (data.learningAttempts || []).length
    ? data.learningAttempts.map((item) => `
      <article class="parent-list-item">
        <strong>${escapeHtml(item.game)}</strong>
        <span>${escapeHtml(item.correct)} correct out of ${escapeHtml(item.attempts)} attempts · ${escapeHtml(item.accuracy)}</span>
      </article>
    `).join("")
    : `<p class="parent-empty">No extra learning-game attempts yet.</p>`;

  parentViewResults.innerHTML = `
    <div class="parent-summary-grid">
      ${todayHtml}
      <article class="parent-card">
        <small>Overall</small>
        <strong>${escapeHtml(data.dashboard.completedDays)} complete days</strong>
        <span>${escapeHtml(data.dashboard.totalRounds)} total rounds</span>
        <span>${escapeHtml(data.dashboard.completionRate)} completion rate</span>
      </article>
      <article class="parent-card">
        <small>Learning games</small>
        <strong>${escapeHtml(data.dashboard.attemptAccuracy)} accuracy</strong>
        <span>${escapeHtml(data.dashboard.correctAttempts)} correct out of ${escapeHtml(data.dashboard.totalAttempts)} attempts</span>
      </article>
    </div>
    <div class="parent-list">
      <h4>Last 7 Days</h4>
      ${dailyHtml}
    </div>
    <div class="parent-list">
      <h4>Recent Talk Time</h4>
      ${talkHtml}
    </div>
    <div class="parent-list">
      <h4>Learning Game Attempts</h4>
      ${attemptsHtml}
    </div>
  `;
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
  const round = Math.min(state.rounds.brain, maxRounds.brain - 1);
  const deck = todayPlan.brain[round];
  const activity = document.querySelector('[data-activity="brain"]');

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
  const round = Math.min(state.rounds.talk, maxRounds.talk - 1);
  const prompt = round === 0 && state.talkPrompt !== defaultState.talkPrompt
    ? state.talkPrompt
    : todayPlan.talk[round];
  const activity = document.querySelector('[data-activity="talk"]');

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
  renderBrainRound();
  renderLifeRound();
  renderLanguageRound();
  renderTalkRound();
  attachRoundHandlers();
}

function renderMiniGames() {
  const sortChoices = [...todayPlan.mini.sort.correct, ...todayPlan.mini.sort.wrong];
  const pattern = todayPlan.mini.pattern;
  const moneyMathQuestions = todayMoneyMath;
  const businessPractice = todayBusinessPractice;
  const pronounPractice = todayPronounPractice;

  miniGames.innerHTML = `
    <article class="mini-game" data-mini-game="sort">
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

    <article class="mini-game" data-mini-game="pattern">
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

    <article class="mini-game" data-mini-game="money-math">
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

    <article class="mini-game" data-mini-game="business">
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

    <article class="mini-game" data-mini-game="pronouns">
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
  `;

  attachMiniGameHandlers();
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
      speak(card.textContent);

      if (memoryPicks.length < 2) {
        feedback.textContent = "Pick one more card.";
        return;
      }

      const [first, second] = memoryPicks;
      const isMatch = first.dataset.pair === second.dataset.pair;

      if (isMatch) {
        first.classList.add("matched");
        second.classList.add("matched");
        const roundIndex = Math.min(state.rounds.brain, maxRounds.brain - 1);
        const deck = todayPlan.brain[roundIndex];
        const isLast = state.rounds.brain + 1 >= maxRounds.brain;
        const message = isLast ? "Memory section complete." : "That's a pair. New cards are ready.";
        feedback.textContent = message;
        completeRound("brain", message, {
          title: deck.title,
          prompt: `${deck.prompt} Matched: ${first.textContent} and ${second.textContent}.`
        });
        window.setTimeout(renderDailyRounds, 700);
      } else {
        first.classList.add("wrong");
        second.classList.add("wrong");
        feedback.textContent = "Good try. Those are different. Try again.";
        speak("Good try. Those are different. Try again.");
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

      if (button.classList.contains("selected")) return;

      if (order === sequenceStep) {
        button.classList.add("selected");
        button.dataset.picked = String(sequenceStep);
        sequenceStep += 1;

        if (sequenceStep > 3) {
          const roundIndex = Math.min(state.rounds.life, maxRounds.life - 1);
          const deck = todayPlan.life[roundIndex];
          const isLast = state.rounds.life + 1 >= maxRounds.life;
          const message = isLast ? "Life skills section complete." : "You put the steps in order. New steps are ready.";
          feedback.textContent = message;
          completeRound("life", message, {
            title: deck.title,
            prompt: deck.steps.join(" → ")
          });
          window.setTimeout(renderDailyRounds, 700);
        } else {
          feedback.textContent = `Good. Now find step ${sequenceStep}.`;
          speak(`Good. Now find step ${sequenceStep}.`);
        }
        return;
      }

      button.classList.add("wrong");
      feedback.textContent = "Good try. Start with step 1.";
      speak("Good try. Start with step 1.");
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
      const isCorrect = button.dataset.languageChoice === deck.spanish;

      activity.querySelectorAll(".language-choice").forEach((choice) => {
        choice.classList.remove("correct", "wrong");
      });

      if (!isCorrect) {
        button.classList.add("wrong");
        feedback.textContent = "Good try. Try another word.";
        speak("Good try. Try another word.");
        return;
      }

      button.classList.add("correct");
      const isLast = state.rounds.language + 1 >= maxRounds.language;
      const message = isLast ? "Spanish cards complete." : "Correct. New Spanish card is ready.";
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
    plan: todayPlan.name,
    day: curriculumDay + 1,
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

todayLabel.textContent = `${new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "short",
  day: "numeric"
}).format(new Date())} · Day ${curriculumDay + 1} of 14`;

document.querySelectorAll(".mood-button").forEach((button) => {
  button.classList.toggle("selected", button.dataset.mood === state.mood);
  button.addEventListener("click", () => {
    state.mood = button.dataset.mood;
    document.querySelectorAll(".mood-button").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    save();
    updateHistory();
    speak(`You chose ${state.mood}.`);
  });
});

document.querySelectorAll("[data-pin-key]").forEach((button) => {
  button.addEventListener("click", () => {
    if (enteredPin.length >= 8) return;
    enteredPin += button.dataset.pinKey;
    pinMessage.textContent = "";
    updatePinDisplay();

    if (enteredPin.length === getAppPin().length) {
      window.setTimeout(checkPin, 120);
    }
  });
});

document.querySelector("[data-pin-clear]").addEventListener("click", () => {
  enteredPin = "";
  pinMessage.textContent = "";
  updatePinDisplay();
});

document.querySelector("[data-pin-back]").addEventListener("click", () => {
  enteredPin = enteredPin.slice(0, -1);
  pinMessage.textContent = "";
  updatePinDisplay();
});

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
        tile.classList.add("selected", "correct");
        sortPicks.add(tile.textContent);
        feedback.textContent = sortPicks.size === todayPlan.mini.sort.correct.length
          ? todayPlan.mini.sort.success
          : "Yes. Find one more.";
        speak(feedback.textContent);
      } else {
        tile.classList.add("wrong");
        feedback.textContent = "Good try. Pick a different one.";
        speak("Good try. Pick a different one.");
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
      feedback.textContent = isCorrect
        ? `Yes. ${capitalize(todayPlan.mini.pattern.answer)} comes next.`
        : "Good try. Look at the pattern again.";
      speak(feedback.textContent);
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
        question.dataset.answered = "true";
      }

      const answeredCount = game.querySelectorAll(".money-question[data-answered='true']").length;
      feedback.textContent = isCorrect
        ? answeredCount === todayMoneyMath.length
          ? "Nice money math. You answered all 3."
          : `Correct. ${currentQuestion.answer} is right.`
        : "Good try. Count the dollars again.";
      speak(feedback.textContent);
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
      feedback.textContent = isCorrect
        ? "Good business choice."
        : "Good try. Pick the kind business action.";
      speak(feedback.textContent);
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
      feedback.textContent = isCorrect
        ? "Good family word."
        : "Good try. Think about who the person is to Zamaan.";
      speak(feedback.textContent);
    });
  });
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

document.querySelector("[data-complete-talk]").addEventListener("click", () => {
  if (state.completed.includes("talk")) return;

  const answer = talkAnswer.value.trim();
  const prompt = talkPrompt.textContent;
  const answerStyle = answerStyleHints[selectedAnswerStyle] || answerStyleHints.first;
  const isLast = state.rounds.talk + 1 >= maxRounds.talk;
  const message = answer
    ? isLast ? "Thank you for sharing. Talk Time is complete." : "Thank you for sharing. New question is ready."
    : isLast ? "Talk Time is complete." : "New Talk Time question is ready.";
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

answerStyleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedAnswerStyle = button.dataset.answerStyle || "first";
    updateAnswerStyleUi();
    speak(selectedAnswerStyle === "third"
      ? "Zamaan answer."
      : "I and my answer.");
  });
});

caregiverToggle.addEventListener("click", () => {
  const isOpen = caregiverToggle.getAttribute("aria-expanded") === "true";
  caregiverToggle.setAttribute("aria-expanded", String(!isOpen));
  caregiverPanel.hidden = isOpen;
  if (isOpen === false) {
    renderCaregiverReport();
  }
});

document.querySelector("#saveSettings").addEventListener("click", () => {
  state.name = nameInput.value.trim() || "Zamaan";
  state.talkPrompt = promptInput.value.trim() || defaultState.talkPrompt;
  state.message = messageInput.value.trim() || defaultState.message;
  saveAppPin(pinInput.value.replace(/\D/g, "").slice(0, 8) || "1234");
  saveSyncConfig();
  save();
  updateGreeting();
  renderTalkRound();
  celebration.textContent = "Settings saved.";
  speak("Settings saved.");
});

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

lockApp.addEventListener("click", () => {
  sessionStorage.removeItem("dailyAdventureUnlocked");
  caregiverToggle.setAttribute("aria-expanded", "false");
  caregiverPanel.hidden = true;
  showPinGate();
});

resetProgress.addEventListener("click", () => {
  state.completed = [];
  state.rounds = { brain: 0, life: 0, language: 0, talk: 0 };
  talkAnswer.value = "";
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
  delete history.days[todayKey];
  delete activityLogs[todayKey];
  save();
  saveHistory();
  saveLogs();
  renderDailyRounds();
  renderMiniGames();
  updateProgress();
  renderCalendar();
  renderCaregiverReport();
  speak("Today's progress has been reset.");
});

function resetSequenceGame() {
  sequenceStep = 1;
  document.querySelectorAll("[data-sequence-game] .sequence-choice").forEach((button) => {
    button.classList.remove("selected", "wrong");
    button.removeAttribute("data-picked");
  });
}

const syncSetupApplied = applyIncomingSyncSetup();

updateGreeting();
renderDailyRounds();
renderMiniGames();
updateProgress();
updateHistory();
renderCaregiverReport();

if (syncSetupApplied) {
  celebration.textContent = "Sync settings were added on this device.";
}

if (sessionStorage.getItem("dailyAdventureUnlocked") !== "true") {
  showPinGate();
}
