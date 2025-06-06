import React from "react";
import Style from "./Loader.module.css";

const Loader = ({ size = 150 }) => {
  return (
    <div className={Style.loaderContainer}>
      <div className={Style.loaderRing} style={{ width: size, height: size }}>
        <img
          src="/Animation.gif" // Public folder does not need imports
          alt="Loading..."
          width={size}
          height={size}
          className={Style.loaderImage}
        />
      </div>
    </div>
  );
};

export default Loader;
