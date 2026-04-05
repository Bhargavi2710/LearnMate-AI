/* =========================================
   SMARTLEARN - CORE LOGIC
========================================= */

// --- 1. STATE & ROUTING --- //

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

function loadTheme() {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
}

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active-page"));
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));

  const pg = document.getElementById(pageId);
  pg.classList.remove("hidden");
  pg.classList.add("active-page");

  // Handle Navbar Visibility
  if (pageId === "login") {
    document.getElementById("navbar").style.display = "none";
    document.getElementById("footer").style.display = "none";
  } else {
    document.getElementById("navbar").style.display = "flex";
    document.getElementById("footer").style.display = "block";
  }

  // Page specific loads
  if (pageId === "dashboard") loadDashboard();
  if (pageId === "practice") resetPracticeQuizState();
  if (pageId === "revision") {
    loadFlashcards();
    loadFormulas();
  }
  if (pageId === "exam") resetExamState();
  if (pageId === "planner") loadSchedule();
}

function doLogin() {
  localStorage.setItem("isLoggedIn", "true");
  showPage('dashboard');
}

function logout() {
  localStorage.removeItem("isLoggedIn");
  showPage('login');
}

function toggleMobileMenu() {
  document.getElementById("mobileMenu").classList.toggle("hidden");
}

// --- 2. ONLINE/OFFLINE STATUS --- //

function updateStatus() {
  const dot = document.getElementById("statusDot");
  const text = document.getElementById("statusText");
  const chatStatus = document.getElementById("aiChatStatus");

  if (navigator.onLine) {
    dot.classList.remove("offline");
    text.textContent = "Online";
    if (chatStatus) chatStatus.textContent = "Online (API Ready)";
  } else {
    dot.classList.add("offline");
    text.textContent = "Offline";
    if (chatStatus) {
      chatStatus.textContent = "Offline (Local Engine)";
      chatStatus.style.color = "var(--warning)";
    }
  }
}

window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);

// --- 3. MOCK DATA (Python, C, Java) --- //

const DATA = {
  Python: {
    color: "#306998",
    topics: {
      "Introduction & Syntax": {
        notes: "Python is an interpreted, high-level, general-purpose programming language.",
        keyPoints: ["No semicolons needed", "Indentation defines code blocks", "Dynamically typed"],
        formula: "print('Hello World!')"
      },
      "Data Types & Structures": {
        notes: "Python has several built-in types including lists, tuples, dictionaries, and sets.",
        keyPoints: ["Lists are mutable `[]`", "Tuples are immutable `()`", "Dicts act as Key-Value stores `{}`"],
        formula: "my_list = [1, 2, 3]\nmy_dict = {'key': 'value'}"
      },
      "Functions": {
        notes: "A function is a block of code which only runs when it is called.",
        keyPoints: ["Defined using 'def' keyword", "Can return values using 'return'"],
        formula: "def add(a, b):\n    return a + b"
      }
    }
  },
  C: {
    color: "#A8B9CC",
    topics: {
      "Introduction & Pointers": {
        notes: "C is a procedural programming language. It is extremely fast and provides low-level memory access.",
        keyPoints: ["Pointers store memory addresses", "Uses compiler (gcc)", "Statically typed"],
        formula: "int x = 10;\nint *ptr = &x;"
      },
      "Memory Management": {
        notes: "C requires manual management of memory layout using stdlib tools.",
        keyPoints: ["malloc() allocates memory", "free() deallocates memory", "Memory leaks occur if free() is omitted"],
        formula: "int *arr = (int*)malloc(5 * sizeof(int));\nfree(arr);"
      }
    }
  },
  Java: {
    color: "#f8981d",
    topics: {
      "OOP Concepts": {
        notes: "Java is strictly Object-Oriented. Everything is inside a class.",
        keyPoints: ["Encapsulation, Inheritance, Polymorphism, Abstraction", "Entry point is public static void main"],
        formula: "class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hi\");\n  }\n}"
      },
      "Exception Handling": {
        notes: "Errors are handled using try-catch blocks to prevent app crashes.",
        keyPoints: ["Checked vs Unchecked exceptions", "finally block always executes"],
        formula: "try {\n  int x = 10 / 0;\n} catch (Exception e) {\n  e.printStackTrace();\n}"
      }
    }
  },
  "C++": {
    color: "#00599C",
    topics: {
      "Classes and Objects": {
        notes: "C++ is an extension of C that adds object-oriented programming.",
        keyPoints: ["Classes define structure", "Objects are instances", "Constructors initialize objects"],
        formula: "class Car {\n  public:\n    string brand;\n};"
      }
    }
  },
  "DS": {
    color: "#8E44AD",
    topics: {
      "Arrays and Linked Lists": {
        notes: "Data Structures are ways to store and organize data efficiently.",
        keyPoints: ["Arrays are contiguous memory", "Linked Lists use pointers", "Time complexity matters"],
        formula: "struct Node {\n  int data;\n  struct Node* next;\n};"
      }
    }
  },
  "HTML": {
    color: "#E34F26",
    topics: {
      "Tags and Elements": {
        notes: "HTML is the standard markup language for creating Web pages.",
        keyPoints: ["Elements hold content", "Tags define structure", "Attributes provide extra info"],
        formula: "<div class='container'>\n  <p>Hello</p>\n</div>"
      }
    }
  },
  "CSS": {
    color: "#1572B6",
    topics: {
      "Selectors and Styling": {
        notes: "CSS is used to style and layout web pages.",
        keyPoints: ["Selectors target HTML elements", "Properties define visual traits", "Flexbox and Grid for layout"],
        formula: ".box {\n  color: blue;\n  display: flex;\n}"
      }
    }
  }
};

