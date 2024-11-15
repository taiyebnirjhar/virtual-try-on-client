import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "gpuQuotaTimeout";

// Helper function to parse HH:MM:SS format to total seconds
export const parseTimeToSeconds = (timeString) => {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

// Helper function to format seconds to HH:MM:SS
export const formatSecondsToTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
};

const GPUQuotaCountdown = () => {
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const checkTimeout = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;

      const { expiryTime } = JSON.parse(stored);
      const now = new Date().getTime();

      if (expiryTime > now) {
        const remainingSeconds = Math.ceil((expiryTime - now) / 1000);
        setCountdown(remainingSeconds);
        return true;
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setCountdown(null);
        return false;
      }
    };

    // Initial check
    checkTimeout();

    // Set up the interval to run every second
    const intervalId = setInterval(() => {
      checkTimeout();
    }, 1000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array since we don't need to track any dependencies

  // Don't render anything if there's no countdown
  if (!countdown) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>GPU Quota Exceeded</AlertTitle>
      <AlertDescription>
        Please wait {formatSecondsToTime(countdown)} before trying again
      </AlertDescription>
    </Alert>
  );
};

// Helper function to set the GPU quota timeout
export const setGPUTimeout = (timeString) => {
  const totalSeconds = parseTimeToSeconds(timeString);
  const expiryTime = new Date().getTime() + totalSeconds * 1000;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      expiryTime,
      duration: timeString,
    })
  );
};

export default GPUQuotaCountdown;
