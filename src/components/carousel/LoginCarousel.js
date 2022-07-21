import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import colourCodedTimetable from "../../images/colour-coded-timetable.png";
import dragAndDrop from "../../images/drag-and-drop.png";
import importNUSMods from "../../images/import-nusmods.png";
import charts from "../../images/charts.png";

function LoginCarousel() {
  return (
    <>
      <Carousel
        autoPlay={true}
        dynamicHeight={true}
        emulateTouch={true}
        infiniteLoop={true}
        interval={5000}
        width="40rem"
      >
        <div>
          <img src={importNUSMods} alt="Import your own NUSMods timetable" />
          <p className="legend">Import your own NUSMods timetable</p>
        </div>
        <div>
          <img
            src={colourCodedTimetable}
            alt="Colour coding based on modules"
          />
          <p className="legend">Colour coding based on modules</p>
        </div>
        <div>
          <img src={dragAndDrop} alt="Fast and easy drag and drop scheduling" />
          <p className="legend">Fast and easy drag and drop scheduling</p>
        </div>
        <div>
          <img src={charts} alt="Analyse your timetable with dynamic charts" />
          <p className="legend">Analyse your timetable with dynamic charts</p>
        </div>
      </Carousel>
    </>
  );
}

export default React.memo(LoginCarousel);
