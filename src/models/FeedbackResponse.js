// models/FeedbackResponse.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FeedbackResponse = sequelize.define('FeedbackResponse', {
	userId: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	question: {
		type: DataTypes.STRING,
		allowNull: false
	},
	userAnswer: {
		type: DataTypes.STRING,
		allowNull: true
	},
	searchOn: {
		type: DataTypes.INTEGER,
		allowNull: true
	}
}, {
	tableName: 'feedback_responses',
	timestamps: true
});

module.exports = FeedbackResponse;
