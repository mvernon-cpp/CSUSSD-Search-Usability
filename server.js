const app = require('./src/app');

const PORT = process.env.PORT || 3000;

const { initDB } = require('./src/models');

(async () => {
    await initDB(); // Initialize the database
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
})();