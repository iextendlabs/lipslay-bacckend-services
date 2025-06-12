const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: '*'
}));
app.use(express.json()); // Middleware to parse JSON bodies
app.use('/api', routes);
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});