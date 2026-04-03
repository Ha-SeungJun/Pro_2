import * as React from 'react';
import FindIdComponent from '../layout/component/users/FindIdComponent';

export default function FindIdPage() {
    // 인증 완료 후 이메일을 받아 다음 단계 수행
    const handleComplete = (email) => {
        // TODO: 이 이메일로 아이디(로그인ID) 목록/마스킹 조회 API 호출 등
        // 예: navigate(`/find-id/result?email=${encodeURIComponent(email)}`)
        console.log('인증된 이메일:', email);
    };

    return (
        <div className="fixed top-0 left-0 z-[1055] flex flex-col h-full w-full">
            <div className="flex flex-wrap w-full h-full justify-center items-center border-2">
                <FindIdComponent onComplete={handleComplete} />
            </div>
        </div>
    );
}