const QUIZ_BANK = [
  { subject: "Python", q: "How do you start a comment in Python?", options: ["#", "//", "/*", "<!--"], ans: "#" },
  { subject: "Python", q: "Which of these is a Python List?", options: ["(1, 2)", "{1, 2}", "[1, 2]", "<1, 2>"], ans: "[1, 2]" },
  { subject: "Python", q: "What is the Python keyword used to define a function?", options: ["function", "def", "func", "define"], ans: "def" },
  { subject: "Python", q: "How do you print something in Python?", options: ["echo()", "printf()", "print()", "console.log()"], ans: "print()" },
  { subject: "Python", q: "What is the output of 2 ** 3 in Python?", options: ["5", "6", "8", "9"], ans: "8" },
  { subject: "Python", q: "Which data type is immutable?", options: ["List", "Dictionary", "Set", "Tuple"], ans: "Tuple" },
  { subject: "Python", q: "Which function gets the length of a list?", options: ["length()", "size()", "len()", "count()"], ans: "len()" },
  { subject: "Python", q: "How do you create a dictionary?", options: ["[]", "{}", "()", "<>"], ans: "{}" },
  { subject: "Python", q: "What is the boolean operator for AND?", options: ["&", "&&", "and", "AND"], ans: "and" },
  { subject: "Python", q: "Which keyword creates a loop?", options: ["for", "loop", "iterate", "repeat"], ans: "for" },
  { subject: "Python", q: "What does pip stand for?", options: ["Python Install Package", "Pip Installs Packages", "Primary Install Process", "Nothing"], ans: "Pip Installs Packages" },
  { subject: "Python", q: "How to check if a type is string?", options: ["isString()", "type(x) == str", "typeof x", "is_str()"], ans: "type(x) == str" },
  { subject: "Python", q: "Which method adds to the end of a list?", options: ["push()", "add()", "insert()", "append()"], ans: "append()" },
  { subject: "Python", q: "Which exception is thrown for division by zero?", options: ["ArithmeticError", "ZeroDivisionError", "MathError", "DivideError"], ans: "ZeroDivisionError" },
  { subject: "Python", q: "How to import a module?", options: ["import module_name", "include module_name", "require(module_name)", "using module_name"], ans: "import module_name" },
  { subject: "Python", q: "What is the self keyword used for?", options: ["Current class instance", "Self execution", "Static variables", "Nothing"], ans: "Current class instance" },
  { subject: "C", q: "What does the & operator do in C?", options: ["Logical AND", "Bitwise AND", "Gets memory address", "Declares pointer"], ans: "Gets memory address" },
  { subject: "C", q: "Which function frees allocated memory in C?", options: ["delete", "remove()", "free()", "clear()"], ans: "free()" },
  { subject: "Java", q: "Which keyword creates a new object in Java?", options: ["object", "new", "class", "create"], ans: "new" },
  { subject: "Java", q: "What is the size of an int in Java?", options: ["2 bytes", "4 bytes", "8 bytes", "Depends on OS"], ans: "4 bytes" },
  { subject: "C++", q: "Which of the following is the correct syntax to print something in C++?", options: ["System.out.println()", "printf()", "console.log()", "cout <<"], ans: "cout <<" },
  { subject: "C++", q: "Which feature of OOP indicates code reusability?", options: ["Polymorphism", "Encapsulation", "Inheritance", "Abstraction"], ans: "Inheritance" },
  { subject: "DS", q: "Which data structure uses LIFO (Last In First Out)?", options: ["Queue", "Stack", "Tree", "Graph"], ans: "Stack" },
  { subject: "DS", q: "What is the time complexity of searching in a Hash Table (average case)?", options: ["O(log n)", "O(n)", "O(1)", "O(n^2)"], ans: "O(1)" },
  { subject: "HTML", q: "Which tag is used for the largest heading?", options: ["<h6>", "<head>", "<h1>", "<header>"], ans: "<h1>" },
  { subject: "HTML", q: "Which HTML attribute specifies an alternate text for an image?", options: ["title", "alt", "src", "href"], ans: "alt" },
  { subject: "CSS", q: "How do you select an element with id 'demo'?", options: [".demo", "#demo", "*demo", "demo"], ans: "#demo" },
  { subject: "CSS", q: "Which property is used to change the background color?", options: ["color", "bg-color", "background-color", "backgroundColor"], ans: "background-color" }
];

