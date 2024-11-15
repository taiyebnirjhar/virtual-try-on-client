import { useEffect, useState } from "react";

export function useGradioApp(endpoint: string) {
  const [app, setApp] = useState<any>(null);
  const [isGradioLoading, setIsGradioLoading] = useState(true);
  const [gradioError, setGradioError] = useState<Error | null>(null);

  useEffect(() => {
    const connectToGradio = async () => {
      try {
        if (typeof window === "undefined") return;

        const gradioApp = await (window as any).gradio.client.connect(endpoint);
        setApp(gradioApp);
        setIsGradioLoading(false);
      } catch (err) {
        setGradioError(
          err instanceof Error ? err : new Error("Failed to connect to Gradio")
        );
        setIsGradioLoading(false);
      }
    };

    if ((window as any).gradio) {
      connectToGradio();
    }
  }, [endpoint]);

  return { app, isGradioLoading, gradioError };
}
