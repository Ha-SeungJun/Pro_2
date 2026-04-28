import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';

const AiChatBot = () => {
    const nodeRef = useRef(null);
    const scrollRef = useRef(null);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'G2I4 화물운송 AI 상담원입니다. 무엇을 도와드릴까요?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const isMobile = window.innerWidth <= 480;

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:8080/api/ai/ask", { question: input });
            setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: "서버 연결 오류가 발생했습니다." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {!isOpen && (
                <div
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        backgroundColor: '#0056b3', color: 'white', display: 'flex',
                        justifyContent: 'center', alignItems: 'center',
                        fontSize: isMobile ? '24px' : '30px',
                        cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        border: '2px solid white'
                    }}
                >
                    🤖
                </div>
            )}

            {isOpen && (
                <Draggable nodeRef={nodeRef} handle=".chat-header">
                    <div
                        ref={nodeRef}
                        style={{
                            position: 'fixed',
                            width: isMobile ? '80%' : '320px',
                            right: isMobile ? '10%' : '40px',
                            left: isMobile ? '10%' : 'auto',
                            bottom: isMobile ? '20px' : '100px',

                            maxHeight: isMobile ? '70vh' : 'none',
                            backgroundColor: 'white',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                            borderRadius: isMobile ? '15px' : '15px',
                            display: 'flex', flexDirection: 'column', overflow: 'hidden',
                            border: '1px solid #ddd', zIndex: 10001
                        }}
                    >
                        {/* 헤더 */}
                        <div
                            className="chat-header"
                            style={{
                                backgroundColor: '#0056b3', color: 'white',
                                padding: isMobile ? '12px 15px' : '15px',
                                fontWeight: 'bold', display: 'flex',
                                justifyContent: 'space-between', alignItems: 'center',
                                cursor: 'move', fontSize: isMobile ? '13px' : '15px'
                            }}
                        >
                            <span>G2I4 AI 상담원</span>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* 메시지 영역 */}
                        <div
                            ref={scrollRef}
                            style={{
                                height: isMobile ? '45vh' : '320px',
                                overflowY: 'auto',
                                padding: isMobile ? '10px' : '15px',
                                backgroundColor: '#f9f9f9',
                                display: 'flex', flexDirection: 'column', gap: '8px'
                            }}
                        >
                            {messages.map((m, i) => (
                                <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                    <div style={{
                                        padding: isMobile ? '7px 10px' : '10px',
                                        borderRadius: '10px',
                                        backgroundColor: m.role === 'user' ? '#0056b3' : '#e9ecef',
                                        color: m.role === 'user' ? 'white' : '#333',
                                        fontSize: isMobile ? '12px' : '13px',
                                        lineHeight: '1.4',
                                        wordBreak: 'break-word'
                                    }}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#888', alignSelf: 'flex-start' }}>
                                    AI가 답변을 생각 중입니다...
                                </div>
                            )}
                        </div>

                        {/* 입력 영역 */}
                        <div style={{ display: 'flex', borderTop: '1px solid #ddd' }}>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="질문을 입력하세요..."
                                style={{
                                    flexGrow: 1, border: 'none',
                                    padding: isMobile ? '10px 12px' : '15px',
                                    outline: 'none',
                                    fontSize: isMobile ? '12px' : '14px'
                                }}
                            />
                            <button
                                onClick={handleSend}
                                style={{
                                    backgroundColor: '#0056b3', color: 'white', border: 'none',
                                    padding: '0 16px', cursor: 'pointer', fontWeight: 'bold',
                                    fontSize: isMobile ? '12px' : '14px'
                                }}
                            >
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