// --- 4. DASHBOARD --- //

async function loadDashboard() {
  let scores = [];
  try {
    if (!navigator.onLine) throw new Error("Offline");
    const res = await fetch("http://127.0.0.1:5000/api/scores");
    if (res.ok) {
      scores = await res.json();
      localStorage.setItem("quizScores", JSON.stringify(scores));
    } else {
      throw new Error();
    }
  } catch (e) {
    scores = JSON.parse(localStorage.getItem("quizScores")) || [];
  }

  // Update Stats
  const avgEl = document.getElementById("avgScoreDash");
  const attEl = document.getElementById("attemptsDash");
  const weakMsg = document.getElementById("weakMsgDash");
  const weakBox = document.getElementById("weaknessBox");

  if (scores.length === 0) {
    avgEl.textContent = "0%";
    attEl.textContent = "0";
    weakMsg.textContent = "No data yet. Take a quiz!";
  } else {
    const totalScore = scores.reduce((acc, val) => acc + val.score, 0);
    const totalQuestions = scores.reduce((acc, val) => acc + val.total, 0);
    const percentage = Math.round((totalScore / totalQuestions) * 100);

    avgEl.textContent = `${percentage}%`;
    attEl.textContent = scores.length;

    if (percentage < 50) {
      weakMsg.textContent = "Needs Improvement ⚠️";
      weakBox.style.borderLeft = "5px solid var(--danger)";
      weakBox.style.color = "var(--danger)";
    } else if (percentage < 80) {
      weakMsg.textContent = "On Track 👍";
      weakBox.style.borderLeft = "5px solid var(--warning)";
      weakBox.style.color = "var(--warning)";
    } else {
      weakMsg.textContent = "Excellent 🌟";
      weakBox.style.borderLeft = "5px solid var(--success)";
      weakBox.style.color = "var(--success)";
    }

    // History Map
    const histList = document.getElementById("scoreHistoryDash");
    histList.innerHTML = "";
    // show last 5
    scores.slice().reverse().slice(0, 5).forEach((s, i) => {
      const li = document.createElement("li");
      li.innerHTML = `<span><b>${s.subject}</b> Quiz</span> <span>${s.score}/${s.total} (${Math.round((s.score / s.total) * 100)}%)</span>`;
      histList.appendChild(li);
    });
  }

  // Populate Subject Cards
  const subContainer = document.getElementById("dashSubjectCards");
  subContainer.innerHTML = "";
  Object.keys(DATA).forEach(sub => {
    // mock progress
    const randProgress = Math.floor(Math.random() * 60) + 20;
    const div = document.createElement("div");
    div.className = "prog-card";
    div.innerHTML = `
        <div class="prog-top">
           <b>${sub}</b>
           <span style="color:var(--text-muted); font-size:0.85rem">${randProgress}%</span>
        </div>
        <div class="prog-bar-bg">
           <div class="prog-bar-fill" style="width: ${randProgress}%; background: ${DATA[sub].color}"></div>
        </div>
     `;
    subContainer.appendChild(div);
  });
}

