import ActivityHeatmap from '../components/ActivityHeatmap';
import { useAuthStore } from '../store/authStore';
import { useStreakStore } from '../store/streakStore';
import { useNavigate } from 'react-router-dom';

import { useState, useEffect } from 'react';

export const ProfilePage = () => {
    const { user } = useAuthStore();
    const { currentStreak } = useStreakStore();
    const navigate = useNavigate();
    const [totalScore, setTotalScore] = useState(0);

    useEffect(() => {
        if (!user || user.isGuest) return;
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        fetch(`${API_URL}/sync/daily-scores/${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.scores) {
                    const sum = data.scores.reduce((acc: number, item: any) => acc + item.score, 0);
                    setTotalScore(sum);
                }
            })
            .catch(err => console.error(err));
    }, [user]);

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <button onClick={() => navigate('/')} style={{ marginBottom: 20, padding: '8px 16px' }}>&larr; Back to Puzzles</button>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-brand-900 mb-2">User Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.isGuest ? 'Guest' : user?.email?.split('@')[0] || 'User'}!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
                    <h3 className="text-gray-500 font-medium mb-2">Current Streak</h3>
                    <div className="text-4xl font-bold text-orange-500 flex items-center gap-2">
                        {currentStreak} <span className="text-2xl">🔥</span>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
                    <h3 className="text-gray-500 font-medium mb-2">Total Score</h3>
                    <div className="text-4xl font-bold text-brand-blue-600 flex items-center gap-2">
                        {totalScore} <span className="text-2xl">⭐</span>
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 overflow-hidden">
                <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                    <span className="mr-2">📈</span> Activity History
                </h2>
                <ActivityHeatmap />
            </div>
        </div>
    );
};
