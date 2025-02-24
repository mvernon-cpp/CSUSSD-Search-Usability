// node .\setupDatabase.js

const mysql = require("mysql2/promise"); // Use promise-based MySQL library
const sequelize = require('./src/config/db'); // Your sequelize instance
const Question = require('./src/models/Question');
const questions = require('./search_questions.json');
require("dotenv").config();

async function setupDatabase() {
    let con;

    try {
        const localDbId = process.env.LOCAL_DB_ID;
        if (localDbId === null || localDbId === undefined) {
            throw "localDbId not specified in env file";
        }

        con = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log("Connected to MySQL server");

        const dbExistsSQL = `SHOW DATABASES LIKE ?`;

        const [results] = await con.query(dbExistsSQL, [process.env.DB_NAME]);

        if (results.length === 0) {
            // Database doesn't exist, create it
            const createDatabaseSQL =
                `CREATE DATABASE ${process.env.DB_NAME} CHARACTER SET utf8 COLLATE utf8_general_ci`;

            await con.query(createDatabaseSQL);
            console.log("Database created successfully");
        } else {
            console.log("Database already exists");
        }

        // After creating or confirming database existence, sync models and insert data
        await syncDatabase();
        await insertData();

    } catch (error) {
        console.error("Error during database setup:", error);
    } finally {
        if (con) {
            await con.end();
            console.log("MySQL connection closed.");
        }
    }
}

async function syncDatabase() {
    try {
        await sequelize.sync({ alter: true });
        console.log("Database synchronized successfully.");
    } catch (error) {
        console.error("Error synchronizing the database:", error);
    }
}

async function insertData() {
    try {
        // Check if the questions already exist
        const existingQuestions = await Question.findAll({
            where: {
                chart_endpoint: [
                    "graduation-initiative/goal-trajectories",
                    "graduation-initiative/student-advancement",
                    "graduation-initiative/students-who-leave",
                    "graduation-initiative/where-do-they-struggle",
                    "graduation-initiative/post-baccalaureate",
                    "csu-by-the-numbers/enrolling-and-graduating",
                    "csu-by-the-numbers/historical-grad-rates",
                    "csu-by-the-numbers/equity-gaps",
                    "csu-by-the-numbers/student-disabilities",
                    "csu-by-the-numbers/full-unit-loads",
                    "csu-by-the-numbers/time-to-degree",
                    "csu-by-the-numbers/feeder-schools",
                    "departments-dashboard/who-are-my-students",
                    "departments-dashboard/student-progress-units",
                    "departments-dashboard/what-paths-do-they-follow",
                    "departments-dashboard/where-do-they-struggle",
                    "departments-dashboard/upper-classmen-grad-rates",
                    "departments-dashboard/academic-outcomes",
                    "departments-dashboard/students-who-leave",
                    "departments-dashboard/post-baccalaureate",
                    "equity-gaps/my-equity-gaps",
                    "equity-gaps/earning-junior-status",
                    "equity-gaps/upper-classmen-grad-rates",
                    "equity-gaps/intersectionality",
                    "equity-gaps/faculty-diversity"
                ]
            }
        });

        // If no questions exist, insert them
        if (existingQuestions.length === 0) {
            const sequential_questions = questions["sequential_questions"];

            const questionsToInsert = sequential_questions.map(question => ({
                chart_endpoint: question.chart_endpoint,
                filter_options: question.filter_options,
                question_text: question.question_text,
                question_options: question.question_options,
                correct_ans: question.correct_ans,
                answer_type: question.answer_type
            }));

            await Question.bulkCreate(questionsToInsert);
            console.log("Data search_questions.js inserted into Question table successfully.");
        } else {
            console.log("Questions already exist, skipping insert.");
        }
    } catch (error) {
        console.error("Error inserting data:", error);
    }
}


// Call the setupDatabase function
setupDatabase();