// --- 5. PRACTICE QUIZ --- //

let activeQuiz = [];
let idxQuiz = 0;
let userAnswers = [];

function resetPracticeQuizState() {
  document.getElementById("quizSetup").classList.remove("hidden");
  document.getElementById("quizPlayArea").classList.add("hidden");
  document.getElementById("quizResultArea").classList.add("hidden");
}

function startPracticeQuiz() {
  const filter = document.getElementById("quizSubjectFilter").value;
  activeQuiz = filter === "All" ? [...QUIZ_BANK] : QUIZ_BANK.filter(q => q.subject === filter);

  if (activeQuiz.length === 0) {
    alert("No questions available for this subject."); return;
  }

  // shuffle activeQuiz
  activeQuiz.sort(() => Math.random() - 0.5);

  idxQuiz = 0;
  userAnswers = new Array(activeQuiz.length).fill(null);

  document.getElementById("quizSetup").classList.add("hidden");
  document.getElementById("quizPlayArea").classList.remove("hidden");
  document.getElementById("totalQNum").textContent = activeQuiz.length;

  renderQuizQuestion();
}

function renderQuizQuestion() {
  const qObj = activeQuiz[idxQuiz];
  document.getElementById("currentQNum").textContent = idxQuiz + 1;

  const prog = ((idxQuiz) / activeQuiz.length) * 100;
  document.getElementById("quizProgressFill").style.width = `${prog}%`;

  let optionsHTML = "";
  qObj.options.forEach((opt, idx) => {
    const isChecked = userAnswers[idxQuiz] === opt ? "checked" : "";
    optionsHTML += `
       <label class="opt-label">
         <input type="radio" name="practiceQ" value="${opt}" ${isChecked} onchange="userAnswers[idxQuiz]='${opt}'">
         ${opt}
       </label>
     `;
  });

  document.getElementById("quizBox").innerHTML = `
    <div style="padding:24px;">
       <div style="color:var(--primary-color); font-weight:bold; margin-bottom:10px;">Subject: ${qObj.subject}</div>
       <div class="q-text">${qObj.q}</div>
       <div class="q-options">${optionsHTML}</div>
    </div>
  `;

  document.getElementById("btnPrevQ").disabled = (idxQuiz === 0);

  if (idxQuiz === activeQuiz.length - 1) {
    document.getElementById("btnNextQ").classList.add("hidden");
    document.getElementById("btnSubmitQuiz").classList.remove("hidden");
  } else {
    document.getElementById("btnNextQ").classList.remove("hidden");
    document.getElementById("btnSubmitQuiz").classList.add("hidden");
  }
}

