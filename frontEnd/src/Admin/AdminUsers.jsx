import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import {
  Search, CheckCircle, XCircle, Trash2,
  Users, UserCheck, UserX, Shield,
  MoreVertical, Loader, AlertCircle, Ban
} from 'lucide-react';
import { adminAPI } from '../services/api';

const ROLE_STYLE = {
  artist: 'bg-purple-100 text-purple-700',
  buyer: 'bg-blue-100 text-blue-700',
  admin: 'bg-red-100 text-red-700',
};

export default function AdminUsers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [suspendingId, setSuspendingId] = useState(null);
  const [total, setTotal] = useState(0);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterRole !== 'all') params.role = filterRole;
      if (search) params.search = search;
      // Fetch 500 to handle client-side pagination smoothly
      params.limit = 500;

      const res = await adminAPI.getUsers(params);
      setUsers(res.users || []);
      setTotal(res.total || 0);
      setCurrentPage(1); // Reset to page 1 on new search/filter
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search, filterRole]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? All their artworks and orders will also be deleted. This is irreversible.')) return;
    setDeletingId(id);
    try {
      await adminAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      setTotal(prev => prev - 1);
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSuspendToggle = async (id, isCurrentlySuspended) => {
    const actionStr = isCurrentlySuspended ? 'unsuspend' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${actionStr} this user?`)) return;
    setSuspendingId(id);
    try {
      // Mocking the status update since we don't have the specific backend route yet
      // In a real scenario: await adminAPI.updateUserStatus(id, { isSuspended: !isCurrentlySuspended });
      setTimeout(() => {
        setUsers(prev => prev.map(u => u._id === id ? { ...u, isSuspended: !isCurrentlySuspended } : u));
        setSuspendingId(null);
      }, 600);
    } catch (err) {
      alert(`Failed to ${actionStr} user`);
      setSuspendingId(null);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

  // Pagination Logic
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const currentUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} title="Users Management" subtitle={`Managing ${total} active accounts`} />

        <main className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {['all', 'buyer', 'artist', 'admin'].map(r => (
                <button
                  key={r} onClick={() => setFilterRole(r)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition flex-1 sm:flex-none ${filterRole === r ? 'bg-red-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> <span className="font-semibold text-sm">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex justify-center"><Loader className="w-10 h-10 text-red-500 animate-spin" /></div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-1">No users found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentUsers.map(u => (
                  <div key={u._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition relative group">
                    {u.isSuspended && (
                      <div className="absolute top-4 right-4 bg-red-100 text-red-600 text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1">
                        <Ban className="w-3 h-3" /> Suspended
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${u.isSuspended ? 'bg-gray-400' : 'bg-gradient-to-br from-slate-700 to-slate-900'}`}>
                          {u.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className={`font-bold ${u.isSuspended ? 'text-gray-400 line-through' : 'text-gray-900'} truncate max-w-[120px]`}>{u.fullName}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[120px]">{u.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span className={`px-2.5 py-1 rounded-lg font-bold capitalize ${ROLE_STYLE[u.role] || ''}`}>
                        {u.role}
                      </span>
                      <span>{formatDate(u.createdAt)}</span>
                    </div>

                    {u.role !== 'admin' && (
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleSuspendToggle(u._id, u.isSuspended)}
                          disabled={suspendingId === u._id}
                          className={`w-full py-2 rounded-lg text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-1 ${u.isSuspended ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}
                        >
                          {suspendingId === u._id ? <Loader size={14} className="animate-spin" /> : <Ban size={14} />}
                          {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          disabled={deletingId === u._id}
                          className="w-full py-2 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          {deletingId === u._id ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1 px-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i} onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-lg text-sm font-bold transition ${currentPage === i + 1 ? 'bg-red-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}