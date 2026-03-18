import { useEffect } from 'react';
import { usePuzzleStore } from '../store/puzzleStore';
import { useNavigate } from 'react-router-dom';

export const PuzzlePage = () => {
    const navigate = useNavigate();
    const { 
        initDailyPuzzle, 
        puzzleType, 
        puzzleData, 
        userState, 
        makeMove, 
        timer, 
        hintsUsed,
        useHint,
        isRunning, 
        isComplete, 
        score, 
        tickTimer
    } = usePuzzleStore();

    useEffect(() => {
        initDailyPuzzle();
    }, []);

    useEffect(() => {
        let interval: any;
        if (isRunning && !isComplete) {
            interval = setInterval(() => {
                tickTimer();
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, isComplete, tickTimer]);

    if (!puzzleType) return <div style={{ padding: 20 }}>Loading Daily Puzzle...</div>;

    const renderPathGrid = () => {
        const grid = puzzleData.grid;
        return (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${grid[0].length}, 50px)`, gap: '4px', justifyContent: 'center' }}>
                {grid.map((row: any, r: number) => 
                    row.map((cell: string, c: number) => {
                        const isPath = userState && userState.some((p: any) => p.r === r && p.c === c);
                        const isStart = cell === 'S';
                        const isEnd = cell === 'E';
                        const isWall = cell === '#';
                        
                        return (
                            <div key={`${r}-${c}`}
                                onClick={() => {
                                    if(cell !== '#' && !isComplete) {
                                        // Simple additive move for testing
                                        makeMove([...userState, {r, c}]);
                                    }
                                }}
                                style={{
                                    width: 50, height: 50, 
                                    borderRadius: 8,
                                    backgroundColor: isWall ? '#374151' : isPath ? '#3b82f6' : '#f3f4f6',
                                    color: (isPath || isWall) ? 'white' : 'black',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: 20,
                                    cursor: isWall || isComplete ? 'not-allowed' : 'pointer',
                                    border: isStart || isEnd ? '2px solid #ef4444' : 'none'
                                }}>
                                {isStart ? 'S' : isEnd ? 'E' : ''}
                            </div>
                        )
                    })
                )}
            </div>
        );
    }

    const renderSudokuGrid = () => {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 60px)', gap: '4px', justifyContent: 'center' }}>
                {userState && userState.map((row: any, r: number) => 
                    row.map((cell: number | null, c: number) => {
                        const isGiven = puzzleData.grid[r][c] !== null;
                        return (
                            <input 
                                key={`${r}-${c}`}
                                type="number" 
                                min="1" max="4"
                                value={cell || ''}
                                readOnly={isGiven || isComplete}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if((val >= 1 && val <= 4) || e.target.value === '') {
                                        const newState = JSON.parse(JSON.stringify(userState));
                                        newState[r][c] = e.target.value === '' ? null : val;
                                        makeMove(newState);
                                    }
                                }}
                                style={{
                                    width: 60, height: 60, textAlign: 'center', fontSize: 24, fontWeight: 'bold',
                                    backgroundColor: isGiven ? '#e5e7eb' : 'white',
                                    border: '2px solid #d1d5db', borderRadius: 8,
                                    color: isGiven ? '#4b5563' : '#111827',
                                    cursor: isGiven || isComplete ? 'not-allowed' : 'text'
                                }}
                            />
                        )
                    })
                )}
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <button onClick={() => navigate('/')} style={{ marginBottom: 20, padding: '8px 16px' }}>&larr; Back to Puzzles</button>
            
            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Today's Puzzle</h1>
            <h2 style={{ color: '#6b7280', marginBottom: '30px', textTransform: 'capitalize' }}>{puzzleType} Challenge</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 30, padding: 15, background: '#f9fafb', borderRadius: 12 }}>
                <div>⏱️ <strong>{timer}s</strong></div>
                <div>💡 <strong>{hintsUsed}/2</strong> Used</div>
            </div>

            {isComplete && (
                <div style={{ background: '#dcfce7', color: '#166534', padding: 20, marginBottom: 30, borderRadius: 12 }}>
                    <h3 style={{ margin: 0, marginBottom: 10 }}>🎉 Puzzle Solved!</h3>
                    <p style={{ margin: 0, fontSize: 18 }}>Your Score: <strong>{score}</strong></p>
                </div>
            )}

            <div style={{ marginBottom: 40 }}>
                {puzzleType === 'path' ? renderPathGrid() : renderSudokuGrid()}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button 
                    disabled={isComplete || hintsUsed >= 2} 
                    onClick={useHint}
                    style={{ padding: '10px 20px', borderRadius: 8, background: '#f59e0b', color: 'white', border: 'none', cursor: (isComplete || hintsUsed >= 2) ? 'not-allowed' : 'pointer' }}
                >
                    Use Hint (-10 pts)
                </button>
                
                {puzzleType === 'path' && (
                    <button 
                        disabled={isComplete}
                        onClick={() => makeMove([])}
                        style={{ padding: '10px 20px', borderRadius: 8, background: '#dc2626', color: 'white', border: 'none', cursor: isComplete ? 'not-allowed' : 'pointer' }}
                    >
                        Reset Path
                    </button>
                )}
            </div>
        </div>
    );
}
