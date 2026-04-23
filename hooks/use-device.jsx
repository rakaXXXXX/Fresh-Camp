// hooks/use-device.jsx (opsional)
import * as React from "react"

const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
}

export function useDevice() {
  const [device, setDevice] = React.useState('desktop')

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < BREAKPOINTS.MOBILE) {
        setDevice('mobile')
      } else if (width < BREAKPOINTS.TABLET) {
        setDevice('tablet')
      } else if (width < BREAKPOINTS.DESKTOP) {
        setDevice('laptop')
      } else {
        setDevice('desktop')
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
    isLaptop: device === 'laptop',
    device
  }
}