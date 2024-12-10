export const formatImageUrl = (imagePath?: string): string | undefined => {
    const BACKEND_URL = "https://appointment.sjhrc.in/hospital-api";
    if (!imagePath) return undefined;
  
    return (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
      ? imagePath
      : `${BACKEND_URL}/blogs/${imagePath
          .replace(/^uploads[\\/]/, "")
          .replace(/\\/g, "/")}`;
  };
  