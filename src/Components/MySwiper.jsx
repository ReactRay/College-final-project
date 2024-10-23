import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.min.css';

const MySwiper = ({ listings, onClick }) => {
  const [slidesPerView, setSlidesPerView] = useState(
    window.innerWidth < 640 ? 1 : 2
  );

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
      {listings.map(({ id, data }) => (
        <SwiperSlide key={id} onClick={() => onClick(id, data.type)}>
          <div
            style={{
              background: `url(${data.imgUrl[0]}) center no-repeat`,
              backgroundSize: 'cover',
            }}
            className="swiperSlideDiv"
          >
            <p className="swiperSlideText">
              {data.brand} {data.model}
            </p>
            <p className="swiperSlidePrice">
              {data.price} ₪{data.type === 'rent' ? ' / Day' : ''}
            </p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default MySwiper;
