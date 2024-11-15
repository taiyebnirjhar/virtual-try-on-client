/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Clock, Download, Sparkles, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function VirtualTryOn() {
  const [humanImage, setHumanImage] = useState<string | null>(null);
  const [humanFile, setHumanFile] = useState<File | null>(null);
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
  const [garmentFile, setGarmentFile] = useState<File | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const convertUrlToFile = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new File([blob], fileName, { type: blob.type });
    } catch (error) {
      console.error("Error converting URL to File:", error);
      return null;
    }
  };
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleImageUpload = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.MouseEvent<HTMLDivElement>,
    setPreviewImage: (value: string | null) => void,
    setFile?: (value: File | null) => void
  ) => {
    if (event.type === "click") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) =>
        handleImageUpload(
          e as unknown as React.ChangeEvent<HTMLInputElement>,
          setPreviewImage,
          setFile
        );
      input.click();
      return;
    }

    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          "File size exceeds the limit of 10MB. Please choose a smaller file."
        );
        return;
      }

      setFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExampleClick = async (
    imageSrc: string,
    setPreviewImage: (value: string | null) => void,
    type?: "human" | "garment",
    setFile?: (value: File | null) => void
  ) => {
    const fileName = imageSrc.split("/").pop() || `${type}.png`;
    const file = await convertUrlToFile(imageSrc, fileName);
    if (file) {
      setFile(file);
      setPreviewImage(imageSrc);
    }
  };

  // const handleTryOn = async () => {
  //   if (humanFile && garmentFile) {
  //     setIsProcessing(true);
  //     setTimer(0);

  //     try {
  //       const formData = new FormData();
  //       formData.append("human", humanFile);
  //       formData.append("garment", garmentFile);

  //       const response = await fetch(
  //         "http://localhost:3050/api/virtual-tryon",
  //         {
  //           method: "POST",
  //           body: formData,
  //         }
  //       );

  //       const responseData = await response.json();

  //       console.log("Response data:", responseData);

  //       if (responseData?.success === false) {
  //         toast.error(responseData.error || "Error during virtual try-on");
  //         setIsProcessing(false);
  //         return;
  //       }
  //       const { data } = responseData;
  //       setOutputImage(data?.outputImage?.url);
  //       setIsProcessing(false);
  //     } catch (error) {
  //       console.error("Error during virtual try-on:", error);
  //       toast.error(error.error || "Error during virtual try-on");
  //       setIsProcessing(false);
  //     }
  //   }
  // };

  const handleTryOn = async () => {
    // Validate input files first
    if (!humanFile || !garmentFile) {
      toast.error("Please select both a human image and a garment image");
      return;
    }

    setIsProcessing(true);
    setTimer(0);

    try {
      const formData = new FormData();
      formData.append("human", humanFile);
      formData.append("garment", garmentFile);

      const response = await fetch("http://localhost:3050/api/virtual-tryon", {
        method: "POST",
        body: formData,
      });

      // Handle non-200 HTTP responses
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Response data:", responseData);

      // Handle specific error cases
      if (!responseData.success) {
        let errorMessage = "Error during virtual try-on";

        // Handle GPU quota exceeded error
        if (responseData.error?.includes("exceeded your GPU quota")) {
          const timeLeft = responseData.error.match(/\d+:\d+:\d+/)?.[0] || "";
          errorMessage = `GPU quota exceeded. Please try again in ${
            timeLeft || "a few minutes"
          }`;
        }
        // Handle other specific error cases
        else if (responseData.error) {
          errorMessage = responseData.error;
        }

        toast.error(errorMessage);
        setIsProcessing(false);
        return;
      }

      // Validate output data structure
      if (!responseData.data?.outputImage?.url) {
        throw new Error("Invalid response format: missing output image URL");
      }

      setOutputImage(responseData.data.outputImage.url);
      toast.success("Virtual try-on completed successfully!");
    } catch (error) {
      console.error("Error during virtual try-on:", error);

      // Handle different types of errors
      let errorMessage = "Error during virtual try-on";

      if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        errorMessage =
          "Unable to connect to the server. Please check your connection.";
      } else if (error.message.includes("HTTP error!")) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message.includes("Invalid response format")) {
        errorMessage = "Received invalid response from server.";
      }

      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = ({ outputImage }) => {
    if (!outputImage) return;

    // Open in new tab
    window.open(outputImage, "_blank");

    // Trigger automatic download
    const link = document.createElement("a");
    link.href = outputImage;
    link.download = "virtual-try-on-image.png";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exampleHumans = [
    "/assets/human/maleOne.png",
    "/assets/human/maleTwo.png",
    "/assets/human/femaleOne.png",
    "/assets/human/femaleTwo.png",
  ];
  const exampleGarments = [
    "/assets/garment/maleDressOne.png",
    "/assets/garment/maleDressTwo.png",
    "/assets/garment/femaleDressOne.png",
    "/assets/garment/femaleDressTwo.png",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-50">
          Virtual Try-On <Sparkles className="inline-block ml-2" />
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-gray-800 border-gray-700 text-gray-50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Human Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      className="mb-4 rounded-lg overflow-hidden cursor-pointer"
                      onClick={(e) =>
                        handleImageUpload(e, setHumanImage, setHumanFile)
                      }
                    >
                      {humanImage ? (
                        <img
                          src={humanImage}
                          alt="Uploaded human"
                          className="w-full min-h-48 h-auto  object-cover"
                        />
                      ) : (
                        <div className="w-full min-h-48 h-auto  bg-gray-700 flex items-center justify-center">
                          <Upload className="text-gray-500" />
                        </div>
                      )}
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to upload image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <input
                type="file"
                onChange={(e) =>
                  handleImageUpload(e, setHumanImage, setHumanFile)
                }
                className="mb-4 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
              />
              <div className="flex flex-wrap gap-3">
                {exampleHumans.map((src, index) => (
                  <motion.img
                    key={index}
                    src={src}
                    alt={`Example human ${index + 1}`}
                    className="w-auto h-24 object-cover cursor-pointer rounded-md"
                    onClick={() =>
                      handleExampleClick(
                        src,
                        setHumanImage,
                        "human",
                        setHumanFile
                      )
                    }
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 text-gray-50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Garment Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      className="mb-4 rounded-lg overflow-hidden cursor-pointer"
                      onClick={(e) =>
                        handleImageUpload(e, setGarmentImage, setGarmentFile)
                      }
                    >
                      {garmentImage ? (
                        <img
                          src={garmentImage}
                          alt="Uploaded garment"
                          className="w-full min-h-48 h-auto  object-cover"
                        />
                      ) : (
                        <div className="w-full min-h-48 h-auto  bg-gray-700 flex items-center justify-center">
                          <Upload className="text-gray-500" />
                        </div>
                      )}
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to upload image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <input
                type="file"
                onChange={(e) =>
                  handleImageUpload(e, setGarmentImage, setGarmentFile)
                }
                className="mb-4 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
              />
              <div className="flex flex-wrap gap-3">
                {exampleGarments.map((src, index) => (
                  <motion.img
                    key={index}
                    src={src}
                    alt={`Example garment ${index + 1}`}
                    className="w-auto h-24 object-cover cursor-pointer rounded-md"
                    onClick={() =>
                      handleExampleClick(
                        src,
                        setGarmentImage,
                        "garment",
                        setGarmentFile
                      )
                    }
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 text-gray-50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Output Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                className="mb-4 rounded-lg overflow-hidden"
                // whileHover={{ scale: 1.05 }}
                // transition={{ duration: 0.2 }}
              >
                {outputImage ? (
                  <img
                    src={outputImage}
                    alt="Output"
                    className="w-full min-h-48 h-auto  object-cover"
                  />
                ) : (
                  <div className="w-full min-h-48 h-auto  bg-gray-700 flex items-center justify-center">
                    {isProcessing ? (
                      <div className="text-center">
                        <Clock className="mx-auto text-gray-400 mb-2 animate-spin" />
                        <p className="text-gray-400">Processing... {timer}s</p>
                      </div>
                    ) : (
                      <p className="text-gray-400">Output will appear here</p>
                    )}
                  </div>
                )}
              </motion.div>
              {outputImage && (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleDownload({ outputImage: outputImage })}
                >
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <motion.div
          //   whileHover={{ scale: 1.05 }}
          //   whileTap={{ scale: 0.95 }}
          className="mt-8"
        >
          <Button
            onClick={handleTryOn}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg py-6 rounded-xl shadow-lg"
            disabled={!humanImage || !garmentImage || isProcessing}
          >
            {isProcessing ? "Processing..." : "Try On"}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
