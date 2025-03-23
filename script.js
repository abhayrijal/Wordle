const letters = document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector(".info-bar");
const message = document.getElementById("message");
const MAX_LENGTH = 5;
const ROUNDS = 6;

async function init() {
  let currentGuess = "";
  let currentRow = 0;
  let isLoading = true;

  const res = await fetch(
    "https://words.dev-apis.com/word-of-the-day?random=1"
  );
  const resObj = await res.json();
  const word = resObj.word.toUpperCase();
  const wordLetters = word.split("");
  let done = false;
  setLoading(false);
  isLoading = false;

  function addLetter(letter) {
    if (currentGuess.length < MAX_LENGTH) {
      //add letter to the last
      currentGuess += letter;
    } else {
      //replaces the last letter
      currentGuess =
        currentGuess.substring(0, currentGuess.length - 1) + letter;
    }
    //takes inout letter and adds it to the last letter
    letters[MAX_LENGTH * currentRow + currentGuess.length - 1].innerText =
      letter;
  }

  async function getWord() {
    if (currentGuess.length !== MAX_LENGTH) {
      //do nothing
      return;
    }

    //Validate the word
    isLoading = true;
    setLoading(true);
    const res = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      body: JSON.stringify({ word: currentGuess }),
    });

    const resObj = await res.json();
    const validWord = resObj.validWord;

    isLoading = false;
    setLoading(false);

    if (!validWord) {
      markInvalidWord();
      return;
    }

    //Do all the marking as "correct" or "close" or "wrong"

    const guessLetters = currentGuess.split("");
    const map = makeMap(wordLetters);

    for (let i = 0; i < MAX_LENGTH; i++) {
      //mark as correct
      if (guessLetters[i] === wordLetters[i]) {
        letters[currentRow * MAX_LENGTH + i].classList.add("correct");
        map[guessLetters[i]]--;
      }
    }

    for (let i = 0; i < MAX_LENGTH; i++) {
      if (guessLetters[i] === wordLetters[i]) {
        //do nothing
      } else if (
        wordLetters.includes(guessLetters[i]) &&
        map[guessLetters[i]] > 0
      ) {
        //mark as close
        letters[currentRow * MAX_LENGTH + i].classList.add("close");
        map[guessLetters[i]]--;
      } else {
        //mark as wrong
        letters[currentRow * MAX_LENGTH + i].classList.add("wrong");
      }
    }
    currentRow++;

    if (currentGuess === word) {
      //win
      message.innerText = "Congratulations, You win!";
      document.querySelector(".navbar").classList.add("winner");
      done = true;
      return;
      //loss
    } else if (currentRow === ROUNDS) {
      message.innerText = `You lose! The word was ${word}`;
      message.style.display = "block";
      setTimeout(() => {
        message.style.display = "none";
      }, 3000);
      done = true;
    }
    currentGuess = "";
  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[MAX_LENGTH * currentRow + currentGuess.length].innerText = "";
  }

  function markInvalidWord() {
    for (let i = 0; i < MAX_LENGTH; i++) {
      letters[currentRow * MAX_LENGTH + i].classList.remove("invalid");

      setTimeout(() => {
        letters[currentRow * MAX_LENGTH + i].classList.add("invalid");
      }, 10);
    }
    message.textContent = "Invalid word";
    message.style.display = "block";
    setTimeout(() => {
      message.style.display = "none";
    }, 500);
  }

  document.addEventListener("keydown", function handleKeyPress(event) {
    if (isLoading || done) {
      //do nothing
      return;
    }

    const action = event.key;

    if (action === "Enter") {
      getWord();
    } else if (action === "Backspace") {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    } else {
      // do nothing
    }
  });
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
  loadingDiv.classList.toggle("hidden", !isLoading);
}

function makeMap(array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++;
    } else {
      obj[letter] = 1;
    }
  }
  return obj;
}

init();
