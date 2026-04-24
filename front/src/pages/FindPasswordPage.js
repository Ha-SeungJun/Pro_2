import * as React from 'react';
import FindPasswordComponent from '../layout/component/users/FindPasswordComponent';

const FindPasswordPage = () => {
    return (
        // 수정: fixed/z-index 제거
        // 수정: Header/Footer와 겹치지 않도록 일반 문서 흐름으로 배치
        <main className="w-full min-h-[calc(100vh-420px)] flex justify-center items-start bg-white py-16 px-4">
            <FindPasswordComponent />
        </main>
    );
};

export default FindPasswordPage;