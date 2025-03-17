export const feeedbackWithoutSearchQuestions = [
  ["Overall, the tasks were difficult.", 0],
  ["I am confident that I found the correct answers.", 0],
  ["I was able to find the answers quickly.", 0],
  ["Do you have any suggestions for improvement of the student success dashboard?", 1],
  ["Any other feedback.", 1],
];

export const feeedbackWithSearchQuestions = [
  ["Overall, the tasks were difficult.", 0],
  ["I am confident that I found the correct answers.", 0],
  ["I was able to find the answers quickly.", 0],
  ["The search system helped me find the correct answers for the tasks.", 0],
  ["The search system helped me find the answers quickly.", 0],
  ["Do you have any suggestions for improvement of the search feature in particular?", 1],
  ["Any other feedback.", 1],
];

export async function recordFeedbackResponse(userId, currentQuestion, currentAnswer, searchOn) {
  try {
    const response = await fetch("/api/submit-feedback-response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        question: currentQuestion.value,
        userAnswer: currentAnswer.value,
        searchOn: searchOn,
      }),
    });

    const dataSubmit = await response.json();
    console.log("Server response:", dataSubmit);

  } catch (error) {
    console.error("Error submitting response:", error);
  }

}