function prevQuizQuestion() {
  if (idxQuiz > 0) { idxQuiz--; renderQuizQuestion(); }
}
function nextQuizQuestion() {
  if (idxQuiz < activeQuiz.length - 1) { idxQuiz++; renderQuizQuestion(); }
}

async function submitPracticeQuiz() {
  let score = 0;
  const reviewBox = document.getElementById("quizReviewBox");
  reviewBox.innerHTML = "<h3>Detailed Review</h3>";

  activeQuiz.forEach((q, i) => {
    let uAns = userAnswers[i];
    let isCorrect = uAns === q.ans;
    if (isCorrect) score++;

    reviewBox.innerHTML += `
       <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
          <div><strong>Q: ${q.q}</strong></div>
          <div style="margin-top:5px;">Your Answer: <span style="color:${isCorrect ? 'var(--success)' : 'var(--danger)'}">${uAns || 'Skipped'}</span></div>
          ${!isCorrect ? `<div>Correct Answer: <span style="color:var(--success)">${q.ans}</span></div>` : ''}
       </div>
     `;
  });

  document.getElementById("quizPlayArea").classList.add("hidden");
  document.getElementById("quizResultArea").classList.remove("hidden");
  document.getElementById("finalScoreVal").textContent = `${score}/${activeQuiz.length}`;

  // save score
  let scoreObj = {
    subject: document.getElementById("quizSubjectFilter").value,
    score: score,
    total: activeQuiz.length,
    date: new Date().toISOString()
  };
  try {
    if (navigator.onLine) await fetch("http://127.0.0.1:5000/api/scores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(scoreObj) });
  } catch (e) { }

  let scores = JSON.parse(localStorage.getItem("quizScores")) || [];
  scores.push(scoreObj);
  localStorage.setItem("quizScores", JSON.stringify(scores));
}

// --- 7. EXAM SIMULATOR --- //
let examTimer;
let examTimeLeft = 300; // 5 mins
let examScore = 0;
let examIdx = 0;
let examBank = [];

function resetExamState() {
  document.getElementById("examSetup").classList.remove("hidden");
  document.getElementById("examPlayArea").classList.add("hidden");
  document.getElementById("examResultArea").classList.add("hidden");
  clearInterval(examTimer);
  document.getElementById("examTimerDisplay").textContent = "05:00";
}

function startExamMode() {
  document.getElementById("examSetup").classList.add("hidden");
  document.getElementById("examPlayArea").classList.remove("hidden");

  examBank = [...QUIZ_BANK].sort(() => Math.random() - 0.5).slice(0, 15);
  examScore = 0;
  examIdx = 0;
  examTimeLeft = 300;

  startExamTimer();
  renderExamQuestion();
}

function startExamTimer() {
  examTimer = setInterval(() => {
    examTimeLeft--;
    const m = Math.floor(examTimeLeft / 60).toString().padStart(2, '0');
    const s = (examTimeLeft % 60).toString().padStart(2, '0');
    document.getElementById("examTimerDisplay").textContent = `${m}:${s}`;

    if (examTimeLeft <= 0) {
      clearInterval(examTimer);
      endExam("Time's Up!");
    }
  }, 1000);
}

function renderExamQuestion() {
  const qObj = examBank[examIdx];
  let optionsHTML = "";
  qObj.options.forEach(opt => {
    optionsHTML += `
       <label class="opt-label">
         <input type="radio" name="eQ" value="${opt}">
         ${opt}
       </label>
     `;
  });

  const eBox = document.getElementById("examBox");
  eBox.innerHTML = `
      <div style="padding: 24px;">
         <div style="color:var(--danger); font-weight:bold; margin-bottom:10px;">Question ${examIdx + 1} of ${examBank.length}</div>
         <div class="q-text">${qObj.q}</div>
         <div class="q-options">${optionsHTML}</div>
      </div>
   `;
}

function nextExamQuestion() {
  const selected = document.querySelector('input[name="eQ"]:checked');
  if (!selected) { alert("Please select an answer."); return; }

  if (selected.value === examBank[examIdx].ans) {
    examScore++;
  }

  examIdx++;
  if (examIdx >= examBank.length) {
    endExam("Exam Completed!");
  } else {
    renderExamQuestion();
  }
}

async function endExam(reason) {
  clearInterval(examTimer);
  document.getElementById("examPlayArea").classList.add("hidden");
  document.getElementById("examResultArea").classList.remove("hidden");
  document.getElementById("examFinishReason").textContent = reason;
  document.getElementById("examFinalScore").textContent = `${examScore}/${examBank.length}`;

  let scoreObj = {
    subject: "Exam Simulator",
    score: examScore,
    total: examBank.length,
    date: new Date().toISOString()
  };
  try {
    if (navigator.onLine) await fetch("http://127.0.0.1:5000/api/scores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(scoreObj) });
  } catch (e) { }

  let scores = JSON.parse(localStorage.getItem("quizScores")) || [];
  scores.push(scoreObj);
  localStorage.setItem("quizScores", JSON.stringify(scores));
}

// --- 8. REVISION (FLASHCARDS & FORMULAS) --- //
function switchRevTab(tab, btn) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  if (tab === 'flashcards') {
    document.getElementById("revFlashcards").classList.remove("hidden");
    document.getElementById("revFormulas").classList.add("hidden");
  } else {
    document.getElementById("revFlashcards").classList.add("hidden");
    document.getElementById("revFormulas").classList.remove("hidden");
  }
}

function loadFlashcards() {
  const filter = document.getElementById("flashcardFilter").value;
  const grid = document.getElementById("flashcardGrid");
  grid.innerHTML = "";

  Object.keys(DATA).forEach(sub => {
    if (filter !== "All" && filter !== sub) return;

    const topics = DATA[sub].topics;
    Object.keys(topics).forEach(tName => {
      // Create a flashcard out of notes
      const div = document.createElement("div");
      div.className = "fc-card";
      div.onclick = () => div.classList.toggle("is-flipped");

      const front = document.createElement("div");
      front.className = "fc-front";
      front.innerHTML = `<span style="font-size:0.8rem; color:var(--text-muted); margin-bottom:5px;">${sub}</span> <h3>${tName}</h3><p style="font-size:0.9rem">Click to reveal details</p>`;

      const back = document.createElement("div");
      back.className = "fc-back";
      back.innerHTML = `<p style="font-size:0.9rem; color:white;">${topics[tName].notes}</p>`;

      div.appendChild(front);
      div.appendChild(back);
      grid.appendChild(div);
    });
  });
}

function loadFormulas() {
  const list = document.getElementById("formulasList");
  list.innerHTML = "";
  Object.keys(DATA).forEach(sub => {
    const topics = DATA[sub].topics;
    Object.keys(topics).forEach(tName => {
      list.innerHTML += `
            <div class="formula-card">
               <div>
                  <div style="font-size: 0.85rem; color: var(--text-muted)">${sub} &rarr; ${tName}</div>
                  <div style="font-weight: 600; margin-top:5px;">Code Snippet</div>
               </div>
               <div class="formula-code">${topics[tName].formula}</div>
            </div>
         `;
    });
  });
}


// --- 9. AI CHAT & EXPLANATION (API BINDINGS) --- //

function parseMarkdown(text) {
  if (!text) return "";
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/`(.*?)`/g, '<code style="background:var(--bg-secondary); padding:2px 4px; border-radius:4px;">$1</code>');
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  return `<p>${html}</p>`;
}

