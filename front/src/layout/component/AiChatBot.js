import React, { useState, useRef } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';

const AiChatBot = () => {
    const nodeRef = useRef(null);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'G2I4 화물운송 AI 상담원입니다. 무엇을 도와드릴까요?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    // 💡 초기값을 false로 두어 처음엔 버튼만 보이게 합니다.
    const [isOpen, setIsOpen] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:80/api/ai/ask", { question: input });
            setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: "서버 연결 오류가 발생했습니다." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* 1. 플로팅 버튼 (창이 닫혀있을 때만 보임) */}
            {!isOpen && (
                <div 
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed', bottom: '20px', right: '20px',
                        width: '60px', height: '60px', borderRadius: '50%',
                        backgroundColor: '#0056b3', color: 'white', display: 'flex',
                        justifyContent: 'center', alignItems: 'center', fontSize: '30px',
                        cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 10000
                    }}
                >
                    🤖
                </div>
            )}

            {/* 2. 채팅창 (isOpen이 true일 때만 보임) */}
            {isOpen && (
                <Draggable nodeRef={nodeRef} handle=".chat-header">
                    <div
                        ref={nodeRef}
                        style={{
                            position: 'fixed', bottom: '20px', right: '20px',
                            width: '350px', backgroundColor: 'white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '10px',
                            display: 'flex', flexDirection: 'column', overflow: 'hidden',
                            border: '1px solid #ddd', zIndex: 9999
                        }}
                    >
                        {/* 헤더 */}
                        <div
                            className="chat-header"
                            style={{
                                backgroundColor: '#0056b3', color: 'white', padding: '15px',
                                fontWeight: 'bold', display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', cursor: 'move'
                            }}
                        >
                            <span>G2I4 AI 상담원</span>
                            <button
                                onClick={() => setIsOpen(false)} // 창 닫기
                                style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* 메시지 영역 */}
                        <div style={{ height: '350px', overflowY: 'auto', padding: '15px', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {messages.map((m, i) => (
                                <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                    <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: m.role === 'user' ? '#0056b3' : '#e9ecef', color: m.role === 'user' ? 'white' : '#333', fontSize: '14px', lineHeight: '1.4', wordBreak: 'break-word' }}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {loading && <div style={{ fontSize: '12px', color: '#888', alignSelf: 'flex-start' }}>AI가 답변을 생각 중입니다...</div>}
                        </div>

                        {/* 입력 영역 */}
                        <div style={{ display: 'flex', borderTop: '1px solid #ddd' }}>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="질문을 입력하세요..."
                                style={{ flexGrow: 1, border: 'none', padding: '15px', outline: 'none' }}
                            />
                            <button onClick={handleSend} style={{ backgroundColor: '#0056b3', color: 'white', border: 'none', padding: '0 20px', cursor: 'pointer', fontWeight: 'bold' }}>
                                전송
                            </button>
                        </div>
                    </div>
                </Draggable>
            )}
        </>
    );
};

export default AiChatBot;