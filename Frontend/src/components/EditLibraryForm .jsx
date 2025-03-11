
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const EditLibraryForm = () => {
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [bookId, setBookId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const record = location.state ? location.state.record : null;

  useEffect(() => {
    axios.get('http://localhost:3001/students').then((response) => setStudents(response.data));
    axios.get('http://localhost:3001/books').then((response) => setBooks(response.data));

    if (record) {
      setStudentId(record.studentId);
      setBookId(record.bookId);
      setStartDate(record.startDate.slice(0, 10)); // Format date for input field
      setEndDate(record.endDate.slice(0, 10)); // Format date for input field
    }
  }, [record]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3001/library/${record.id}`, { studentId, bookId, startDate, endDate });
      navigate('/librarylist');
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    navigate('/librarylist');
  };

  return (
    <>
    <h2>Edit Library</h2>
    <form onSubmit={handleSubmit}>
      <table align="center" cellPadding={10} style={{ backgroundColor: "#f5f5f5", marginTop: 10, borderRadius: 10 }}>
        <tbody>
          <tr>
            <td><label htmlFor="student">Student</label></td>
            <td>
              <select
                id="student"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <td><label htmlFor="book">Book</label></td>
            <td>
              <select
                id="book"
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                required
              >
                <option value="">Select Book</option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.name}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <td><label htmlFor="startDate">Start Date</label></td>
            <td>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </td>
          </tr>
          <tr>
            <td><label htmlFor="endDate">End Date</label></td>
            <td>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </td>
          </tr>
          <tr>
            <td colSpan="2">
              <button type="submit">Save</button>
              <button type="button" onClick={handleCancel} style={{marginLeft: 10}}>Cancel</button>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
    </>
  );
};

export default EditLibraryForm;