async function triggerSendMessage() {
  const input = document.getElementById("chatInputLine");
  const chatArea = document.getElementById("chatArea");
  const val = input.value.trim();
  if (!val) return;

  // Apply user message
  chatArea.innerHTML += `
     <div class="message user-msg">
        <div class="msg-bubble">${val}</div>
     </div>
   `;
  input.value = "";
  chatArea.scrollTop = chatArea.scrollHeight;

  // Attempt API Call
  try {
    if (!navigator.onLine) throw new Error("Offline");

    const response = await fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: val })
    });

    if (!response.ok) throw new Error("Server Error");

    const data = await response.json();

    chatArea.innerHTML += `
        <div class="message ai-msg">
           <div class="msg-bubble">${parseMarkdown(data.reply)}</div>
        </div>
      `;
  } catch (e) {
    console.warn("AI API Error or Offline, falling back to local.", e);
    let localReply = "I am currently disconnected from the main AI brain. But I can tell you basic info: try asking about 'force', 'variables', 'java', or 'pointer'!";
    if (val.toLowerCase().includes("python")) localReply = DATA.Python.topics["Introduction & Syntax"].notes;
    if (val.toLowerCase().includes("c")) localReply = DATA.C.topics["Introduction & Pointers"].notes;
    if (val.toLowerCase().includes("java")) localReply = DATA.Java.topics["OOP Concepts"].notes;

    chatArea.innerHTML += `
        <div class="message ai-msg">
           <div class="msg-bubble">${localReply}</div>
        </div>
      `;
  }
  chatArea.scrollTop = chatArea.scrollHeight;
}

