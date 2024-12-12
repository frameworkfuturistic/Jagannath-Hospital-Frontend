
  

  export const formatImageUrl = (imagePath?: string): string | undefined => {
    const BACKEND_URL = "http://sjhrc.in/hospital-api";
  
    if (!imagePath) return undefined;
  
    return (imagePath.startsWith("http://"))
      ? imagePath
      : `${BACKEND_URL}/blogs/${imagePath
          .replace(/^uploads[\\/]/, "")
          .replace(/\\/g, "/")}`;
  };
  