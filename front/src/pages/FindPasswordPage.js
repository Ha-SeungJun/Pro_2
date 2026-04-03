import * as React from 'react';
import FindPasswordComponent from '../layout/component/users/FindPasswordComponent';

const FindPasswordPage = () => {
    return (
        <div className="fixed top-0 left-0 z-[1055] flex flex-col h-full w-full">
            <div className="flex flex-wrap w-full h-full justify-center items-center border-2">
                <FindPasswordComponent />
            </div>
        </div>
    );
};

export default FindPasswordPage;