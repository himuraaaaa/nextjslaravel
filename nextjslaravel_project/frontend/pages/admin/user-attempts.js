import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

export default function UserAttempts() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [tests, setTests] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedTest, setSelectedTest] = useState(null);
    const [userAttempts, setUserAttempts] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchTests();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchTests = async () => {
        try {
            const response = await api.get('/admin/tests');
            setTests(response.data);
        } catch (error) {
            console.error('Error fetching tests:', error);
        }
    };

    const fetchUserAttempts = async () => {
        if (!selectedUser || !selectedTest) return;

        setLoading(true);
        try {
            const response = await api.get('/admin/user-attempts', {
                params: {
                    user_id: selectedUser,
                    test_id: selectedTest
                }
            });
            setUserAttempts(response.data);
        } catch (error) {
            console.error('Error fetching user attempts:', error);
            setMessage('Error fetching user attempts');
        } finally {
            setLoading(false);
        }
    };

    const resetUserAttempts = async (resetType, reason = '') => {
        if (!selectedUser || !selectedTest) return;

        if (!confirm(`Are you sure you want to reset ${resetType} attempts for this user?`)) {
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/admin/reset-user-attempts', {
                user_id: selectedUser,
                test_id: selectedTest,
                reset_type: resetType,
                reason: reason
            });
            setMessage(response.data.message);
            fetchUserAttempts(); // Refresh data
        } catch (error) {
            console.error('Error resetting attempts:', error);
            setMessage('Error resetting attempts');
        } finally {
            setLoading(false);
        }
    };

    const giveExtraAttempts = async (extraAttempts, reason = '') => {
        if (!selectedUser || !selectedTest) return;

        setLoading(true);
        try {
            const response = await api.post('/admin/give-extra-attempts', {
                user_id: selectedUser,
                test_id: selectedTest,
                extra_attempts: extraAttempts,
                reason: reason
            });
            setMessage(response.data.message);
            fetchUserAttempts(); // Refresh data
        } catch (error) {
            console.error('Error giving extra attempts:', error);
            setMessage('Error giving extra attempts');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">User Attempts Management</h1>

            {message && (
                <div className={`p-4 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            {/* Selection Controls */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Select User and Test</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select User
                        </label>
                        <select
                            value={selectedUser || ''}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                        >
                            <option value="" className="text-gray-800">Choose a user...</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id} className="text-gray-800">
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Test
                        </label>
                        <select
                            value={selectedTest || ''}
                            onChange={(e) => setSelectedTest(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                        >
                            <option value="" className="text-gray-800">Choose a test...</option>
                            {tests.map((test) => (
                                <option key={test.id} value={test.id} className="text-gray-800">
                                    {test.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <button
                    onClick={fetchUserAttempts}
                    disabled={!selectedUser || !selectedTest || loading}
                    className="btn-primary mt-4 px-4 py-2 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Loading...' : 'View Attempts'}
                </button>
            </div>

            {/* User Attempts Display */}
            {userAttempts && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">User Attempts</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-blue-900">User</h3>
                            <p className="text-blue-600">{userAttempts.user.name}</p>
                            <p className="text-blue-600">{userAttempts.user.email}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-green-900">Test</h3>
                            <p className="text-green-600">{userAttempts.test.title}</p>
                            <p className="text-green-600">Allowed: {userAttempts.test.allowed_attempts === 0 ? 'Unlimited' : userAttempts.test.allowed_attempts}</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-yellow-900">Status</h3>
                            <p className="text-yellow-600">Completed: {userAttempts.completed_attempts}</p>
                            <p className="text-yellow-600">Remaining: {userAttempts.remaining_attempts === null ? 'Unlimited' : userAttempts.remaining_attempts}</p>
                            <p className="text-yellow-600">Can take: {userAttempts.can_take_test ? 'Yes' : 'No'}</p>
                        </div>
                    </div>

                    {/* Attempts List */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Attempt History</h3>
                        {userAttempts.attempts.length === 0 ? (
                            <p className="text-gray-500">No attempts found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-400">
                                    <thead>
                                        <tr className="bg-gray-800 text-white">
                                            <th className="px-4 py-2 border border-gray-400">Attempt #</th>
                                            <th className="px-4 py-2 border border-gray-400">Status</th>
                                            <th className="px-4 py-2 border border-gray-400">Score</th>
                                            <th className="px-4 py-2 border border-gray-400">Started</th>
                                            <th className="px-4 py-2 border border-gray-400">Completed</th>
                                            <th className="px-4 py-2 border border-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userAttempts.attempts.map((attempt, idx) => (
                                            <tr key={attempt.id} className={idx % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                                                <td className="px-4 py-2 border border-gray-300 text-gray-900">{idx + 1}</td>
                                                <td className="px-4 py-2 border border-gray-300 text-gray-900">{attempt.status}</td>
                                                <td className="px-4 py-2 border border-gray-300 text-gray-900">{attempt.score ?? '-'}</td>
                                                <td className="px-4 py-2 border border-gray-300 text-gray-900">{attempt.started_at ? new Date(attempt.started_at).toLocaleString() : '-'}</td>
                                                <td className="px-4 py-2 border border-gray-300 text-gray-900">{attempt.completed_at ? new Date(attempt.completed_at).toLocaleString() : '-'}</td>
                                                <td className="px-4 py-2 border border-gray-300 text-gray-900">
                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            onClick={() => resetUserAttempts('all')}
                                                            disabled={loading || userAttempts.attempts.length === 0}
                                                            className="btn-accent px-3 py-1 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                                                        >
                                                            Reset All
                                                        </button>
                                                        <button
                                                            onClick={() => resetUserAttempts('completed')}
                                                            disabled={loading || userAttempts.attempts.filter(a => a.status === 'completed').length === 0}
                                                            className="btn-accent px-3 py-1 text-white rounded text-sm hover:bg-orange-700 disabled:opacity-50"
                                                        >
                                                            Reset Completed
                                                        </button>
                                                        <button
                                                            onClick={() => resetUserAttempts('ongoing')}
                                                            disabled={loading || userAttempts.attempts.filter(a => a.status === 'started').length === 0}
                                                            className="btn-accent px-3 py-1 text-white rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
                                                        >
                                                            Reset Ongoing
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-gray-800">Give Extra Attempts</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => giveExtraAttempts(1)}
                                    disabled={loading}
                                    className="btn-primary px-3 py-1 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                >
                                    +1 Attempt
                                </button>
                                <button
                                    onClick={() => giveExtraAttempts(2)}
                                    disabled={loading}
                                    className="btn-primary px-3 py-1 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                >
                                    +2 Attempts
                                </button>
                                <button
                                    onClick={() => giveExtraAttempts(3)}
                                    disabled={loading}
                                    className="btn-primary px-3 py-1 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                >
                                    +3 Attempts
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 