function handleChatEnter(e) {
  if (e.key === "Enter") triggerSendMessage();
}

async function triggerExplanation() {
  const topic = document.getElementById("topicInputBox").value.trim();
  if (!topic) { alert("Please enter a concept"); return; }

  const btn = document.getElementById("btnExplain");
  const resBox = document.getElementById("explanationResults");
  const sBox = document.getElementById("simpleExpText");
  const dBox = document.getElementById("detailedExpText");

  btn.textContent = "Analyzing...";
  btn.disabled = true;
  resBox.classList.remove("hidden");
  sBox.innerHTML = "<p>Connecting to AI...</p>";
  dBox.innerHTML = "<p>Connecting to AI...</p>";

  try {
    if (!navigator.onLine) throw new Error("Offline");

    const response = await fetch("http://127.0.0.1:5000/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: topic })
    });

    if (!response.ok) throw new Error("Server Error");

    const data = await response.json();
    sBox.innerHTML = parseMarkdown(data.simple);
    dBox.innerHTML = parseMarkdown(data.detailed);

  } catch (e) {
    console.warn("Explain Offline", e);
    sBox.innerHTML = `<p>${topic} is an important computer science concept.</p>`;
    dBox.innerHTML = `<p><b>Detailed Outline for ${topic}:</b><br>Currently offline. Please review your subject notes under the Subjects tab or connect to the internet to query the Gemini Model.</p>`;
  }

  btn.textContent = "Generate Explanation";
  btn.disabled = false;
}

// --- INIT --- //
window.onload = () => {
  loadTheme();
  updateStatus();

  if (localStorage.getItem("isLoggedIn") === "true") {
    showPage('dashboard');
  } else {
    showPage('login');
  }
};

// --- 10. FLOATING CHATBOT --- //
function toggleFloatingChat() {
  document.getElementById("floatingChat").classList.toggle("hidden");
}

async function triggerFloatMessage() {
  const input = document.getElementById("floatChatInput");
  const chatArea = document.getElementById("floatChatArea");
  const val = input.value.trim();
  if (!val) return;

  chatArea.innerHTML += `<div class="message user-msg"><div class="msg-bubble">${val}</div></div>`;
  input.value = "";
  chatArea.scrollTop = chatArea.scrollHeight;

  try {
    if (!navigator.onLine) throw new Error("Offline");
    const res = await fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: val + " (Keep answer very short)" })
    });
    if (!res.ok) throw new Error("API Error");
    const data = await res.json();
    chatArea.innerHTML += `<div class="message ai-msg"><div class="msg-bubble">${parseMarkdown(data.reply)}</div></div>`;
  } catch (e) {
    chatArea.innerHTML += `<div class="message ai-msg"><div class="msg-bubble">I'm offline! Quick hint: Use the main 'AI Chat' tab or explore the new Subjects!</div></div>`;
  }
  chatArea.scrollTop = chatArea.scrollHeight;
}

