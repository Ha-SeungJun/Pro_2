import SignUpComponent from '../layout/component/users/SignUPComponent';

const SignUpPage = () => {
    return (
        <div className="flex flex-col w-full justify-center items-center py-10 bg-white">
            <div className="w-full max-w-[600px] px-4">
                <div className="h-auto">
                    <SignUpComponent />
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;