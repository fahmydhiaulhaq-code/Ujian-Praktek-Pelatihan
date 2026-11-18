import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API = 'http://localhost:5000/api/siswa';
const kosong = { kode_siswa: '', nama_siswa: '', alamat_siswa: '', tgl_siswa: '', jurusan_siswa: '' };

const formatTanggal = (t) => {
  if (!t) return '-';
  const [y, m, d] = t.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

function App() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState(kosong);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [sukses, setSukses] = useState('');
  const [cari, setCari] = useState('');

  const ambilData = async () => {
    try {
      const res = await axios.get(API);
      setData(res.data);
    } catch {
      setError('Gagal mengambil data dari server');
    }
  };

  useEffect(() => { ambilData(); }, []);

  const tampilSukses = (pesan) => {
    setSukses(pesan);
    setTimeout(() => setSukses(''), 2500);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editMode) {
        await axios.put(`${API}/${form.kode_siswa}`, form);
        tampilSukses('Data berhasil diupdate');
      } else {
        await axios.post(API, form);
        tampilSukses('Data berhasil ditambahkan');
      }
      setForm(kosong);
      setEditMode(false);
      ambilData();
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleEdit = (s) => {
    setForm({ ...s, tgl_siswa: s.tgl_siswa ? s.tgl_siswa.slice(0, 10) : '' });
    setEditMode(true);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Hapus data ${s.nama_siswa} (${s.kode_siswa})?`)) return;
    try {
      await axios.delete(`${API}/${s.kode_siswa}`);
      tampilSukses('Data berhasil dihapus');
      ambilData();
    } catch {
      setError('Gagal menghapus data');
    }
  };

  const batal = () => { setForm(kosong); setEditMode(false); setError(''); };

  const dataTampil = data.filter((s) =>
    `${s.kode_siswa} ${s.nama_siswa} ${s.alamat_siswa} ${s.jurusan_siswa}`
      .toLowerCase()
      .includes(cari.toLowerCase())
  );

  return (
    <div className="page">
      <div className="header">
        <h1>Data Siswa</h1>
        <p>Aplikasi CRUD dengan React.js, Express.js, dan MySQL</p>
      </div>

      <div className="card">
        <h2 className="card-title">{editMode ? 'Edit Data Siswa' : 'Tambah Data Siswa'}</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {sukses && <div className="alert alert-success">{sukses}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="field">
            <label>Kode Siswa</label>
            <input name="kode_siswa" placeholder="Contoh: S001" value={form.kode_siswa}
              onChange={handleChange} disabled={editMode} required />
          </div>
          <div className="field">
            <label>Nama Siswa</label>
            <input name="nama_siswa" placeholder="Nama lengkap" value={form.nama_siswa}
              onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Alamat Siswa</label>
            <input name="alamat_siswa" placeholder="Alamat" value={form.alamat_siswa}
              onChange={handleChange} />
          </div>
          <div className="field">
            <label>Tanggal lahir Siswa</label>
            <input type="date" name="tgl_siswa" value={form.tgl_siswa} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Jurusan Siswa</label>
            <input name="jurusan_siswa" placeholder="Contoh: Teknik Informatika"
              value={form.jurusan_siswa} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editMode ? 'Simpan Perubahan' : 'Tambah Data'}
            </button>
            {editMode && (
              <button type="button" className="btn btn-secondary" onClick={batal}>Batal</button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="table-head">
          <h2 className="card-title">
            Daftar Siswa <span className="badge-count">{dataTampil.length}</span>
          </h2>
          <input className="search" placeholder="Cari kode, nama, alamat, jurusan..."
            value={cari} onChange={(e) => setCari(e.target.value)} />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kode</th><th>Nama Lengkap</th><th>Alamat</th><th>Tanggal</th><th>Jurusan</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataTampil.length === 0 ? (
                <tr><td colSpan="6" className="empty">Belum ada data</td></tr>
              ) : dataTampil.map((s) => (
                <tr key={s.kode_siswa}>
                  <td className="col-kode">{s.kode_siswa}</td>
                  <td>{s.nama_siswa}</td>
                  <td>{s.alamat_siswa || '-'}</td>
                  <td>{formatTanggal(s.tgl_siswa)}</td>
                  <td>{s.jurusan_siswa ? <span className="tag">{s.jurusan_siswa}</span> : '-'}</td>
                  <td>
                    <div className="col-aksi">
                      <button className="btn btn-sm btn-edit" onClick={() => handleEdit(s)}>Edit</button>
                      <button className="btn btn-sm btn-delete" onClick={() => handleDelete(s)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;