import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
    const navigate = useNavigate();
    const [dates, setDates] = useState<{date: string, status: string}[]>([]);
    
    useEffect(() => {
        const today = new Date();
        const days = [];
        
        for(let i = -3; i <= 3; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            
            let status = 'locked';
            if (i < 0) status = 'past';
            if (i === 0) status = 'today';
            
            days.push({ date: dateStr, status });
        }
        setDates(days);
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1>Puzzle Dashboard</h1>
            <p>Select today's puzzle to play. Past puzzles are unscored.</p>
            <div style={{ display: 'grid', gap: '10px' }}>
                {dates.map(d => (
                    <div key={d.date} style={{
                        padding: '20px', 
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        backgroundColor: d.status === 'today' ? '#e0fee0' : d.status === 'past' ? '#f9f9f9' : '#f0f0f0',
                        cursor: (d.status === 'today' || d.status === 'past') ? 'pointer' : 'default',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }} onClick={() => {
                        if (d.status === 'today' || d.status === 'past') navigate(`/daily/${d.date}`);
                    }}>
                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{d.date}</span>
                        <span style={{
                            padding: '5px 10px',
                            borderRadius: '20px',
                            backgroundColor: d.status === 'today' ? '#4CAF50' : d.status === 'past' ? '#9E9E9E' : '#BDBDBD',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}>
                            {d.status.toUpperCase()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
