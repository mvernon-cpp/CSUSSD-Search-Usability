//Start the main study
export async function getTableData(userId) {
    try {
      const response = await fetch(`/api/test-questions/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const tableData = await response.json();
      
      return tableData;
      
    } catch (error) {
      console.error("Error starting the study:", error);
    }
}

export async function recordMainStudyResponse(userId, currentQuestionIndex, currentQuestion, currentCorrectAnswer, currentAnswer) {
  try {
    let isCorrect = (currentCorrectAnswer !== null) ? currentAnswer.value === currentCorrectAnswer : null;

      const responseSubmit = await fetch("/api/submit-mainstudy-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          questionOrderIndex: currentQuestionIndex,
          question: currentQuestion.value.substring(0, 100),
          userAnswer: currentAnswer.value,
          usedSearch: false,
          isCorrect: isCorrect,
        }),
      });
  
      const dataSubmit = await responseSubmit.json();
      console.log("Server response:", dataSubmit);
  
    } catch (error) {
      console.error("Error submitting response:", error);
    }
}
  
