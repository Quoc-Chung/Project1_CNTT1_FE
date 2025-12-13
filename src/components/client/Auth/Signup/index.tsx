"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";   
import Breadcrumb from "@/components/client/Common/Breadcrumb";
import { toast } from "react-toastify";
import { useAppDispatch } from "@/redux/store";
import { Register } from "@/types/Client/Auth/Register";
import { register } from "../../../../redux/Client/Auth/Action";

const Signup: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter(); 

  const [formData, setFormData] = useState<Register>({
    account: "",
    password: "",
    email: "",
    fullname: "",
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Register data:", formData);
  
    dispatch(
      register(
        formData,
        () => {
          if (isHydrated) {
            localStorage.setItem("account", formData.account); 
            localStorage.setItem("password", formData.password)
          }
          toast.success("🎉 Đăng kí thành công", {
            autoClose: 1500,
            position: "top-right"
          });
          setTimeout(() => {
            router.push("/signin");
          }, 1500);
        },
        (err) => {
          toast.error(`Đăng ký thất bại: ${err}`, {
            autoClose: 2000,
            position: "top-right"
          });
        }
      )
    );
  };

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb title="Signup" pages={["Signup"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            {/* Heading */}
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Create an Account
              </h2>
              <p>Enter your details below</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5.5">
              {/* Fullname */}
              <div className="mb-5">
                <label htmlFor="fullname" className="block mb-2.5">
                  Full Name <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  name="fullname"
                  id="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 w-full py-3 px-5"
                  suppressHydrationWarning
                />
              </div>

              {/* Account */}
              <div className="mb-5">
                <label htmlFor="account" className="block mb-2.5">
                  Account <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  name="account"
                  id="account"
                  value={formData.account}
                  onChange={handleChange}
                  placeholder="Enter your account"
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 w-full py-3 px-5"
                  suppressHydrationWarning
                />
              </div>

              {/* Email */}
              <div className="mb-5">
                <label htmlFor="email" className="block mb-2.5">
                  Email Address <span className="text-red">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 w-full py-3 px-5"
                  suppressHydrationWarning
                />
              </div>

              {/* Password */}
              <div className="mb-5">
                <label htmlFor="password" className="block mb-2.5">
                  Password <span className="text-red">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 w-full py-3 px-5"
                  suppressHydrationWarning
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full flex justify-center font-medium text-white bg-dark py-1.5 px-6 rounded-md hover:bg-blue mt-7.5"
                suppressHydrationWarning
              >
                Create Account
              </button>

              {/* Sign in link */}
              <p className="text-center mt-6">
                Already have an account?
                <Link href="/signin" className="text-dark hover:text-blue pl-2">
                  Sign in Now
                </Link>
              </p>
                  <p className="text-center mt-[10px] mb-[70px]"> ---or--- </p>
              {/* Login Buttons */}
              <div className="flex  gap-4">
                {/* Google Button */}
                <button
                  className={`
              group relative w-full flex items-center justify-center gap-3 
              bg-gradient-to-r from-red-500 to-orange-400 
              hover:from-red-600 hover:to-orange-500
              text-white font-semibold py-1.5 px-6 rounded-md
              transform transition-all duration-300 ease-out
              hover:scale-105 hover:shadow-2xl hover:-translate-y-1
              active:scale-95 active:translate-y-0
              disabled:opacity-70 disabled:cursor-not-allowed
              overflow-hidden
              
            `}
                  suppressHydrationWarning
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                  {/* Google Icon */}
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.61l6.85-6.85C35.64 2.73 30.15 0 24 0 14.64 0 6.48 5.49 2.48 13.44l7.97 6.18C12.29 13.69 17.71 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.1 24.5c0-1.62-.15-3.18-.42-4.68H24v9.09h12.5c-.54 2.89-2.13 5.34-4.54 7.01l7.02 5.46C43.54 37.73 46.1 31.64 46.1 24.5z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.45 28.62c-.48-1.42-.75-2.94-.75-4.62s.27-3.2.75-4.62l-7.97-6.18C.89 16.64 0 20.21 0 24c0 3.79.89 7.36 2.48 10.8l7.97-6.18z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.15 0 11.64-2.02 15.54-5.5l-7.02-5.46c-2.04 1.38-4.64 2.21-8.52 2.21-6.29 0-11.71-4.19-13.55-10.12l-7.97 6.18C6.48 42.51 14.64 48 24 48z"
                    />
                  </svg>

                  google
                </button>

             
              
              </div>

            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
