
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);
  const [windowWidth, setWindowWidth] = React.useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < MOBILE_BREAKPOINT);
    };
    
    // Handle resize events
    window.addEventListener("resize", handleResize);
    
    // Set initial value
    handleResize();
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    isMobile: !!isMobile,
    windowWidth,
    isTablet: windowWidth >= MOBILE_BREAKPOINT && windowWidth < 1024,
    isDesktop: windowWidth >= 1024,
  };
}
