window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("feedback-form");
  const submitBtn = form.querySelector("button[type='submit']");
  const resultsBox = document.getElementById("form-results");
  const popup = document.getElementById("form-popup");

  // Inputs
  const fields = {
    name: document.getElementById("name-field"),
    surname: document.getElementById("surname-field"),
    email: document.getElementById("email-field"),
    phone: document.getElementById("phone-field"),
    address: document.getElementById("address-field"),
    message: document.getElementById("message-field"),
    rating1: document.getElementById("rating1-field"),
    rating2: document.getElementById("rating2-field"),
    rating3: document.getElementById("rating3-field"),
  };

  // Create error text elements dynamically under each field
  Object.values(fields).forEach((input) => {
    const error = document.createElement("div");
    error.classList.add("error-text");
    error.innerText = "Invalid input";
    input.insertAdjacentElement("afterend", error);
  });

  // VALIDATION RULES
  function validateName(value) {
    return /^[A-Za-zÀ-ž\s'-]+$/.test(value);
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateAddress(value) {
    return value.length >= 5;
  }

  function validatePhone(value) {
    return /^\+370 6\d{2} \d{5}$/.test(value);
  }

  function validateNotEmpty(value) {
    return value.trim() !== "";
  }

  // PHONE: +370 6xx xxxxx
  fields.phone.addEventListener("input", () => {
    let digits = fields.phone.value.replace(/\D/g, "");

    if (!digits.startsWith("370")) {
      digits = "370" + digits;
    }

    digits = digits.substring(0, 11);

    let formatted = "+370";

    if (digits.length > 3) formatted += " " + digits[3];
    if (digits.length > 4) formatted += digits[4] + digits[5];
    if (digits.length > 6) formatted += " " + digits.substring(6);

    fields.phone.value = formatted;

    validateField(fields.phone, validatePhone);
    checkFormValidity();
  });

  // ============================
  // VALIDATE SINGLE FIELD
  // ============================

  function validateField(input, validator) {
    const error = input.nextElementSibling;
    const value = input.value.trim();

    if (!validator(value)) {
      input.classList.add("input-error");
      input.classList.remove("input-valid");
      error.classList.add("active");
      return false;
    }

    input.classList.remove("input-error");
    input.classList.add("input-valid");
    error.classList.remove("active");
    return true;
  }

  // Attach validators
  fields.name.addEventListener("input", () => {
    validateField(fields.name, (v) => validateNotEmpty(v) && validateName(v));
    checkFormValidity();
  });

  fields.surname.addEventListener("input", () => {
    validateField(fields.surname, (v) => validateNotEmpty(v) && validateName(v));
    checkFormValidity();
  });

  fields.email.addEventListener("input", () => {
    validateField(fields.email, (v) => validateNotEmpty(v) && validateEmail(v));
    checkFormValidity();
  });

  fields.address.addEventListener("input", () => {
    validateField(fields.address, validateAddress);
    checkFormValidity();
  });

  fields.message.addEventListener("input", checkFormValidity);

  [fields.rating1, fields.rating2, fields.rating3].forEach((rating) => {
    rating.addEventListener("input", checkFormValidity);
  });

  // ENABLE / DISABLE SUBMIT WHEN THE FORM IS VALID
  function checkFormValidity() {
    const valid =
      validateField(fields.name, validateName) &&
      validateField(fields.surname, validateName) &&
      validateField(fields.email, validateEmail) &&
      validateField(fields.address, validateAddress) &&
      validatePhone(fields.phone.value);

    submitBtn.disabled = !valid;
    submitBtn.style.opacity = valid ? "1" : "0.6";
    submitBtn.style.pointerEvents = valid ? "auto" : "none";
  }

  checkFormValidity();

  // SUBMIT HANDLING
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const rating1 = Number(fields.rating1.value);
    const rating2 = Number(fields.rating2.value);
    const rating3 = Number(fields.rating3.value);
    const avg = Number(((rating1 + rating2 + rating3) / 3).toFixed(1));

    const formData = {
      name: fields.name.value,
      surname: fields.surname.value,
      email: fields.email.value,
      phone: fields.phone.value,
      address: fields.address.value,
      message: fields.message.value,
      rating1,
      rating2,
      rating3,
      average: avg,
    };

    console.log("Form data:", formData);

    resultsBox.innerHTML = `
      <p><strong>Name:</strong> ${formData.name}</p>
      <p><strong>Surname:</strong> ${formData.surname}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Phone number:</strong> ${formData.phone}</p>
      <p><strong>Address:</strong> ${formData.address}</p>
      <p><strong>Rating 1:</strong> ${rating1}</p>
      <p><strong>Rating 2:</strong> ${rating2}</p>
      <p><strong>Rating 3:</strong> ${rating3}</p>
      <p><strong>Average:</strong> <span id="average-output">${avg}</span></p>
      <p><strong>${formData.name} ${formData.surname}:</strong> ${avg}</p>
    `;

    const avgSpan = document.getElementById("average-output");
    if (avg < 4) avgSpan.style.color = "red";
    else if (avg < 7) avgSpan.style.color = "orange";
    else avgSpan.style.color = "green";

    // Popup
    popup.classList.add("show");
    setTimeout(() => popup.classList.remove("show"), 3000);
  });


  // MEMORY GAME
  const memoryBoard = document.getElementById("memory-board");
  const difficultySelect = document.getElementById("memory-difficulty");
  const startBtn = document.getElementById("memory-start");
  const restartBtn = document.getElementById("memory-restart");
  const movesSpan = document.getElementById("memory-moves");
  const matchesSpan = document.getElementById("memory-matches");
  const totalSpan = document.getElementById("memory-total");
  const messageBox = document.getElementById("memory-message");

  if (memoryBoard && difficultySelect && startBtn && restartBtn) {

    // Base data: at least 6 unique items (emojis/icons)
    const baseItems = [
    "🐍", 
    "🤖", 
    "🧠",
    "📊", 
    "💻", 
    "📚", 
    "⚙️",
    "🔬", 
    "🛰️", 
    "🚀", 
    "💡", 
    "🧪", 
    "📡", 
    "🔧", 
    "📝", 
    "🗂️"  
  ];

    const difficultyConfig = {
      easy: { cols: 4, rows: 3 }, // 12 cards, 6 pairs
      hard: { cols: 6, rows: 4 }, // 24 cards, 12 pairs
    };

    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let moves = 0;
    let matches = 0;
    let totalPairs = 0;
    let gameStarted = false;

    const bestEasySpan = document.getElementById("best-easy");
    const bestHardSpan = document.getElementById("best-hard");

    // Load existing best scores or set to null
    function loadBestScores() {
      bestEasySpan.textContent =
        localStorage.getItem("memory_best_easy") || "–";
      bestHardSpan.textContent =
        localStorage.getItem("memory_best_hard") || "–";
    }

    // Compare & update best score per difficulty
    function updateBestScore(finalMoves) {
      const difficulty = difficultySelect.value;

      const key =
        difficulty === "easy" ? "memory_best_easy" : "memory_best_hard";

      const stored = localStorage.getItem(key);

      if (stored === null || finalMoves < Number(stored)) {
        localStorage.setItem(key, finalMoves);
        if (difficulty === "easy") bestEasySpan.textContent = finalMoves;
        else bestHardSpan.textContent = finalMoves;
      }
    }

    // Load on page start
    loadBestScores();

    let timerInterval = null;
    let timerSeconds = 0;

    const timerSpan = document.getElementById("memory-timer");

    function formatTime(sec) {
      const m = String(Math.floor(sec / 60)).padStart(2, "0");
      const s = String(sec % 60).padStart(2, "0");
      return `${m}:${s}`;
    }

    function startTimer() {
      timerSeconds = 0;
      timerSpan.textContent = "00:00";

      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        timerSeconds++;
        timerSpan.textContent = formatTime(timerSeconds);
      }, 1000);
    }

    function stopTimer() {
      clearInterval(timerInterval);
    }

    function resetTimer() {
      clearInterval(timerInterval);
      timerSeconds = 0;
      timerSpan.textContent = "00:00";
    }

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    function resetStats() {
      moves = 0;
      matches = 0;
      movesSpan.textContent = "0";
      matchesSpan.textContent = "0";
      totalSpan.textContent = totalPairs.toString();
      messageBox.textContent = "";
      messageBox.classList.remove("win");
    }

    function updateStats() {
      movesSpan.textContent = moves.toString();
      matchesSpan.textContent = matches.toString();
    }

    function createCardElement(symbol) {
      const card = document.createElement("div");
      card.classList.add("memory-card");
      card.dataset.value = symbol;

      const inner = document.createElement("div");
      inner.classList.add("memory-card-inner");

      const front = document.createElement("div");
      front.classList.add("memory-card-front");
      front.textContent = "?";

      const back = document.createElement("div");
      back.classList.add("memory-card-back");
      back.textContent = symbol;

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);

      card.addEventListener("click", () => handleCardClick(card));
      return card;
    }

    function initGame() {
      resetTimer();
      const difficulty = difficultySelect.value || "easy";
      const { cols, rows } = difficultyConfig[difficulty];

      const cardsCount = cols * rows;
      totalPairs = cardsCount / 2;

      // Prepare items: pick pairs from baseItems
      let requiredUnique = totalPairs;
      if (requiredUnique > baseItems.length) {
        requiredUnique = baseItems.length;
      }

      const selected = shuffle([...baseItems]).slice(0, requiredUnique);
      let cardsData = [...selected, ...selected]; // each twice

      // If we have fewer than needed (e.g., baseItems shorter),
      // we could repeat some again, but with 8 items it's enough.

      cardsData = shuffle(cardsData);

      // Set grid
      memoryBoard.innerHTML = "";
      memoryBoard.style.gridTemplateColumns = `repeat(${cols}, minmax(70px, 1fr))`;

      cardsData.forEach((symbol) => {
        const cardEl = createCardElement(symbol);
        memoryBoard.appendChild(cardEl);
      });

      resetStats();
      restartBtn.disabled = false;
      gameStarted = true;
      firstCard = null;
      secondCard = null;
      lockBoard = false;
    }

    function handleCardClick(card) {
      if (!gameStarted) return;
      if (lockBoard) return;
      if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

      card.classList.add("flipped");

      if (!firstCard) {
        firstCard = card;
        return;
      }

      // second card
      secondCard = card;
      moves++;
      updateStats();

      checkForMatch();
    }

    function checkForMatch() {
      const isMatch = firstCard.dataset.value === secondCard.dataset.value;

      if (isMatch) {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");
        firstCard = null;
        secondCard = null;
        matches++;
        updateStats();

        if (matches === totalPairs) {
          messageBox.textContent = "🎉 You matched all pairs! Well done!";
          messageBox.classList.add("win");

          stopTimer();                 
          updateBestScore(moves);  
        }
      } else {
        lockBoard = true;
        setTimeout(() => {
          firstCard.classList.remove("flipped");
          secondCard.classList.remove("flipped");
          firstCard = null;
          secondCard = null;
          lockBoard = false;
        }, 1000);
      }
    }

    // Events
    startBtn.addEventListener("click", () => {
      initGame();
      startTimer();
    });

    restartBtn.addEventListener("click", () => {
      initGame();
      startTimer();
    });

    difficultySelect.addEventListener("change", () => {
      if (gameStarted) {
        initGame();
        startTimer();
      }
    });
  }

});
