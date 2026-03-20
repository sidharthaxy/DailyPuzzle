import { useEffect } from 'react';
import { usePuzzleStore } from '../store/puzzleStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PuzzleType } from '../puzzles/generator';
import { useModalStore } from '../store/modalStore';
import { useStreakStore } from '../store/streakStore';

export const PuzzlePage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
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
        const typeParam = searchParams.get('type') as PuzzleType || 'sudoku';
        const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
        initDailyPuzzle(dateParam, typeParam);
    }, [searchParams, initDailyPuzzle]);

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
                                    if (cell !== '#' && !isComplete) {
                                        const lastPos = userState[userState.length - 1];
                                        const dist = Math.abs(lastPos.r - r) + Math.abs(lastPos.c - c);
                                        if (dist === 1) {
                                            // Ensure not revisiting an existing cell in the path to prevent loops
                                            const alreadyInPath = userState.some((p: any) => p.r === r && p.c === c);
                                            if (!alreadyInPath) {
                                                makeMove([...userState, { r, c }]);
                                            }
                                        } else if (dist === 0 && userState.length > 1) {
                                            // Backtrack: remove the last cell if clicked again
                                            makeMove(userState.slice(0, -1));
                                        }
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 45px)', gap: '2px', justifyContent: 'center', backgroundColor: '#374151', padding: '4px', borderRadius: '8px', margin: '0 auto', width: 'fit-content' }}>
                {userState && userState.map((row: any, r: number) =>
                    row.map((cell: number | null, c: number) => {
                        const isGiven = puzzleData.grid[r][c] !== null;
                        const isBottomThick = r === 2 || r === 5;
                        const isRightThick = c === 2 || c === 5;
                        return (
                            <input
                                key={`${r}-${c}`}
                                type="number"
                                min="1" max="9"
                                value={cell || ''}
                                readOnly={isGiven || isComplete}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value.replace(/[^1-9]/g, '').slice(-1));
                                    const newState = JSON.parse(JSON.stringify(userState));
                                    newState[r][c] = isNaN(val) ? null : val;
                                    makeMove(newState);
                                }}
                                style={{
                                    width: 45, height: 45, textAlign: 'center', fontSize: 20, fontWeight: isGiven ? 'bold' : 'normal',
                                    backgroundColor: isGiven ? '#e5e7eb' : 'white',
                                    border: 'none',
                                    borderBottom: isBottomThick ? '3px solid #374151' : 'none',
                                    borderRight: isRightThick ? '3px solid #374151' : 'none',
                                    color: isGiven ? '#111827' : '#2563eb',
                                    cursor: isGiven || isComplete ? 'not-allowed' : 'text',
                                    outline: 'none', appearance: 'textfield'
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
            <button onClick={() => navigate(`/daily/${searchParams.get('date') || new Date().toISOString().split('T')[0]}`)} style={{ marginBottom: 20, padding: '8px 16px' }}>&larr; Back to Puzzles</button>

            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Today's Puzzle</h1>
            <h2 style={{ color: '#6b7280', marginBottom: '30px', textTransform: 'capitalize' }}>{puzzleType} Challenge</h2>

            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: 30, padding: 15, background: '#f9fafb', borderRadius: 12 }}>
                <div>⏱️ <strong>{timer}s</strong></div>

                <button
                    disabled={isComplete || hintsUsed >= 2}
                    onClick={useHint}
                    style={{ padding: '8px 16px', borderRadius: 8, background: (isComplete || hintsUsed >= 2) ? '#d1d5db' : '#f59e0b', color: (isComplete || hintsUsed >= 2) ? '#6b7280' : 'white', border: 'none', cursor: (isComplete || hintsUsed >= 2) ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                >
                    💡 {hintsUsed}/2 Use Hint (-10 pts)
                </button>
            </div>

            {isComplete && (
                <div style={{ background: '#dcfce7', border: '1px solid #10b981', color: '#166534', padding: '15px 20px', marginBottom: 30, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 24 }}>🎉</span>
                        <h3 style={{ margin: 0 }}>Puzzle Completed!</h3>
                    </div>
                    {score !== null && score > 0 && (
                        <div style={{ fontWeight: 'bold', fontSize: 18 }}>Score: {score}</div>
                    )}
                    {score === 0 && (
                        <div style={{ fontWeight: 'bold', fontSize: 16 }}>Replay Complete (No Score)</div>
                    )}
                </div>
            )}

            <div style={{ marginBottom: 40 }}>
                {puzzleType === 'path' ? renderPathGrid() : renderSudokuGrid()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 100, marginTop: 20 }}>
                {puzzleType === 'path' ? (
                    <button
                        disabled={isComplete}
                        onClick={() => {
                            useModalStore.getState().openModal({
                                type: 'confirm',
                                title: 'Are you sure?',
                                message: 'Your path will be completely reset and you will have to start over.',
                                confirmText: 'Confirm',
                                cancelText: 'Cancel',
                                onConfirm: () => makeMove([puzzleData.start])
                            });
                        }}
                        style={{ padding: '12px 24px', borderRadius: 8, background: '#ef4444', color: 'white', border: 'none', cursor: isComplete ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                    >
                        Reset Path
                    </button>
                ) : (
                    <button
                        disabled={isComplete}
                        onClick={() => {
                            useModalStore.getState().openModal({
                                type: 'confirm',
                                title: 'Are you sure?',
                                message: 'Your progress will be discarded and replaced with a blank puzzle!',
                                confirmText: 'Confirm',
                                cancelText: 'Cancel',
                                onConfirm: () => makeMove(JSON.parse(JSON.stringify(puzzleData.grid)))
                            });
                        }}
                        style={{ padding: '12px 24px', borderRadius: 8, background: '#ef4444', color: 'white', border: 'none', cursor: isComplete ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                    >
                        Reset Puzzle
                    </button>
                )}

                {!isComplete && (
                    <button
                        onClick={() => {
                            // Validate and complete if manually submitting
                            import('../puzzles/validator').then((module) => {
                                const isValid = module.validatePuzzle(puzzleType, userState, puzzleData?.solution, puzzleData);
                                if (isValid) {
                                    usePuzzleStore.getState().handlePuzzleCompletion();
                                    const puzzleState = usePuzzleStore.getState();
                                    const today = new Date().toISOString().split('T')[0];

                                    if (puzzleState.date === today && puzzleState.score !== null && puzzleState.score > 0) {
                                        useModalStore.getState().openModal({
                                            type: 'celebration',
                                            title: 'Daily Puzzle Completed!',
                                            streak: useStreakStore.getState().currentStreak,
                                            score: puzzleState.score
                                        });
                                    } else {
                                        useModalStore.getState().openModal({
                                            type: 'success',
                                            title: 'Replay Completed!',
                                            message: 'Great practice! Past puzzles do not award score or streak.'
                                        });
                                    }
                                } else {
                                    useModalStore.getState().openModal({
                                        type: 'error',
                                        title: 'Incorrect Solution',
                                        message: 'Please recheck your solution and try again.'
                                    });
                                }
                            });
                        }}
                        style={{ padding: '12px 24px', borderRadius: 8, background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Submit Solution
                    </button>
                )}
            </div>
        </div>
    );
}
