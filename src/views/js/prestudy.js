export const prestudyQuestions = [
    ["What is your age?", null],
    ["What is your major?", null],
    ["How often do you use the CSU Student Success Dashboard?" +
    " <br><br> Please enter an answer from the following: Never, Occasionally, Frequently.", null],
    [
      "The graph above shows the percentage of people who die from different types of cancer." +
        "<br><br>About what percentage of people who die from cancer die from cancer B, cancer C, and cancer D combined?",
      "pie-chart.png",
    ],
    [
      "You see two magazines advertisements on separate pages. Each advertisement is for a different " +
        "drug for treating heart disease. Each advertisement has a graph for showing the effectiveness of the drug " +
        "compared to a placebo (sugar pill).<br><br>Compared to the placebo, which treatment leads to a larger decrease " +
        "in the percentage of patients who die? <br><br> Please enter an answer from the following: Crosicol, Hertinol, They are equal, Can not say",
      "bar-graph.png",
    ],
  
    [
      "The graph above shows the number of men and women with disease X. The total number of circles is 100.<br><br>" +
        "How many more men than women are there among 100 patients with disease X?",
      "dots.png",
    ],
  
    [
      "You see two newspaper advertisements on separate pages. Each advertisement is for a different treatment of a skin " +
        "disease. Each advertisement has a graph showing the effectiveness of the treatment over time.<br><br>" +
        "Which of the treatments show a larger decrease in the percentage of sick patients?" +
        "<br><br>Please enter an answer from the following: Apsoriatin, Nopsorian, They are equal, Can not say",
      "line-graph.png",
    ],
  ];

export async function recordPrestudyResponse(userId, currentQuestion, currentAnswer) {
    try {
      const response = await fetch("/api/submit-prestudy-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          userAnswer: currentAnswer.value,
          question: currentQuestion.value.substring(0, 80),
        }),
      });
  
      const dataSubmit = await response.json();
      console.log("Server response:", dataSubmit);
  
    } catch (error) {
      console.error("Error submitting response:", error);
    }

  }
  
export async function recordInteraction(userId, buttonName, isMainStudy, isPrestudy, currentQuestionId, currentQuestion, currentAnswer) {
  let localQuestionId = null;
  let localQuestion = null;
  let localUserAnswer = null;

  if (!isMainStudy && !isPrestudy) {
    localQuestionId = null;
    localQuestion = null;
    localUserAnswer = null;
  } else if (isPrestudy && !isMainStudy) {
    localQuestionId = null;
    localQuestion = currentQuestion.value.substring(0, 80);
    localUserAnswer = currentAnswer.value;
  } else if (isMainStudy && !isPrestudy) {
    localQuestionId = currentQuestionId;
    localQuestion = currentQuestion.value.substring(0, 80);
    localUserAnswer = currentAnswer.value;
  }
  
  try {
    const responseSubmit = await fetch("/api/submit-user-interaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        buttonName: buttonName,
        questionId: localQuestionId,
        question: localQuestion,
        userAnswer: localUserAnswer,
      }),
    });

    const dataSubmit = await responseSubmit.json();

    console.log("Server response:", dataSubmit);
  } catch (error) {
    console.error("Error submitting response:", error);
  }
}

export async function createNewUser() {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}) 
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
  }
}


export async function updateUser(userId, userData) {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData) 
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
  }
}
