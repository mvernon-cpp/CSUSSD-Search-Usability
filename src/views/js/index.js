import { 
  getTableData,
  recordMainStudyResponse,
} from "./mainstudy.js"

import { 
  recordInteraction,
  recordPrestudyResponse,
  createNewUser,
  updateUser,
  prestudyQuestions,
} from "./prestudy.js"

const CSUSSD_URL_SEARCH_ON = "http://localhost:8000?searchFeature=true"
const CSUSSD_URL_SEARCH_OFF = "http://localhost:8000?searchFeature=false"

document.addEventListener('DOMContentLoaded', () => {
  // on-launch elements
  const beginStudyButtonWrapper = document.getElementById('begin');
  const beginStudyButton = document.getElementById('begin-study-button');
  const homeContent = document.getElementById('home-content');
  const claimUserIdButton = document.getElementById('claim-user-id');
  const showUserId = document.getElementById('show-user-id');
  const prestudyNotif = document.getElementById('prestudy-notif');

  //prestudy elements
  const prestudyUserQuestions = prestudyQuestions;
  const beginPrestudyButton = document.getElementById("begin-prestudy-button");
  const prestudyContent = document.getElementById("prestudy");
  const prestudyQuestionElement = document.getElementById("prestudy-question");
  const prestudySubmitButton = document.getElementById("prestudy-submit-button");
  const prestudyMsgElement = document.getElementById("prestudy-msg");
  const prestudyChart = document.getElementById("prestudy-chart");
  const inputElement = document.getElementById("inputText");

  // Prestudy Variables
  let currentPrestudyQuestionIndex = 0;
  let currentQuestion = { value: "" };
  let currentAnswer = { value: null };

  // Mainstudy Variables
  let userId = null;
  // let currentGraphId = null;
  let currentQuestionId = null;
  let currentQuestionName = null;
  let currentQuestionIndex = 0;
  let currentCorrectAnswer = null;
  let testOrderId = null;
  let data2DArray = []; //stores all queries from test_questions in database locally

  // Mainstudy elements
  const startCalibrationButton = document.getElementById('start-calibration-button');
  const calibrationScreen = document.getElementById('calibration-screen');
  const beginMainStudyElement = document.getElementById('begin-main-study');
  const beginMainStudyButton = document.getElementById('begin-main-study-button');
  const mainStudy = document.getElementById('main-study');
  const postStudy = document.getElementById('post-study');
  const reloadButton = document.getElementById('reload-button');
  const csussdPlaceholder = document.getElementById("csussd-website");
  const questionElement = document.getElementById('question');
  const frqInput = document.getElementById('frq-answer');
  const optionsElement = document.getElementById('options');
  const submitButton = document.getElementById('submit-button'); 
  let iframeElement = document.getElementById('iframe-csussd');

  // Post study elements
  const postStudyCongrats = document.getElementById('congrats-cat')
  

  /** 
   * EVENT HANDLERS
   */  

  // Step 1: Show home content on "BEGIN" button click
  beginStudyButton.addEventListener('click', () => {
    hideBeginStudyScreen();
    showHomeScreen();
  });

  // Step 2: Show user ID and prestudy info when "CLAIM YOUR USER ID" is clicked
  claimUserIdButton.addEventListener('click', async () => {
    await setupNewUser()
    showUserIdElements()
  });

  // Step 3: Switch to prestudy questions when "BEGIN PRESTUDY" is clicked
  beginPrestudyButton.addEventListener('click', async () => {
    hideHomeScreen();
    
    showPrestudyScreen();
    displayNextPrestudyQuestion();  
   
  });

  // Step 4: Handle prestudy submission and show the next button
  prestudySubmitButton.addEventListener("click", async () => {
    handlePrestudyQuestionSubmit()
  });

  // Step 4.5 (OPTIONAL): Switch to calibration screen when "NEXT" is clicked
  startCalibrationButton.addEventListener('click', () => {
    hideCalibrationScreen();
    triggerCalibration();

    setTimeout(() => {
      showBeginMainStudyScreen();
    }, 3000); // Simulate a 3-second calibration screen
  });

  // Step 5: Begin Main Study
  beginMainStudyButton.addEventListener("click", async () => {
    beginMainStudy();
  });

  // Submit user response and display next question
  submitButton.addEventListener("click", async () => {
    handleMainstudyQuestionSubmit();
  });


  /** 
   * HELPER FUNCTIONS
   */  
  
  function hideBeginStudyScreen() {
    beginStudyButtonWrapper.style.display = 'none';
  }

  function showHomeScreen() {
    homeContent.style.display = 'flex'; 
  }

  function showUserIdElements() {
    claimUserIdButton.style.display = "none";
    showUserId.textContent = `User ID: ${userId}`; 
    // prestudyNotif.style.display = 'block'; 
    beginPrestudyButton.style.display = 'block';
  }

  function hideHomeScreen() {
    homeContent.style.display = 'none';
  }

  function showCalibrationScreen(){
    startCalibrationButton.style.display = "flex";
  }

  function hideCalibrationScreen(){
    startCalibrationButton.style.display = "none";
  }

  function showPrestudyScreen() {
    prestudyContent.style.display = "flex";
    prestudySubmitButton.style.display = "block";
  }

  function hidePrestudyScreen() {
    prestudyContent.style.display = 'none';
  }

  function showBeginMainStudyScreen() {
    beginMainStudyElement.style.display = 'flex';
  }

  function hideBeginMainStudyScreen() {
    beginMainStudyButton.style.display = "none";
    beginMainStudyElement.style.display = 'none';
  }

  function showMainStudyScreen() {
    mainStudy.style.display = "flex";
    submitButton.style.display = "block";
  }

  function hideMainStudyScreen() {
    mainStudy.style.display = "none";
    submitButton.style.display = "none";
    optionsElement.innerHTML = "";
    csussdPlaceholder.innerHTML = "";
  }

  function showFrqInput() {
    frqInput.style.display = "block";
  }

  function hideFrqInput() {
    frqInput.style.display = "none";
  }

  function clearFrqInput() {
    frqInput.value = '';
  }

  function showMultipleChoice(options) {
    // Initialize Options
    optionsElement.innerHTML = "";
    options.forEach((option, index) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "answer";
      input.value = option;
      label.appendChild(input);
      label.appendChild(document.createTextNode(option));
      optionsElement.appendChild(label);
    });

    //input[name="answer"]:checked
  }

  function showSelectAll(options) {
    // Initialize Options
    optionsElement.innerHTML = "";
    options.forEach((option, index) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "answer" + index;
      input.value = option;
      label.appendChild(input);
      label.appendChild(document.createTextNode(option));
      optionsElement.appendChild(label);
    });
  }

  function showPostStudyCongrats() {
    postStudy.style.display = "block";
    postStudyCongrats.style.display = "block";
  }

  function triggerCalibration() {
    startCalibrationButton.style.display = "block";
    prestudyMsgElement.textContent =
      "Prestudy completed! When you click NEXT, you will be shown a blank screen with a tiny plus sign at the center, please focus your eyes on it for 5 seconds. ";
    prestudyQuestionElement.innerHTML = "";
    prestudySubmitButton.style.display = "none";
    currentPrestudyQuestionIndex = 0;
    prestudyChart.innerHTML = "";
    inputElement.style.display = "none";
  }

  /**
   *  Setup new user procedure
   *  - Create new User in User database
   *  - Setup mainstudy variables
   */
  async function setupNewUser() {
    const user = await createNewUser();
    
    userId = user.userId;
    testOrderId = user.testOrderId;
  }

  /**
   *  Handles Logic for submitting prestudy questions
   *  - Checks for selected Input
   *  - Updates user data
   *  - Submits user records
   *  - displays next question or displays mainstudy Screen
   */
  async function handlePrestudyQuestionSubmit() {
    const inputValue = inputElement.value;
    if (!inputValue) {
      alert("Please enter an answer.");
      currentAnswer.value = null;
      return;
    } else {
      currentAnswer.value = inputValue;
    }

    if (currentPrestudyQuestionIndex == 0) {
      await updateUser(userId, {
        age: parseInt(currentAnswer.value),
      });

    }
    else if (currentPrestudyQuestionIndex == 1) {
      await updateUser(userId, {
        major: currentAnswer.value,
      });
    }


    await recordPrestudyResponse(userId, currentQuestion, currentAnswer);
    await recordInteraction(userId, "Submit", false, true, currentQuestionId, currentQuestion, currentAnswer);
    inputElement.value = "";
  
    if (currentPrestudyQuestionIndex < 6) {
      displayNextPrestudyQuestion();
    }
    else {
      hidePrestudyScreen();
      showCalibrationScreen();
      showBeginMainStudyScreen();
    }
  }

  async function beginMainStudy() {
    await recordInteraction(userId, "Begin Main Study", false, false, currentQuestionId, currentQuestion, currentAnswer);
    hideBeginMainStudyScreen();
    
    // Start Study
    await loadStudyQuestions(); 
    showMainStudyScreen();
    displayNextQuestion();
  }

  /**
   *  Handles logic for submitting mainstudy Questions
   */
  async function handleMainstudyQuestionSubmit() {
   
    if ( document.querySelectorAll('input[type="checkbox"]:checked').length === 0 && !document.querySelector('input[name="answer"]:checked')) {
      alert("Please select an answer.");
      currentAnswer.value = null;
      return;
    }

    // currentQuestionIndex += 1;
    let selected = []; //used for answerType select_all
    
    if (currentQuestionIndex < data2DArray.length) {
      const currentQuestionObj = data2DArray[currentQuestionIndex];
      const answerType = currentQuestionObj["answer_type"];
      
      if(answerType === "free-response") {
        currentAnswer.value = frqInput.value;
      }
      else if (answerType === "select_all") {
        const checked = document.querySelectorAll('input[type="checkbox"]:checked')
        selected = Array.from(checked).map(x => x.value)
        currentAnswer.value = selected.join(", "); 
   }
      else { //answerType === "multiple_choice" || "true_false"
        // console.log(answerType)
        currentAnswer.value = document.querySelector(
          'input[name="answer"]:checked'
        ).value;
      }
  
      await recordMainStudyResponse(userId, currentQuestionIndex, currentQuestion, currentCorrectAnswer, currentAnswer);
      await recordInteraction(userId, "Submit", true, false, currentQuestionId, currentQuestion, currentAnswer);

      currentQuestionIndex += 1;
      displayNextQuestion()
    } else {
      hideMainStudyScreen();
      showPostStudyCongrats();
    }

    
  }

  /**
   * Retrieve/store questions and begin Main Study
   * -  Store all fetched data from table_questions into local 2d array data2DArray
   */
  async function loadStudyQuestions() { 
    const tableData = await getTableData(userId);

    for (const entry of tableData) {
      const questionObj = {
        "question_id": entry.question_id,
        "chart_endpoint": entry.chart_endpoint,
        "filter_options": entry.filter_options,
        "question_text": entry.question_text,
        "question_options": entry.question_options,
        "correct_ans": entry.correct_ans,
        "answer_type": entry.answer_type
      };

      data2DArray.push(questionObj); 
    }
  }

  /**
   *  Display next prestudy question
   */
  function displayNextPrestudyQuestion() {
    prestudyQuestionElement.innerHTML = currentQuestion.value = prestudyUserQuestions[currentPrestudyQuestionIndex][0];
    prestudyChart.innerHTML = "";
  
    var imageElement = document.createElement("img");
    if (prestudyUserQuestions[currentPrestudyQuestionIndex][1] != null) {
      imageElement.src =
        "img/prestudy-img/" + prestudyUserQuestions[currentPrestudyQuestionIndex][1];
      imageElement.alt = "prestudy Chart";
      imageElement.style.width = "auto";
      imageElement.style.height = "400px";
      prestudyChart.appendChild(imageElement);
    }

    currentPrestudyQuestionIndex++;
  }

  /**
   * Display next Question in question array
   */
  function displayNextQuestion() {

    console.log(currentQuestionIndex);

    //Set iframe source to homepage for each question - resets view
     if (currentQuestionIndex > 7)
     {iframeElement.src = `${CSUSSD_URL_SEARCH_ON}`;}
     else{
      iframeElement.src = `${CSUSSD_URL_SEARCH_OFF}`;
     }

   
    const currentQuestionObj = data2DArray[currentQuestionIndex];

    let options = currentQuestionObj["question_options"];
    if(typeof options == "string")
      {
      options = JSON.parse(currentQuestionObj["question_options"]);
      }
      
    const questionId = currentQuestionObj["question_id"];
    const questionText = currentQuestionObj["question_text"];
    const answerType = currentQuestionObj["answer_type"];
    const questionAnswer = currentQuestionObj["correct_ans"];
    const chartEndpoint = currentQuestionObj["chart_endpoint"];
    const filterOptions = currentQuestionObj["filter_options"];
      
    // Assign value to the question text
    questionElement.textContent = currentQuestion.value = `Question ${currentQuestionIndex + 1}: ${questionText}`;

    currentQuestionId = questionId;
    // currentQuestionName = questionName;
    currentCorrectAnswer = questionAnswer;

    
    clearFrqInput();

    if(answerType == "free-response") {
      showFrqInput();
    }
    else {
      hideFrqInput();
    }

    switch (answerType) {
      case "free-response":
        showFrqInput();
        break;
      case "true_false":
      case "multiple_choice":
        showMultipleChoice(options);
        break;
      case "select_all":
        showSelectAll(options);
        break;
      default:
        hideFrqInput();
    }
    
  }

  
});
