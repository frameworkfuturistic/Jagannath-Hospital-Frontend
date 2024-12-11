
  

  export const formatImageUrl = (imagePath?: string): string | undefined => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_IMAGE_API_URL || "https://sjhrc.in/hospital-api";
  
    if (!imagePath) return undefined;
  
    return (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
      ? imagePath
      : `${BACKEND_URL}/blogs/${imagePath
          .replace(/^uploads[\\/]/, "")
          .replace(/\\/g, "/")}`;
  };
  