// --- 11. SCHEDULE PLANNER --- //
async function loadSchedule() {
  let tasks = [];
  try {
    if (!navigator.onLine) throw new Error("Offline");
    const res = await fetch("http://127.0.0.1:5000/api/tasks");
    if (res.ok) {
      tasks = await res.json();
      localStorage.setItem("studySchedule", JSON.stringify(tasks));
    } else {
      throw new Error();
    }
  } catch (e) {
    tasks = JSON.parse(localStorage.getItem("studySchedule")) || [];
  }
  const container = document.getElementById("scheduleContainer");

  if (tasks.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top:20px;">No tasks planned yet. Take control of your study!</p>`;
    return;
  }

  // Sort by completion, then date approaching
  tasks.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return new Date(a.date) - new Date(b.date);
  });

  let html = "";
  tasks.forEach((t, index) => {
    let dateObj = new Date(t.date);
    let dateString = isNaN(dateObj) ? "No Due Date" : dateObj.toLocaleDateString();

    html += `
         <div class="task-item ${t.done ? 'done' : ''}">
            <div class="task-details">
               <div class="task-title">${t.desc}</div>
               <div class="task-meta">
                  <span class="task-badge">${t.subject}</span>
                  <span>📅 ${dateString}</span>
               </div>
            </div>
            <div class="task-actions">
               <button class="btn-success" onclick="toggleScheduleTask(${index})">${t.done ? 'Undo' : 'Done'}</button>
               <button class="btn-outline" style="color:var(--danger); border-color:var(--danger);" onclick="deleteScheduleTask(${index})">Delete</button>
            </div>
         </div>
      `;
  });
  container.innerHTML = html;
}

async function addScheduleTask() {
  const desc = document.getElementById("planTaskDesc").value.trim();
  const sub = document.getElementById("planTaskSubject").value;
  const date = document.getElementById("planTaskDate").value;

  if (!desc) { alert("Please enter a task description."); return; }
  let newTask = { desc, subject: sub, date, done: false };

  try {
    if (navigator.onLine) await fetch("http://127.0.0.1:5000/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newTask) });
  } catch (e) { }

  let tasks = JSON.parse(localStorage.getItem("studySchedule")) || [];
  tasks.push(newTask);
  localStorage.setItem("studySchedule", JSON.stringify(tasks));

  document.getElementById("planTaskDesc").value = "";
  document.getElementById("planTaskDate").value = "";

  loadSchedule();
}

async function toggleScheduleTask(idx) {
  let tasks = JSON.parse(localStorage.getItem("studySchedule")) || [];
  let t = tasks[idx];
  t.done = !t.done;

  if (t.id) {
    try {
      if (navigator.onLine) await fetch("http://127.0.0.1:5000/api/tasks/" + t.id, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ done: t.done }) });
    } catch (e) { }
  }

  localStorage.setItem("studySchedule", JSON.stringify(tasks));
  loadSchedule();
}

async function deleteScheduleTask(idx) {
  let tasks = JSON.parse(localStorage.getItem("studySchedule")) || [];
  let t = tasks[idx];

  if (t.id) {
    try {
      if (navigator.onLine) await fetch("http://127.0.0.1:5000/api/tasks/" + t.id, { method: "DELETE" });
    } catch (e) { }
  }

  tasks.splice(idx, 1);
  localStorage.setItem("studySchedule", JSON.stringify(tasks));
  loadSchedule();
}