import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const CounselorChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const scrollRef = useRef();

    // 창이 열릴 때 시스템 메시지 자동 추가
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
        <div style={{ position: 'fixed', bottom: '100px', right: '20px', zIndex: 1000 }}>
            <button onClick={() => setIsOpen(!isOpen)} style={btnStyle}>
                {isOpen ? '닫기' : '상담사 연결'}
            </button>

            {isOpen && (
                <div style={chatWinStyle}>
                    {/* 상단 공지 바 */}
                    <div style={noticeStyle}>
                        ⚠️ 실시간 상담 지연 안내 (AI 상담 권장)
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
                            placeholder="메시지를 입력하세요..."
                            style={{ flex: 1, border: 'none', outline: 'none' }}
                        />
                        <button onClick={handleSend} style={sendBtn}>전송</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// CSS-in-JS 스타일 정의 (간략화)
const btnStyle = { padding: '10px 20px', borderRadius: '20px', backgroundColor: '#FFD400', border: 'none', cursor: 'pointer', fontWeight: 'bold' };
const chatWinStyle = { width: '320px', height: '480px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '10px', display: 'flex', flexDirection: 'column', marginTop: '10px' };
const noticeStyle = { backgroundColor: '#ffeded', color: '#d9534f', fontSize: '11px', padding: '8px', textAlign: 'center', fontWeight: 'bold' };
const msgListStyle = { flex: 1, overflowY: 'auto', padding: '10px' };
const aiBtnStyle = { backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', padding: '8px 15px', fontSize: '12px', cursor: 'pointer' };
const inputArea = { display: 'flex', padding: '10px', backgroundColor: 'white', borderTop: '1px solid #ddd' };
const myMsg = { textAlign: 'right', marginBottom: '10px', color: '#333' };
const otherMsg = { textAlign: 'left', marginBottom: '10px', color: '#555' };
const sendBtn = { backgroundColor: 'transparent', border: 'none', color: '#007bff', fontWeight: 'bold' };

export default CounselorChat;