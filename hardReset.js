/*
* THIS SCRIPT EXECUTES A HARD RESET OF THE DATABASE AND QUESTION ORDER
* Use this when setting up on fresh system
*/
require("dotenv").config();

let con;

	 try {
		 
		  con = await mysql.createConnection({
				host: process.env.DB_HOST,
				user: process.env.DB_USER,
				password: process.env.DB_PASSWORD
		  });

		  console.log("Connected to MySQL server");

		//   const dbExistsSQL = `SHOW DATABASES LIKE ?`;

		//   const [results] = await con.query(dbExistsSQL, [process.env.DB_NAME]);

		 //drop process.env.DB_NAME
	

	 } catch (error) {
		  console.error("Error during database setup:", error);
	 }