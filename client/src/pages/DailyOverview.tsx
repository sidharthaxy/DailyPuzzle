import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const DailyOverview = () => {
    const { date } = useParams<{ date: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [scores, setScores] = useState<{ puzzleType: string; score: number }[]>([]);

    useEffect(() => {
        if (!date || !user || user.isGuest) return;

        fetch(`${API_URL}/sync/daily-scores/${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.scores) {
                    const todaysScores = data.scores.filter((s: any) => s.date === date);
                    setScores(todaysScores);
                }
            })
            .catch(err => console.error(err));
    }, [date, user]);

    const isMazeDone = scores.some(s => s.puzzleType === 'path');
    const isSudokuDone = scores.some(s => s.puzzleType === 'sudoku');

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <button onClick={() => navigate('/')} style={{ marginBottom: 20, padding: '8px 16px' }}>&larr; Back to Dashboard</button>
            <h1 style={{ textAlign: 'center', marginBottom: 30 }}>Puzzles for {date}</h1>

            <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{
                    padding: '24px', borderRadius: '12px', border: '1px solid #e0e0e0',
                    backgroundColor: isMazeDone ? '#dcfce7' : '#f9fafb',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '24px' }}>Maze Puzzle</h2>
                        <p style={{ margin: '5px 0 0 0', color: '#6b7280' }}>
                            {isMazeDone ? '✅ Completed' : 'Find the path!'}
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate(`/puzzle?type=path&date=${date}`)}
                        style={{ padding: '10px 20px', borderRadius: '8px', background: isMazeDone ? '#059669' : '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {isMazeDone ? 'Played' : 'Play'}
                    </button>
                </div>

                <div style={{
                    padding: '24px', borderRadius: '12px', border: '1px solid #e0e0e0',
                    backgroundColor: isSudokuDone ? '#dcfce7' : '#f9fafb',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '24px' }}>Sudoku Puzzle</h2>
                        <p style={{ margin: '5px 0 0 0', color: '#6b7280' }}>
                            {isSudokuDone ? '✅ Completed' : 'A true logic test!'}
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate(`/puzzle?type=sudoku&date=${date}`)}
                        style={{ padding: '10px 20px', borderRadius: '8px', background: isSudokuDone ? '#059669' : '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {isSudokuDone ? 'Played' : 'Play'}
                    </button>
                </div>
            </div>
        </div>
    );
};
