import React from "react";
import Image from "next/image";

const PromoBanner = () => {
  return (
    <section className="overflow-hidden py-6 bg-white">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- promo banner big --> */}
        <div className="relative z-1 overflow-hidden rounded-lg bg-white border-2 border-gray-200 shadow-lg py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5">
          <div className="max-w-[550px] w-full">
            <span className="block font-medium text-xl text-gray-900 mb-3">
              ASUS TUF Gaming A15
            </span>

            <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-gray-900 mb-5">
              GIẢM ĐẾN 30%
            </h2>

            <p className="text-gray-700">
              Laptop gaming hiệu năng cao với RTX 4060, CPU Ryzen 7, màn hình 144Hz.
              Thiết kế bền bỉ chuẩn quân đội, tối ưu cho game thủ.
            </p>

            <a
              href="#"
              className="inline-flex font-medium text-custom-sm text-white bg-gray-900 hover:bg-gray-800 py-[11px] px-9.5 rounded-md ease-out duration-200 mt-7.5 transition-colors"
            >
              Buy Now
            </a>
          </div>

          <Image
            src="/images/promo/promo-01.png"
            alt="promo img"
            className="absolute bottom-0 right-4 lg:right-26 -z-1"
            width={274}
            height={350}
          />
        </div>

        <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
          {/* <!-- promo banner small --> */}
          <div className="relative z-1 overflow-hidden rounded-lg bg-white border-2 border-gray-200 shadow-lg py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
            <Image
              src="/images/promo/promo-02.png"
              alt="promo img"
              className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-10 -z-1 opacity-80"
              width={241}
              height={241}
            />

            <div className="text-right">
              <span className="block text-lg text-gray-900 mb-1.5">
                Foldable Motorised Treadmill
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 text-gray-900 mb-2.5">
                Workout At Home
              </h2>

              <p className="font-semibold text-custom-1 text-gray-700">
                Flat 20% off
              </p>

              <a
                href="#"
                className="inline-flex font-medium text-custom-sm text-white bg-gray-900 hover:bg-gray-800 py-2.5 px-8.5 rounded-md ease-out duration-200 mt-9 transition-colors"
              >
                Grab Now
              </a>
            </div>
          </div>

          {/* <!-- promo banner small --> */}
          <div className="relative z-1 overflow-hidden rounded-lg bg-white border-2 border-gray-200 shadow-lg py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
            <Image
              src="/images/promo/promo-03.png"
              alt="promo img"
              className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-8.5 -z-1 opacity-80"
              width={200}
              height={200}
            />

            <div>
              <span className="block text-lg text-gray-900 mb-1.5">
                HP Spectre x360
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 text-gray-900 mb-2.5">
                Giảm đến <span className="text-gray-700">40%</span>
              </h2>

              <p className="max-w-[285px] text-custom-sm text-gray-700">
                Laptop 2-in-1 cao cấp với màn hình cảm ứng, thiết kế sang trọng,
                hiệu năng mạnh mẽ cho công việc và giải trí.
              </p>

              <a
                href="#"
                className="inline-flex font-medium text-custom-sm text-white bg-gray-900 hover:bg-gray-800 py-2.5 px-8.5 rounded-md ease-out duration-200 mt-7.5 transition-colors"
              >
                Buy Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
