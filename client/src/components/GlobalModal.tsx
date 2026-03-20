import { useModalStore } from '../store/modalStore';

export const GlobalModal = () => {
    const { isOpen, type, title, message, streak, score, closeModal } = useModalStore();

    if (!isOpen) return null;

    // A simple CSS spinner setup for the coin
    const CoinAnimation = () => (
        <div style={{
            fontSize: '60px',
            margin: '20px auto',
            width: '60px',
            height: '60px',
            animation: 'spin 2s linear infinite',
            lineHeight: '60px',
            textAlign: 'center'
        }}>
            <style>{`
                @keyframes spin {
                    0% { transform: rotateY(0deg); }
                    100% { transform: rotateY(360deg); }
                }
            `}</style>
            🪙
        </div>
    );

    const renderCelebration = () => (
        <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <span style={{ backgroundColor: '#22c55e', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginRight: '10px' }}>✓</span>
                <h2 style={{ fontSize: '24px', margin: 0, color: '#111827' }}>{title || 'Daily Coding Challenge Completed!'}</h2>
            </div>
            
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '20px 0 10px 0' }}>
                Completion Streak: <span style={{ color: '#3b82f6' }}>{streak}</span> Day{streak !== 1 ? 's' : ''}
            </p>
            <p style={{ color: '#6b7280', fontSize: '16px', margin: '0 0 20px 0' }}>
                {message || 'Consistency is key, see you tomorrow!'}
            </p>
            
            <CoinAnimation />
            
            {score !== undefined && (
                <div style={{ marginTop: '20px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b', backgroundColor: '#fef3c7', padding: '8px 16px', borderRadius: '20px' }}>
                        +{score} Points
                    </span>
                </div>
            )}
            
            <button 
                onClick={closeModal}
                style={{ marginTop: '30px', padding: '12px 24px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', fontWeight: 'bold', color: '#374151', cursor: 'pointer', width: '100%' }}
            >
                Superb!
            </button>
        </div>
    );

    const renderStandard = () => {
        const isError = type === 'error';
        const color = isError ? '#ef4444' : '#22c55e';
        const icon = isError ? '✕' : '✓';

        return (
            <div style={{ textAlign: 'center', padding: '10px' }}>
                <div style={{ margin: '0 auto 20px auto', backgroundColor: color, color: 'white', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                    {icon}
                </div>
                <h2 style={{ fontSize: '24px', margin: '0 0 10px 0', color: '#111827' }}>{title}</h2>
                {message && <p style={{ fontSize: '16px', color: '#4b5563', margin: '0 0 20px 0' }}>{message}</p>}
                
                <button 
                    onClick={closeModal}
                    style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: color, border: 'none', borderRadius: '8px', fontWeight: 'bold', color: 'white', cursor: 'pointer', width: '100%' }}
                >
                    {isError ? 'Try Again' : 'Continue'}
                </button>
            </div>
        );
    };

    const renderConfirm = () => (
        <div style={{ textAlign: 'left', padding: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ backgroundColor: '#10b981', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', marginRight: '10px' }}>
                    i
                </div>
                <h2 style={{ fontSize: '20px', margin: '0', color: '#111827' }}>{title}</h2>
            </div>
            
            <p style={{ fontSize: '16px', color: '#4b5563', margin: '0 0 25px 0', lineHeight: '1.5' }}>{message}</p>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                    onClick={() => {
                        useModalStore.getState().onCancel?.();
                        closeModal();
                    }}
                    style={{ padding: '10px 20px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '8px', fontWeight: 'bold', color: '#374151', cursor: 'pointer' }}
                >
                    {useModalStore.getState().cancelText || 'Cancel'}
                </button>
                <button 
                    onClick={() => {
                        useModalStore.getState().onConfirm?.();
                        closeModal();
                    }}
                    style={{ padding: '10px 20px', backgroundColor: '#10b981', border: 'none', borderRadius: '8px', fontWeight: 'bold', color: 'white', cursor: 'pointer' }}
                >
                    {useModalStore.getState().confirmText || 'Confirm'}
                </button>
            </div>
        </div>
    );

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '30px',
                width: '100%',
                maxWidth: '450px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative'
            }}>
                <button 
                    onClick={closeModal}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', color: '#9ca3af', cursor: 'pointer' }}
                >
                    ✕
                </button>
                
                {type === 'celebration' ? renderCelebration() : type === 'confirm' ? renderConfirm() : renderStandard()}
            </div>
        </div>
    );
};
