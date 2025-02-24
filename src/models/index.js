// models/index.js
const sequelize = require('../config/db');
const Question = require('./Question');
const UserInteraction = require('./UserInteraction');
const PreStudyResponse = require('./PrestudyResponse');
const MainStudyResponse = require('./MainstudyResponse');
// const Graph = require('./Graph');
const User = require('./User') 
// const GraphQuestionMap = require('./GraphQuestionMap');

const initDB = async () => {
    try {
        // Define model relationships
        
        // Authenticate and sync the database
        await sequelize.authenticate();
        console.log('Connection established successfully.');
        await sequelize.sync({ alter: true }); // Sync all models
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = {
    sequelize,
    Question,
    UserInteraction,
    PreStudyResponse,
    MainStudyResponse,
    // Graph,
    User,
    // GraphQuestionMap,
    initDB
};
