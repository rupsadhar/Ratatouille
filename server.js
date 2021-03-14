const express = require('express');
const connectDB = require('./config/db');

const app = express();

//connect to DB
connectDB();

//Init Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

//Define Routes
app.use('/api/chefs', require('./routes/api/chefs'));
app.use('/api/chefauth', require('./routes/api/chefauth'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/userauth', require('./routes/api/userauth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/shop', require('./routes/api/shop'));
app.use('/api/posts', require('./routes/api/posts'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
