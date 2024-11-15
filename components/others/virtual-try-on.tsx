/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Clock, Download, Sparkles, Upload } from "lucide-react";
import { useEffect, useState } from "react";

export default function VirtualTryOn() {
  const [humanImage, setHumanImage] = useState<string | null>(null);
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
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

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setImage: (value: string | null) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  //   const handleImageUpload = (
  //     event: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLDivElement>,
  //     setImage: (value: string | null) => void
  //   ) => {
  //     if (event.type === 'click') {
  //       const input = document.createElement('input');
  //       input.type = 'file';
  //       input.accept = 'image/*';
  //       input.onchange = (e) => handleImageUpload(e as React.ChangeEvent<HTMLInputElement>, setImage);
  //       input.click();
  //       return;
  //     }
  //     const file = (event.target as HTMLInputElement).files?.[0];
  //     if (file) {
  //       const reader = new FileReader();
  //       reader.onloadend = () => {
  //         setImage(reader.result as string);
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   };

  //   const handleImageClick = (setImage: (value: string | null) => void) => {
  //     const input = document.createElement('input')
  //     input.type = 'file'
  //     input.accept = 'image/*'
  //     input.onchange = (e) => handleImageUpload(e as React.ChangeEvent<HTMLInputElement>, setImage)
  //     input.click()
  //   }

  const handleExampleClick = (
    imageSrc: string,
    setImage: (value: string | null) => void
  ) => {
    setImage(imageSrc);
  };

  const handleTryOn = () => {
    if (humanImage && garmentImage) {
      setIsProcessing(true);
      setTimer(0);
      // Simulating API call
      setTimeout(() => {
        setOutputImage("/placeholder.svg?height=300&width=300");
        setIsProcessing(false);
      }, 3000);
    }
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
            <CardContent className="">
              <motion.div
                className="mb-4 rounded-lg overflow-hidden"
                // whileHover={{ scale: 1.05 }}
                // transition={{ duration: 0.2 }}
              >
                {humanImage ? (
                  <img
                    src={humanImage}
                    alt="Uploaded human"
                    className="w-full h-auto min-h-48  object-cover"
                  />
                ) : (
                  <div className="w-full h-auto min-h-48 bg-gray-700 flex items-center justify-center">
                    <Upload className="text-gray-500" />
                  </div>
                )}
              </motion.div>
              <input
                type="file"
                onChange={(e) => handleImageUpload(e, setHumanImage)}
                className="mb-4 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
              />
              <div className="flex flex-wrap gap-3 ">
                {exampleHumans.map((src, index) => (
                  <motion.img
                    key={index}
                    src={src}
                    alt={`Example human ${index + 1}`}
                    className="w-auto h-24 object-cover cursor-pointer rounded-md"
                    onClick={() => handleExampleClick(src, setHumanImage)}
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
              <motion.div
                className="mb-4 rounded-lg overflow-hidden"
                // whileHover={{ scale: 1.05 }}
                // transition={{ duration: 0.2 }}
              >
                {garmentImage ? (
                  <img
                    src={garmentImage}
                    alt="Uploaded garment"
                    className="w-full h-auto min-h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-auto min-h-48 bg-gray-700 flex items-center justify-center">
                    <Upload className="text-gray-500" />
                  </div>
                )}
              </motion.div>
              <input
                type="file"
                onChange={(e) => handleImageUpload(e, setGarmentImage)}
                className="mb-4 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
              />
              <div className="flex flex-wrap gap-3">
                {exampleGarments.map((src, index) => (
                  <motion.img
                    key={index}
                    src={src}
                    alt={`Example garment ${index + 1}`}
                    className="w-auto h-24 object-cover cursor-pointer rounded-md"
                    onClick={() => handleExampleClick(src, setGarmentImage)}
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
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {outputImage ? (
                  <img
                    src={outputImage}
                    alt="Output"
                    className="w-full h-auto min-h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-auto min-h-48 bg-gray-700 flex items-center justify-center">
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
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
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
