const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Question = sequelize.define('Question', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	question_id: {
		type: DataTypes.TEXT
	},
	chart_endpoint: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	filter_options: {
		type: DataTypes.JSON,
		allowNull: true
	},
	question_text: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	question_options: {
		type: DataTypes.JSON,
		allowNull: true
	},
	correct_ans: {
		type: DataTypes.STRING,
		allowNull: true
	},
	answer_type: {
		type: DataTypes.STRING,
		allowNull: true
	},
}, {
	tableName: 'questions',
	timestamps: true
});

module.exports = Question;
