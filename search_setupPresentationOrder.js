const FileSystem = require("fs");
const Question = require('./src/models/Question');

const questionFileName = 'search_questionOrder.json';
const MAX_NUM_QUESTIONS = 30;

/* https://jsonformatter.org/ */

async function setUpQuestionOrder() {
    const questionOrders = {}
    questionOrders['firstOrder'] = []
    questionOrders['secondOrder'] = []

    const questionIds = await Question.findAll({
        attributes: ['id']
    })

    const allQuestionIds = questionIds.map(question => question.id);

    if (allQuestionIds) {

        const firstOrder = getSortedOrder(allQuestionIds);
        questionOrders['firstOrder'] = firstOrder;

        const secondOrder = getSortedOrder(allQuestionIds);
        questionOrders['secondOrder'] = secondOrder;

    }
    // insert "questionOrders" into search_questionOrder.json
    const content = { "questionOrders": questionOrders };
    FileSystem.writeFile(questionFileName, JSON.stringify(content), { flag: 'wx' }, (error) => {
        if (error) console.log("Question order already exists, preventing data overide");
        else console.log("Question order created and written to search_questionOrder.json")
    });

}

function getSortedOrder(questions) {
    const orders = []

    let order = shuffledCopy(questions).slice(0, MAX_NUM_QUESTIONS);

    while (orders.some(existingOrder => arraysEqual(existingOrder, order))) {
        order = shuffledCopy(limited_questions);
    }

    return order
}

function shuffledCopy(org_arr) {
    const array = [...org_arr];

    let currentIndex = array.length;

    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((value, index) => value === arr2[index]);
}

setUpQuestionOrder() 