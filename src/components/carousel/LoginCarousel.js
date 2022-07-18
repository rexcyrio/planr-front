import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import image from "../../images/notebook-background-image.jpg";
import image2 from "../../images/buttermilk-pancakes-1200-square-for-recipe-card-40.jpg";

function LoginCarousel() {
  return (
    <>
      <Carousel
        autoPlay={true}
        dynamicHeight={true}
        emulateTouch={true}
        infiniteLoop={true}
        // showThumbs={false}
        width="40rem"
      >
        <div>
          <img src={image} alt="frist" />
          <p className="legend">Legend 1</p>
        </div>
        <div>
          <img src={image2} alt="second" />
          <p className="legend">Legend 2</p>
        </div>
      </Carousel>
    </>
  );
}

export default LoginCarousel;
