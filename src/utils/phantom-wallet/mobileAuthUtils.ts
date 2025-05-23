/**
 * Determines if the current device is a mobile device
 * Returns true only for actual mobile devices, not responsive desktop views
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  // Check specifically for mobile platform indicators
  const res = Boolean(
    navigator.userAgent.match(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
    ) &&
      // Additional check to exclude tablets and desktop browsers
      navigator.platform.match(/iPhone|iPod|iPad|Android/i),
  );

  console.log("IS MOBILE", res);
  return res;
};
