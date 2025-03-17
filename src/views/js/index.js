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

import {
  recordFeedbackResponse,
  feeedbackWithoutSearchQuestions,
  feeedbackWithSearchQuestions,
} from "./feedback.js"

const CSUSSD_URL_SEARCH_ON = "http://localhost:8000?searchFeature=true";
const CSUSSD_URL_SEARCH_OFF = "http://localhost:8000?searchFeature=false";


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
  let currentQuestionId = null;
  let currentQuestionName = null;
  let currentQuestionIndex = 0;
  let currentCorrectAnswer = null;
  let testOrderId = null;
  let data2DArray = []; //stores all queries from test_questions in database locally

  // Mainstudy elements
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

	//Search elements
  const searchEnabledScreen = document.getElementById('search-turned-on');
  const searchDisabledScreen = document.getElementById('search-turned-off');
	const searchEnabledScreenButton = document.getElementById('search-on-button');
	const searchDisabledScreenButton = document.getElementById('search-off-button');
	
  // Post study elements
	const postStudyCongrats = document.getElementById('congrats-cat');
  
  //Feedback elements
  const feedbackAboutSearch = document.getElementById('feedback-about-search');
  const feedbackSubmitButton = document.getElementById('feedback-submit-button');
  const feedbackQuestionElement = document.getElementById('feedback-question');
  const feedbackFrqElement = document.getElementById('feedback-frq');
  const feedbackOptionsElement = document.getElementById('feedback-agree-options');

  //Feedback variables
  let currentFeedbackQuestionIndex = 0;
  let searchOn = 0;
	
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

  // Step 4.5: Hide search enabled screen, user pressed continue button
	searchEnabledScreenButton.addEventListener("click", async () => {
		hideSearchEnabledScreen()
		hideSearchDisabledScreen()

		if( currentQuestionIndex == 0 )	{
			beginMainStudy();
		}
		else {
			showMainStudyScreen();
			displayNextQuestion();	
		}
	});

	// Step 4.5: Hide search disabled screen, user pressed continue button
	searchDisabledScreenButton.addEventListener("click", async () => {
		hideSearchDisabledScreen()
		hideSearchEnabledScreen()

		if (currentQuestionIndex == 0) {
			beginMainStudy();
		}
		else {
			showMainStudyScreen();
			displayNextQuestion();
		}
	});

  // Step 5: Begin Main Study
  beginMainStudyButton.addEventListener("click", async () => {
    beginMainStudy();
  });

  //Step 6: Submit user response and display next question (repeat)
  submitButton.addEventListener("click", async () => {
    handleMainstudyQuestionSubmit();
  });

  //Step 7: Handle mid- and post-feedback submission
  feedbackSubmitButton.addEventListener("click", async () => {
    handleFeedbackSubmit();
  });


  /**
   * HELPER FUNCTIONS
   */
	
	// Refreshes IFrame of CSU-SSD with either search feature turned on or off
	function updateIFrame(newSrc) {
		let iframeElement = document.getElementById('iframe-csussd');

		if (iframeElement === null) {

			$(document).ready(function () {
				let iframe = $('<iframe>', {
					src: newSrc, 
					id: "iframe-csussd",
					title: "CSU-SSD Website",
				});

				$('#csussd-website').append(iframe);
			});

		}
		else {
			iframeElement.src = newSrc;
		}
	}
  
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

  function showSearchEnabledScreen() {
    searchEnabledScreen.style.display = "flex";
		// console.log("search screen on")
	}
	
  function hideSearchEnabledScreen() {
    searchEnabledScreen.style.display = "none";
  }

  function showSearchDisabledScreen() {
    searchDisabledScreen.style.display = "flex";
	  // console.log("search screen off")
	}
	
  function hideSearchDisabledScreen() {
    searchDisabledScreen.style.display = "none";
	}
  
  function hideFeedbackAboutSearch() {
    feedbackAboutSearch.style.display = "none";
  }

  function showFeedbackAboutSearch() {
    feedbackAboutSearch.style.display = "flex";
  }

  function showFeedbackOptions() {
    feedbackOptionsElement.style.display = "block";
  }

  function hideFeedbackOptions() {
    feedbackOptionsElement.style.display = "none";
    feedbackOptionsElement.value = "";
  }

  function clearFeedbackOptions() {
    document.querySelector('input[name="feedback-option"]:checked').checked = false;
  }

  function showFeedbackFrq() {
    feedbackFrqElement.style.display = "flex";
  }
  
  function hideFeedbackFrq() {
    feedbackFrqElement.style.display = "none";
  }
  
  function clearFeedbackFrq() {
    feedbackFrqElement.value = "";
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

      if (testOrderId == 0) {
				console.log("prestudy finished, showing search on. testorderid = 0")
				showSearchEnabledScreen();
      }
			else {
				console.log("prestudy finished, not showing search on. testorderid = 1")
        showBeginMainStudyScreen();
      }  
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
        currentAnswer.value = document.querySelector(
          'input[name="answer"]:checked'
        ).value;
      }
  
      await recordMainStudyResponse(userId, currentQuestionIndex, currentQuestion, currentCorrectAnswer, currentAnswer);
      await recordInteraction(userId, "Submit", true, false, currentQuestionId, currentQuestion, currentAnswer);

      currentQuestionIndex++;
			
			if (currentQuestionIndex == 8 && testOrderId == 0)
			{
        hideMainStudyScreen();

        showFeedbackAboutSearch();
        displayNextFeedbackQuestion();
			}
			else if(currentQuestionIndex == 8 && testOrderId == 1)
			{
        hideMainStudyScreen();

        showFeedbackAboutSearch();
        displayNextFeedbackQuestion();
			}
			else
			{
				displayNextQuestion()
			}
    } else {
      hideMainStudyScreen();

      currentFeedbackQuestionIndex = 0;
      showFeedbackAboutSearch();
      displayNextFeedbackQuestion();
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
   *  Display next feedback question
   */
  function displayNextFeedbackQuestion() {

    if ((currentQuestionIndex <= 8 && testOrderId == 0) || (currentQuestionIndex >= 15 && testOrderId == 1)) {
      // console.log("SEARCH ON: either mid way for testorderID 0 or at end for testOrderID 1");
      searchOn = 1;

      feedbackQuestionElement.innerHTML = currentQuestion.value = feeedbackWithSearchQuestions[currentFeedbackQuestionIndex][0]

      if (feeedbackWithSearchQuestions[currentFeedbackQuestionIndex][1] == 0) {
        showFeedbackOptions();
      }
      else {
        showFeedbackFrq();
      }
    }
    
    if ((currentQuestionIndex <= 8 && testOrderId == 1) || (currentQuestionIndex >= 15 && testOrderId == 0)) {
      // console.log("SEARCH OFF: either mid way for testorderID 1 or at end for testOrderID 0");

      searchOn = 0;

      feedbackQuestionElement.innerHTML = currentQuestion.value = feeedbackWithoutSearchQuestions[currentFeedbackQuestionIndex][0]

      if (feeedbackWithoutSearchQuestions[currentFeedbackQuestionIndex][1] == 0) {
        showFeedbackOptions();
      }
      else {
        showFeedbackFrq();
      }
    }
  }

  /**
   * Display next Question in question array
   */
  function displayNextQuestion() {

		//Set iframe source to homepage for each question - resets view

		$(document).ready(function () {
			if (currentQuestionIndex <= 7) {
				if (testOrderId == 0) {
					updateIFrame(CSUSSD_URL_SEARCH_ON);
				}
				else {
					updateIFrame(CSUSSD_URL_SEARCH_OFF);
				}
			}

			if (currentQuestionIndex > 7) {
				if (testOrderId == 0) {
					updateIFrame(CSUSSD_URL_SEARCH_OFF);
				}
				else {
					updateIFrame(CSUSSD_URL_SEARCH_ON);
				}
			}
		});
   
    const currentQuestionObj = data2DArray[currentQuestionIndex];

    let options = currentQuestionObj["question_options"];
    if(typeof options == "string") {
      options = JSON.parse(currentQuestionObj["question_options"]);
    }
      
    const questionId = currentQuestionObj["question_id"];
    const questionText = currentQuestionObj["question_text"];
    const answerType = currentQuestionObj["answer_type"];
    const questionAnswer = currentQuestionObj["correct_ans"];
    const filterOptions = currentQuestionObj["filter_options"];
      
    // Assign value to the question text
    questionElement.textContent = currentQuestion.value = `Question ${currentQuestionIndex + 1}: ${questionText}`;

    currentQuestionId = questionId;
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
	
	/**
	 *  Handles Logic for submitting feedback
	 *  - Checks for selected Input
	 *  - Updates user data
	 *  - Submits user records
	 */
  async function handleFeedbackSubmit() {
    let inputValue = null;

    if ((searchOn == 1 && feeedbackWithSearchQuestions[currentFeedbackQuestionIndex][1] == 0) || (searchOn == 0 && feeedbackWithoutSearchQuestions[currentFeedbackQuestionIndex][1] == 0)) {
      inputValue = $('input[type="radio"]:checked').val();
      clearFeedbackOptions();

    }
    else {
      inputValue = feedbackFrqElement.value;
      clearFeedbackFrq();
    }

    if (!inputValue) {
      alert("Please enter an answer.");
      currentAnswer.value = null;
      return;
    } else {
      currentAnswer.value = inputValue;
    }

    await recordInteraction(userId, "FeedbackSubmit", true, false, currentFeedbackQuestionIndex, currentQuestion, currentAnswer);
    await recordFeedbackResponse(userId, currentQuestion, currentAnswer, searchOn);

    currentFeedbackQuestionIndex++;
    hideFeedbackFrq();
    hideFeedbackOptions();

    if (currentFeedbackQuestionIndex < 5 && searchOn == 0) { //feedback without search
      displayNextFeedbackQuestion();
    }
    else if (currentFeedbackQuestionIndex < 7 && searchOn == 1) { //feedback with search
      displayNextFeedbackQuestion();
    }
    else if (currentQuestionIndex >= 15) { //Reached end of main study and second feedback questionaire
      console.log("second feedback finished, showing post study congrats");
      hideFeedbackAboutSearch();
      showPostStudyCongrats();
    }
    else {
      hideFeedbackAboutSearch();

      //show respective search on/off screen for HALFWAY checkpoint

      if (searchOn == 0 ) { //if search was off last, it will be turn on. show enabled search screen
        console.log("feedback about search off finished, showing search on")
        showSearchEnabledScreen();
      }
      else { //if search was on last, it will be turn off. show disabled 
        console.log("feedback about search on finished, showing search off.")
        showSearchDisabledScreen();
      }
    }
  }  
});