import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.min.css';

const ListingSwiper = ({ imgUrls }) => {
  const [slidesPerView, setSlidesPerView] = useState(window.innerWidth < 640 ? 1 : 2);

  useEffect(() => {
    const handleResize = () => {
      setSlidesPerView(window.innerWidth < 640 ? 1 : 2);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Swiper slidesPerView={slidesPerView} pagination={{ clickable: true }}>
      {imgUrls.map((url, index) => (
        <SwiperSlide key={index}>
          <div
            style={{
              background: `url(${url}) center no-repeat`,
              backgroundSize: 'cover',
            }}
            className='swiperSlideDiv'
          ></div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ListingSwiper;
