const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// READ - semua data
app.get('/api/siswa', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM siswa ORDER BY kode_siswa');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ - satu data
app.get('/api/siswa/:kode', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM siswa WHERE kode_siswa = ?', [req.params.kode]);
    if (rows.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE
app.post('/api/siswa', async (req, res) => {
  const { kode_siswa, nama_siswa, alamat_siswa, tgl_siswa, jurusan_siswa, } = req.body;
  if (!kode_siswa || !nama_siswa) {
    return res.status(400).json({ message: 'Kode dan nama siswa wajib diisi' });
  }
  try {
    await pool.query(
      'INSERT INTO siswa (kode_siswa, nama_siswa, alamat_siswa, tgl_siswa, jurusan_siswa) VALUES (?, ?, ?, ?, ?)',
      [kode_siswa, nama_siswa, alamat_siswa, tgl_siswa, jurusan_siswa]
    );
    res.status(201).json({ message: 'Data berhasil ditambahkan' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Kode siswa sudah ada' });
    }
    res.status(500).json({ message: err.message });
  }
});

// UPDATE
app.put('/api/siswa/:kode', async (req, res) => {
  const { nama_siswa, alamat_siswa, tgl_siswa, jurusan_siswa } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE siswa SET nama_siswa=?, alamat_siswa=?, tgl_siswa=?, jurusan_siswa=? WHERE kode_siswa=?',
      [nama_siswa, alamat_siswa, tgl_siswa, jurusan_siswa, req.params.kode]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });
    res.json({ message: 'Data berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE
app.delete('/api/siswa/:kode', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM siswa WHERE kode_siswa = ?', [req.params.kode]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });
    res.json({ message: 'Data berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

console.log('Database yang dipakai:', process.env.DB_NAME);
app.listen(process.env.PORT, () => {
  console.log(`Server berjalan di http://localhost:${process.env.PORT}`);
});