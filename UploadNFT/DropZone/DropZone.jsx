import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
//INTRNAL IMPORT
import Style from "./DropZone.module.css";
import images from "../../img";
import { extractIPFSHash } from "../../lib/utils/clientImageUtils";
import axios from "axios";

const DropZone = ({
  title,
  heading,
  subHeading,
  name,
  website,
  description,
  royalties,
  fileSize,
  category,
  properties,
  tags,
  uploadToIPFS,
  uploadToPinata,
  setImage,
}) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(null);

  const onDrop = useCallback(async (acceptedFile) => {
    try{
      // const url = await uploadToIPFS(acceptedFile[0]);
      setIsVerifying(true);
      setVerificationError(null);
        
      const fileBuffer = await readFileAsBase64(acceptedFile[0]);
      const { data: uniqueCheck } = await axios.post("/api/imageHash/verify-image", {
        imageBuffer: fileBuffer,
      });
      console.log("Result of checking: ", uniqueCheck);
      
      if (!uniqueCheck.isUnique) {
        // Image is not unique - show error message
        if (uniqueCheck.duplicateType === 'exact') {
          setVerificationError(`This exact image has already been minted as an NFT.`);
          toast.error("This exact image has already been minted as an NFT!. Please Upload Another Image");
        } else {
          setVerificationError(`This image is ${Math.round(uniqueCheck.similarity * 100)}% similar to an existing NFT.`);
          toast.error(`This image is ${Math.round(uniqueCheck.similarity * 100)}% similar to an existing NFT.`);
        }
        setIsVerifying(false);
        return;
      }
      
      const url = await uploadToPinata(acceptedFile[0]);
      const ipfsHash = extractIPFSHash(url);
      
      const {data:result} = await axios.post("/api/imageHash/storeImageHash", {
        imageHash: uniqueCheck.imageHash, // CID or computed hash from API
        perceptualHash: uniqueCheck.perceptualHash,
        nftId: `temp_${Date.now()}`, // Temporary ID until NFT is fully created
        ipfsHash: ipfsHash,
      });
      console.log(result);
      toast.success("✅ Image uploaded successfully!");
      
      setFileUrl(url);
      setImage(url);
      console.log(url);
  } catch (error) {
      console.error("Error processing image:", error);
      setVerificationError("An error occurred while verifying the image. Please try again.");
  } finally {
      setIsVerifying(false);
  }
});




  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
    maxSize: 5000000,
  });


  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]); // Extract base64 content
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };


  
  return (
    <div className={Style.DropZone}>
      <div className={Style.DropZone_box} {...getRootProps()}>
        <input {...getInputProps()} />
        <div className={Style.DropZone_box_input}>
          <p>{title}</p>
          <div className={Style.DropZone_box_input_img}>
            <Image
              src={images.upload}
              alt="upload"
              width={100}
              height={100}
              objectFit="contain"
              className={Style.DropZone_box_input_img_img}
            />
          </div>
          <p>{heading}</p>
          <p>{subHeading}</p>

          {isVerifying && (
            <div className={Style.verifying_message}>
              <p>Verifying image uniqueness...</p>
              {/* You can add a spinner here */}
            </div>
          )}
          
          {verificationError && (
            <div className={Style.verification_error}>
              <p>{verificationError}</p>
            </div>
          )}
        </div>
      </div>

      {fileUrl && (
        <aside className={Style.DropZone_box_aside}>
          <div className={Style.DropZone_box_aside_box}>
            <img src={fileUrl} alt="nft image" width={200} height={200} />

            <div className={Style.DropZone_box_aside_box_preview}>
              <div className={Style.DropZone_box_aside_box_preview_one}>
                <p>
                  <samp>NFT Name:</samp>
                  {name || ""}
                </p>
                <p>
                  <samp>Website:</samp>
                  {website || ""}
                </p>
              </div>

              <div className={Style.DropZone_box_aside_box_preview_two}>
                <p>
                  <span>Description</span>
                  {description || ""}
                </p>
              </div>

              <div className={Style.DropZone_box_aside_box_preview_three}>
                <p>
                  <span>Royalties</span>
                  {royalties || ""}
                </p>
                <p>
                  <span>FileSize</span>
                  {fileSize || ""}
                </p>
                <p>
                  <span>Properties</span>
                  {properties || ""}
                </p>
                <p>
                  <span>Category</span>
                  {category || ""}
                </p>
                
                 {tags && tags.length > 0 && (
                    <p>
                      <span>Tags</span>
                      {tags.join(", ")}
                    </p>
                  )}
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};

export default DropZone;
