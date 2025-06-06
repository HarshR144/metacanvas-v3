import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import axios from "axios";
import { FiUpload } from "react-icons/fi";
import { BsImage } from "react-icons/bs";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import Style from "./GenerateNFT.module.css";
import { Button } from "../componentsindex";
import { NFTMarketplaceContext } from "../../Context/NFTMarketplaceContext";

const GenerateNFT = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [imageBuffer, setImageBuffer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("huggingface"); // Default to huggingface
  const [error, setError] = useState(null);
  const router = useRouter();
  const { currentAccount, uploadToPinata } = useContext(NFTMarketplaceContext);

  // Redirect if not logged in
  useEffect(() => {
    if (currentAccount === "") {
      router.push("/");
    }
  }, [currentAccount]);

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const generateImage = async () => {
    if (!prompt) {
      setError("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate-image`,
        {
          prompt,
          model,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.imageData) {
        setGeneratedImage(response.data.imageData);
        
        // Convert base64 to a buffer-like object for verification
        const base64Data = response.data.imageData.split(',')[1];
        setImageBuffer(base64Data);
      } else {
        setError("Failed to generate image");
      }
    } catch (err) {
      console.error("Error generating image:", err);
      setError(err.response?.data?.message || "Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = (e) => {
    setModel(e.target.value);
  };

  const handleContinue = async () => {
    if (!generatedImage) {
      setError("Please generate an image first");
      return;
    }

    setIsLoading(true);
    try {
      // Verify image uniqueness before proceeding
      const { data: uniqueCheck } = await axios.post("/api/imageHash/verify-image", {
        imageBuffer: imageBuffer,
      });
      
      if (!uniqueCheck.isUnique) {
        if (uniqueCheck.duplicateType === 'exact') {
          setError(`This exact image has already been minted as an NFT.`);
        } else {
          setError(`This image is ${Math.round(uniqueCheck.similarity * 100)}% similar to an existing NFT.`);
        }
        setIsLoading(false);
        return;
      }
      
      // Convert base64 to blob for uploading to Pinata
      const blob = await fetch(generatedImage).then(res => res.blob());
      
      // Create a File object from the blob
      const file = new File([blob], `generated-${Date.now()}.png`, { type: 'image/png' });
      
      // Upload to Pinata
      const ipfsUrl = await uploadToPinata(file);
      
      // Extract IPFS hash for storing in the database
      const ipfsHash = ipfsUrl.split('/').pop();
      
      // Store hash in database
      await axios.post("/api/imageHash/storeImageHash", {
        imageHash: uniqueCheck.imageHash,
        perceptualHash: uniqueCheck.perceptualHash,
        nftId: `temp_${Date.now()}`,
        ipfsHash: ipfsHash,
      });
      
      // Redirect to upload page with the IPFS URL
      router.push({
        pathname: "/uploadNFT",
        query: { generatedImageUrl: ipfsUrl },
      });
    } catch (err) {
      console.error("Error processing image:", err);
      setError("Error verifying or uploading image: " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={Style.generate_nft}>
      <div className={Style.generate_nft_container}>
        <h1>Generate NFT Image</h1>
        <p>
          Create unique NFT images using AI. Enter a prompt and our AI will generate an
          image based on your description.
        </p>

        <div className={Style.generate_nft_model_selection}>
          <label>Choose AI Model:</label>
          <select value={model} onChange={handleModelChange}>
            <option value="huggingface">Hugging Face</option>
            <option value="gemini">Gemini AI Flash 2.0</option>
          </select>
        </div>

        <div className={Style.generate_nft_prompt}>
          <label>Enter your prompt:</label>
          <textarea
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Describe the image you want to generate..."
            rows={4}
          />
        </div>

        <div className={Style.generate_nft_buttons}>
          <Button
            btnName={isLoading ? "Generating..." : "Generate Image"}
            handleClick={generateImage}
            disabled={isLoading}
            icon={isLoading ? <AiOutlineLoading3Quarters className={Style.spinner} /> : <BsImage />}
          />
        </div>

        {error && <div className={Style.generate_nft_error}>{error}</div>}

        {generatedImage && (
          <div className={Style.generate_nft_preview}>
            <h2>Generated Image</h2>
            <div className={Style.generate_nft_preview_image}>
              <Image
                src={generatedImage}
                alt="Generated NFT"
                width={400}
                height={400}
                layout="responsive"
              />
            </div>
            <Button
              btnName={isLoading ? "Processing..." : "Continue to Upload"}
              handleClick={handleContinue}
              disabled={isLoading}
              icon={<FiUpload />}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateNFT;