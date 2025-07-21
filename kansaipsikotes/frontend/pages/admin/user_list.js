import { useEffect, useState } from 'react';
import api from '@/utils/api';
import Link from 'next/link';
// Hapus import Layout from '@/components/Layout';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [entriesPerPage, search]);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users')
      .then(res => setUsers(res.data))
      .catch(err => setError('Gagal memuat data user'))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert('Gagal menghapus user');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered users by search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );
  // Pagination logic
  const totalEntries = filteredUsers.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * entriesPerPage,
    (currentPage - 1) * entriesPerPage + entriesPerPage
  );

  return (
    <div className="min-h-screen">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Daftar User</h1>
          <Link href="/admin/user_create" className="btn-primary">+ Tambah User</Link>
        </div>
      </div>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {/* Search Bar & Show Entries */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 max-w-2xl justify-between mb-4">
              <div className="relative w-full sm:max-w-md">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cari nama atau email..."
                  className="w-full pl-4 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-base bg-white shadow-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Tampilkan</span>
                <select
                  className="border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  value={entriesPerPage}
                  onChange={e => setEntriesPerPage(Number(e.target.value))}
                >
                  {[5, 10, 25, 50, 100].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-700">entri</span>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posisi yang Dilamar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.position_applied || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 space-x-2">
                        <Link href={`/admin/user_detail?id=${user.id}`} className="text-blue-600 hover:underline">Detail</Link>
                        <Link href={`/admin/user_edit?id=${user.id}`} className="text-yellow-600 hover:underline">Edit</Link>
                        <Link href={`/admin/user/${user.id}/snapshots`} className="text-blue-600 hover:underline ml-2">Hasil Snapshot</Link>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:underline"
                          disabled={deletingId === user.id}
                        >
                          {deletingId === user.id ? 'Menghapus...' : 'Hapus'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-400 py-12 text-lg">Tidak ada user.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 px-2">
                <span className="text-sm text-gray-600">
                  Menampilkan {(totalEntries === 0) ? 0 : ((currentPage - 1) * entriesPerPage + 1)} - {Math.min(currentPage * entriesPerPage, totalEntries)} dari {totalEntries} entri
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-l-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 border border-gray-300 ${currentPage === i + 1 ? 'bg-blue-600 text-white font-bold' : 'bg-white text-gray-700 hover:bg-blue-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-r-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 disabled:opacity-50"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 