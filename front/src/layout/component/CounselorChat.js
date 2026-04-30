import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const CounselorChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const scrollRef = useRef();

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: 'sys-1',
                senderName: '시스템',
                message: '안녕하세요. 현재 문의가 폭주하여 상담사 연결이 지연되고 있습니다. 빠른 답변을 원하시면 AI 상담사를 이용해 주세요.',
                isSystem: true
            }]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const newMsg = { senderName: '사용자', message: input };

        try {
            const res = await axios.post('/api/chat/send', newMsg);
            setMessages([...messages, res.data]);
            setInput('');

            setTimeout(() => {
                const systemReply = {
                    id: `sys-${Date.now()}`,
                    senderName: '시스템',
                    message: '안녕하세요. 현재 문의가 폭주하여 상담사 연결이 지연되고 있습니다. 빠른 답변을 원하시면 AI 상담사를 이용해 주세요.',
                    isSystem: true
                };
                setMessages(prev => [...prev, systemReply]);
            }, 300);

        } catch (err) {
            console.error("전송 실패", err);
        }
    };

    return (
        /* ✅ 최상위 div의 fixed 속성을 제거했습니다. (App.js에서 관리) */
        <div style={{ position: 'relative' }}>
            <button onClick={() => setIsOpen(!isOpen)} style={btnStyle}>
                {isOpen ? '✕' : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '24px' }}>💬</span>
                        <span style={{ fontSize: '9px' }}>상담사</span>
                    </div>
                )}
            </button>

            {isOpen && (
                <div style={chatWinStyle}>
                    <div style={noticeStyle}>
                        ⚠️ 실시간 상담 지연 안내 (AI 권장)
                    </div>

                    <div style={msgListStyle}>
                        {messages.map((m, i) => (
                            <div key={i} style={m.senderName === '사용자' ? myMsg : otherMsg}>
                                <strong>{m.senderName}:</strong> {m.message}
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>

                    <div style={inputArea}>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="메시지 입력..."
                            style={{ flex: 1, border: 'none', outline: 'none' }}
                        />
                        <button onClick={handleSend} style={sendBtn}>전송</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ✅ 스타일 업데이트: 다른 버튼들과 일체감을 주기 위해 원형으로 변경
const btnStyle = { 
    width: '64px', 
    height: '64px', 
    borderRadius: '50%', 
    backgroundColor: '#FFD400', 
    border: '2px solid white', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0
};

// 채팅창 위치는 버튼 위쪽으로 뜨도록 조정
const chatWinStyle = { 
    position: 'absolute',
    bottom: '80px',
    right: '0',
   width: '240px', 
    height: '300px',
    backgroundColor: '#f5f5f5', 
    border: '1px solid #ddd', 
    borderRadius: '15px', 
    display: 'flex', 
    flexDirection: 'column',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    overflow: 'hidden'
};

const noticeStyle = { backgroundColor: '#ffeded', color: '#d9534f', fontSize: '11px', padding: '8px', textAlign: 'center', fontWeight: 'bold' };
const msgListStyle = { flex: 1, overflowY: 'auto', padding: '10px' };
const inputArea = { display: 'flex', padding: '10px', backgroundColor: 'white', borderTop: '1px solid #ddd' };
const myMsg = { textAlign: 'right', marginBottom: '10px', color: '#333', fontSize: '13px' };
const otherMsg = { textAlign: 'left', marginBottom: '10px', color: '#555', fontSize: '13px' };
const sendBtn = { backgroundColor: 'transparent', border: 'none', color: '#007bff', fontWeight: 'bold', cursor: 'pointer' };

export default CounselorChat;
