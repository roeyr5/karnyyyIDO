const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'crud',
  password: 'crud',
  database: 'crud' 
});

db.connect((err) => {
  if (err) {
    console.error('error :', err);
  } else {
    console.log('Connected to MySQL');
  }
});

app.get('/api/people', (req, res) => {
  const query = 'SELECT id, name FROM items';
  db.query(query, (err, results) => {
    if (err) {
      console.error('error fetching people :', err);
      return res.status(500).send({ error: 'Database error' });
    }
    res.send(results);
  });
});

app.get('/api/people/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT description FROM items WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('error fetching person :', err);
      return res.status(500).send({ error: 'Database error' });
    }
    if (result.length > 0) {
      res.send(result[0]); // Send the description only
    } else {
      res.status(404).send({ error: 'Person not found' });
    }
  });
});

app.post('/api/adding', (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).send({ error: 'Name and description are required' });
  }

  const query = 'INSERT INTO items (name, description, created, updated, active) VALUES (?, ?, NOW(), NOW(), ?)';
  
  const active = true; 

  db.query(query, [name, description, active], (err, result) => {
    if (err) {
      console.error('error inserting :', err);
      return res.status(500).send({ error: 'Database error' });
    }

    res.send({ id: result.insertId, name, description });
  });
});


app.put('/api/update/:id', (req, res) => {
  const { id } = req.params; // Get the person ID from the URL
  const { description } = req.body; // Only fetch the description from the request body

  console.log(req.params); 
  console.log(req.body);  

  if (!description) {
    return res.status(400).send({ error: 'Description is required' });
  }

  // Update only the description based on the given ID
  const query = 'UPDATE items SET description = ?, updated = NOW() WHERE id = ?';

  db.query(query, [description, id], (err, result) => {
    if (err) {
      console.error('Error updating:', err);
      return res.status(500).send({ error: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({ error: 'Person not found' });
    }

    res.send({ id, description });
  });
});


app.delete('/api/delete/:id', (req, res) => {
  const { id } = req.params; // Get the person ID from the URL

  const query = 'DELETE FROM items WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting:', err);
      return res.status(500).send({ error: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({ error: 'Person not found' });
    }

    res.send({ message: 'Person deleted successfully' });
  });
});



app.listen(3001, () => {
  console.log(' running on port 3001');
});
