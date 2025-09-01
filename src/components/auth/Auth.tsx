"use client"
import { FormEvent, useState } from 'react'; import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const AuthComponent = () => {
    const router = useRouter()

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {

        e.preventDefault();
        setIsLoading(true);

        if (!isEmailSubmitted) {
            console.log({ email, })
            axios.post("/api/db/auth/get-otp", {
                email
            }).then((res) => {
                toast.success("OTP sent to your provided email")
                setIsEmailSubmitted(true)
                if (res.status !== 200) {
                    let message = res?.data?.message
                    toast.error(message)
                }
            }).catch((error) => {
                console.log(error)

                let message = "Something went wrong"
                toast.error(message)
            }).finally(() => setIsLoading(false))
            return
        }
        if (isEmailSubmitted) {
            axios.post("/api/db/auth/verify-otp", {
                email, code: otp
            }).then((res) => {
                console.log({ res })
                toast.success("Login successful")
                if (res.status !== 200) {
                    let message = res?.data?.message
                    toast.error(message)
                    return
                }
                router.push("/dashboard");
            }).catch((error) => {
                let message = "Something went wrong"
                if (axios.isAxiosError(error)) {
                    message = error.response?.data || error.message
                }
                toast.error(message)
            }).finally(() => setIsLoading(false))
        }




        console.log({ email, otp })
        return



    };

    //   const handleOtpSubmit = async (e) => {
    //     e.preventDefault();
    //     setIsLoading(true);


    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isEmailSubmitted ? 'Enter Verification Code' : 'Sign in to your account'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {isEmailSubmitted
                            ? `We've sent a code to ${email}`
                            : 'Enter your email to receive a one-time password'
                        }
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                </div>
                                <input
                                    disabled={isEmailSubmitted}
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-2 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>




                    <div className=' min-h-9 my-2 flex flex-col space-y-4'>
                        {isEmailSubmitted && (<>
                            <div className=''>
                                <label htmlFor="otp" className=" sr-only">
                                    Verification Code
                                </label>
                                <div className="w-full">
                                    <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)} className='w-full '>
                                        <InputOTPGroup className='w-full  flex justify-center-safe'>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-sm">
                                    <button
                                        type="button"
                                        onClick={() => { setIsEmailSubmitted(false); setEmail("") }}
                                        className="font-medium text-teal-600 hover:text-teal-500"
                                    >
                                        Use a different email
                                    </button>
                                </div>
                                <div className="text-sm">
                                    <button
                                        type="button"
                                        className="font-medium text-teal-600 hover:text-teal-500"
                                    >
                                        Resend code
                                    </button>
                                </div>
                            </div></>
                        )}

                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200 ease-in-out disabled:opacity-75"
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending code...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    Continue
                                </span>
                            )}
                        </button></div>
                </form>

            </div>
        </div>
    );
};

export default AuthComponent;