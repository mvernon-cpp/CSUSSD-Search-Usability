const Question = require('../models/Question.js');
const questionOrdersJSON = require('../../search_questionOrder.json')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

/**
 *  Question Service is in charge of returning main study questions stored in questions database   
 */ 
class QuestionService {

    async getAllQuestions(userId) {
        try {

            let questionOrder = (userId % 2 == 1) ? questionOrdersJSON["questionOrders"]["firstOrder"] :
                questionOrdersJSON["questionOrders"]["secondOrder"];

            let questionSet = [];
            
            for (let index = 0; index < questionOrder.length; index++) {
                let q = await Question.findOne({
                    where: {
                        id: questionOrder[index]
                    }
                });

                questionSet.push(q);
            }
            
            const formattedQuestions = questionSet.map(question => {
                return {
                    id: question.id,
                    question_id: question.question_id,
                    chart_endpoint: question.chart_endpoint,
                    filter_options: question.filter_options,
                    question_text: question.question_text,
                    question_options: question.question_options,
                    correct_ans: question.correct_ans,
                    answer_type: question.answer_type
                };
            });
        
            return formattedQuestions;
        } catch (error) {
            console.error("Error fetching questions:", error);
            throw error;
        }
    }
    
}

module.exports = new QuestionService();