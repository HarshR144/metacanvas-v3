import React from "react";
import Image from "next/image.js";
import { useRouter } from "next/router.js";

//INTERNAL IMPORT
import Style from "./Brand.module.css";
import images from "../../img/index.js";
import { Button } from "../componentsindex.js";

const Brand = () => {
  const router = useRouter();
  return (
    <div className={Style.Brand}>
      <div className={Style.Brand_box}>
        <div className={Style.Brand_box_left}>
          <a href="/">
            <Image
              src="/logo.png"
              alt="Brand Logo"
              width={160}
              height={100}
              priority
            />
          </a>
          <h1>Get best of MetaCanvas</h1>
          <p>A creative agency that lead and inspire.</p>

          <div className={Style.Brand_box_left_btn}>
            <Button
              btnName="Create"
              handleClick={() => router.push("/uploadNFT")}
            />
            <Button
              btnName="Explore"
              handleClick={() => router.push("/searchPage")}
            />
          </div>
        </div>
        <div className={Style.Brand_box_right}>
          <Image src={images.earn} alt="brand logo" width={800} height={600} />
        </div>
      </div>
    </div>
  );
};

export default Brand;
