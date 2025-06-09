import React, { useState, useEffect } from "react";
import { MdOutlineHttp, MdOutlineAttachFile } from "react-icons/md";
import { FaPercent } from "react-icons/fa";
import { AiTwotonePropertySafety } from "react-icons/ai";
import { TiTick } from "react-icons/ti";
import Image from "next/image";
import { useRouter } from "next/router";

//INTERNAL IMPORT
import Style from "./Upload.module.css";
import formStyle from "../AccountPage/Form/Form.module.css";
import images from "../img/index.js";
import { Button } from "../components/componentsindex.js";
import { DropZone } from "./uploadNFTIndex.js";
import { extractIPFSHash } from "../lib/utils/clientImageUtils.js";
import TagsInput from "../components/Tags/TagsInput.js";
import axios from "axios";
import toast from "react-hot-toast";


const UploadNFT = ({ uploadToIPFS, createNFT, uploadToPinata }) => {
  const [price, setPrice] = useState(0);
  const [active, setActive] = useState(0);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [royalties, setRoyalties] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [category, setCategory] = useState(0);
  const [properties, setProperties] = useState("");
  const [image, setImage] = useState(null);
  const [useGeneratedImage, setUseGeneratedImage] = useState(false);
  // Auction states:
  const [isAuction, setIsAuction] = useState(false);
  const [startPrice, setStartPrice] = useState("");
  const [buyoutPrice, setBuyoutPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState([]);

  const router = useRouter();

  const categoryArry = [
    { image: images.nft_image_1, category: "Sports" },
    { image: images.nft_image_2, category: "Arts" },
    { image: images.nft_image_3, category: "Music" },
    { image: images.nft_image_1, category: "Digital" },
    { image: images.nft_image_2, category: "Time" },
    { image: images.nft_image_3, category: "Photography" },
  ];

  useEffect(() => {
    if (router.query.generatedImageUrl) {
      setImage(router.query.generatedImageUrl);
      setUseGeneratedImage(true);
    }
  }, [router.query])


  // const handleSubmit = async () => {

  //   await createNFT(name, description, image, price);
  //   router.push("/"); // Redirect after creation
  // };

  const updateTokenIdForHash = async (ipfsHash, tokenId) => {
    try {
      
      const { data } = await axios.post("/api/imageHash/updateTokenId", {
        ipfsHash,
        tokenId,
      });
  
      console.log("Token ID updated successfully:", data);
    } catch (error) {
      console.error("Error updating token ID:", error.response?.data || error.message);
    }
  };
  const handleSubmit = async () => {
    try{
      setIsSubmitting(true);
    // Create an attributes array with the category
      const attributes = [];

      // Add category if selected
      if (category) {
        attributes.push({ trait_type: "Category", value: category });
      }

      // Add properties if provided
      if (properties) {
        attributes.push({ trait_type: "Properties", value: properties });
      }

      // Add royalties if provided
      if (royalties) {
        attributes.push({ trait_type: "Royalties", value: royalties });
      }

      // Add fileSize if provided
      if (fileSize) {
        attributes.push({ trait_type: "Size", value: fileSize });
      }

      // Add website if provided
      if (website) {
        attributes.push({ trait_type: "Website", value: website });
      }
       // Add tags if provided
      if (tags.length > 0) {
        attributes.push({ trait_type: "Tags", value: tags.join(", ") });
      }

      let nftCreationResult;
      if (isAuction) {
        nftCreationResult = await createNFT(
          name,
          description,
          image,
          price,
          true,
          startPrice,
          buyoutPrice,
          duration,
          attributes,
          tags
        );
      } else {
        nftCreationResult = await createNFT(
          name,
          description,
          image,
          price,
          false,
          0,
          0,
          0,
          attributes,
          tags
        );
      }
      if (nftCreationResult) {
        const ipfsHash = extractIPFSHash(image);
        
        // Import this function from your imageUtils.js
        // This function should find the temp record by ipfsHash and update with real nftId
        await updateTokenIdForHash(ipfsHash, nftCreationResult.toString());
        // toast.success("NFT created successfully!");
        router.push("/");
      } else {
        // toast.error("Failed to create NFT");
      }
    } catch (error) {
      console.error("Error creating NFT:", error);
      // toast.error("Error creating NFT: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
console.log(image);
  return (
    <div className={Style.upload}>
      {!useGeneratedImage && (
        <DropZone
        title="JPG, PNG, WEBM , MAX 100MB"
        heading="Drag & drop file"
        subHeading="or Browse media on your device"
        name={name}
        website={website}
        description={description}
        royalties={royalties}
        fileSize={fileSize}
        category={category}
        properties={properties}
        tags={tags}
        setImage={setImage}
        uploadToIPFS={uploadToIPFS}
        uploadToPinata={uploadToPinata}
      />

      )}

      {useGeneratedImage && image && (
        <div className={Style.generated_image_preview}>
          <h2>Using Generated Image</h2>
          <div className={Style.generated_image_container}>
            <Image
              src={image}
              alt="Generated NFT"
              width={400}
              height={400}
              layout="responsive"
              objectFit="contain"
              unoptimized={image.startsWith('data:')}
            />
          </div>
        </div>
      )}

      <div className={Style.upload_box}>
        <div className={formStyle.Form_box_input}>
          <label htmlFor="nft">Item Name</label>
          <div className={formStyle.Form_box_input_box}>
            <input
              type="text"
              placeholder="Enter Item Name"
              className={formStyle.Form_box_input_userName}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* sale type selector */}
        <div className={formStyle.Form_box_input}>
          <label>Sale Type</label>
          <div className={Style.sale_type_selector}>
            <button
              className={`${Style.sale_type_btn} ${
                !isAuction ? Style.active : ""
              }`}
              onClick={() => setIsAuction(false)}
            >
              Fixed Price
            </button>
            <button
              className={`${Style.sale_type_btn} ${
                isAuction ? Style.active : ""
              }`}
              onClick={() => setIsAuction(true)}
            >
              Auction
            </button>
          </div>
        </div>

        {/* Conditional Auction Fields */}
        {isAuction ? (
          <div className={Style.auction_fields}>
            <div className={formStyle.Form_box_input}>
              <label>Starting Price (ETH)</label>
              <div className={formStyle.Form_box_input_box}>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.1"
                  onChange={(e) => setStartPrice(e.target.value)}
                />
              </div>
            </div>

            <div className={formStyle.Form_box_input}>
              <label>Buyout Price (ETH)</label>
              <div className={formStyle.Form_box_input_box}>
                <input
                  type="number"
                  step="0.01"
                  placeholder="1.0"
                  onChange={(e) => setBuyoutPrice(e.target.value)}
                />
              </div>
            </div>

            <div className={formStyle.Form_box_input}>
              <label>Duration (Days)</label>
              <div className={formStyle.Form_box_input_box}>
                <input
                  type="number"
                  min="1"
                  placeholder="7"
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className={formStyle.Form_box_input}>
            <label htmlFor="Price">Price</label>
            <div
              className={`${formStyle.Form_box_input_box} ${Style.price_input_box}`}
            >
              <div className={formStyle.Form_box_input_box_icon}>
                <AiTwotonePropertySafety />
              </div>
              <input
                className={Style.price_input_box}
                type="number"
                placeholder="Price"
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className={formStyle.Form_box_input}>
          <label htmlFor="website">Website</label>
          <div className={formStyle.Form_box_input_box}>
            <div className={formStyle.Form_box_input_box_icon}>
              <MdOutlineHttp />
            </div>

            <input
              type="text"
              placeholder="website"
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <p className={Style.upload_box_input_para}>
            Ciscrypt will include a link to this URL on this item's detail page,
            so that users can click to learn more about it. You are welcome to
            link to your own webpage with more details.
          </p>
        </div>

        <div className={formStyle.Form_box_input}>
          <label htmlFor="description">Description</label>
          <div>
            <textarea
              name=""
              id=""
              cols="30"
              rows="6"
              placeholder="NFT Description"
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          {/* <p>
            The description will be included on the item's detail page
            underneath its image. Markdown syntax is supported.
          </p> */}
        </div>
        
        {/* Tags */}
        <div className={formStyle.Form_box_input}>
          <label htmlFor="tags">Tags</label>
          <TagsInput 
            tags={tags}
            setTags={setTags}
            placeholder="Add tags and press Enter..."
          />
          <p className={Style.upload_box_input_para}>
            Add relevant tags to help users discover your NFT. Press Enter to add each tag.
          </p>
        </div>


        {/* <div className={formStyle.Form_box_input}>
          <label htmlFor="name">Choose collection</label>
          <p className={Style.upload_box_input_para}>
            Choose an exiting collection or create a new one
          </p>

          <div className={Style.upload_box_slider_div}>
            {categoryArry.map((el, i) => (
              <div
                className={`${Style.upload_box_slider} ${
                  active == i + 1 ? Style.active : ""
                }`}
                key={i + 1}
                onClick={() => (setActive(i + 1), setCategory(el.category))}
              >
                <div className={Style.upload_box_slider_box}>
                  <div className={Style.upload_box_slider_box_img}>
                    <Image
                      src={el.image}
                      alt="background image"
                      width={70}
                      height={70}
                      className={Style.upload_box_slider_box_img_img}
                    />
                  </div>
                  <div className={Style.upload_box_slider_box_img_icon}>
                    <TiTick />
                  </div>
                </div>
                <p>Crypto Legend - {el.category} </p>
              </div>
            ))}
          </div>
        </div>

        <div className={formStyle.Form_box_input_social}>
          <div className={formStyle.Form_box_input}>
            <label htmlFor="Royalties">Royalties</label>
            <div className={formStyle.Form_box_input_box}>
              <div className={formStyle.Form_box_input_box_icon}>
                <FaPercent />
              </div>
              <input
                type="text"
                placeholder="20%"
                onChange={(e) => setRoyalties(e.target.value)}
              />
            </div>
          </div>
          <div className={formStyle.Form_box_input}>
            <label htmlFor="size">Size</label>
            <div className={formStyle.Form_box_input_box}>
              <div className={formStyle.Form_box_input_box_icon}>
                <MdOutlineAttachFile />
              </div>
              <input
                type="text"
                placeholder="165MB"
                onChange={(e) => setFileSize(e.target.value)}
              />
            </div>
          </div>
          <div className={formStyle.Form_box_input}>
            <label htmlFor="Propertie">Propertie</label>
            <div className={formStyle.Form_box_input_box}>
              <div className={formStyle.Form_box_input_box_icon}>
                <AiTwotonePropertySafety />
              </div>
              <input
                type="text"
                placeholder="Propertie"
                onChange={(e) => setProperties(e.target.value)}
              />
            </div>
          </div>
        </div> */}

        <div className={Style.upload_box_btn}>
          <Button
             btnName={isSubmitting ? "Creating..." : "Upload"}
            handleClick={handleSubmit}
            classStyle={`${Style.upload_box_btn_style} ${isSubmitting ? Style.disabled : ""}`}
            disabled={isSubmitting}
          />
          <Button
            btnName="Preview"
            handleClick={() => {}}
            classStyle={Style.upload_box_btn_style}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadNFT;
