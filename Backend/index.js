const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const mysql = require('mysql2/promise');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Database configuration
const sequelize = new Sequelize('library_db', 'root', '2255', {
  host: 'localhost',
  dialect: 'mysql'
});

// Models
const Student = sequelize.define('student', {
  name: Sequelize.STRING,
  class: Sequelize.STRING,
  photo: Sequelize.STRING, // Store file path
  video: Sequelize.STRING // Store file path
});

const Book = sequelize.define('book', {
  name: Sequelize.STRING,
  author: Sequelize.STRING,
  publication: Sequelize.STRING,
  year: Sequelize.INTEGER

});

// Join Table for Students and Books
const StudentBook = sequelize.define('student_book', {
  studentId: {
    type: Sequelize.INTEGER,
    references: {
      model: Student,
      key: 'id'
    }
  },
  bookId: {
    type: Sequelize.INTEGER,
    references: {
      model: Book,
      key: 'id'
    }
  }
});

// Table for Tracking Borrowing Details
const Library = sequelize.define('library', {
  startDate: Sequelize.DATE,
  endDate: Sequelize.DATE,
  studentId: {
    type: Sequelize.INTEGER,
    references: {
      model: Student,
      key: 'id'
    }
  },
  bookId: {
    type: Sequelize.INTEGER,
    references: {
      model: Book,
      key: 'id'
    }
  }
});

// Relationships
Student.belongsToMany(Book, { through: StudentBook });
Book.belongsToMany(Student, { through: StudentBook });

Student.hasMany(Library);
Library.belongsTo(Student);
Book.hasMany(Library);
Library.belongsTo(Book);

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// File upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// API Routes
app.post('/students', upload.fields([{ name: 'photo' }, { name: 'video' }]), async (req, res) => {
  try {
    const student = await Student.create({
      name: req.body.name,
      class: req.body.class,
      photo: req.files.photo[0].path,
      video: req.files.video[0].path
    });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/students', async (req, res) => {
  try {
    const students = await Student.findAll();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/students/:id', upload.fields([{ name: 'photo' }, { name: 'video' }]), async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await student.update({
      name: req.body.name || student.name,
      class: req.body.class || student.class,
      photo: req.files.photo ? req.files.photo[0].path : student.photo,
      video: req.files.video ? req.files.video[0].path : student.video
    });

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    await student.destroy();
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Books routes
app.post('/books', async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/books', async (req, res) => {
  try {
    const books = await Book.findAll();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    await book.update(req.body);
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    await book.destroy();
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Library routes
app.post('/library', async (req, res) => {
  try {
    const library = await Library.create(req.body);
    res.json(library);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/library', async (req, res) => {
  try {
    const library = await Library.findAll({
      include: [
        { model: Student, attributes: ['name'] },
        { model: Book, attributes: ['name'] }
      ]
    });
    res.json(library);
  } catch (error) {
    console.error('Failed to fetch library records:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching library records' });
  }
});

app.put('/library/:id', async (req, res) => {
  try {
    const library = await Library.findByPk(req.params.id);
    if (!library) {
      return res.status(404).json({ error: 'Details not found' });
    }
    await library.update(req.body);
    res.json(library);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/library/:id', async (req, res) => {
  try {
    const library = await Library.findByPk(req.params.id);
    if (!library) {
      return res.status(404).json({ error: 'Details not found' });
    }
    await library.destroy();
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync database and start server
sequelize.sync({ force: false }).then(() => {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
