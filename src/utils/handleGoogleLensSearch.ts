export const handleGoogleLensSearch = (
  event: React.MouseEvent,
  imageUrl: string | undefined,
) => {
  event.preventDefault();
  event.stopPropagation();
  if (!imageUrl) return;

  window.open(
    `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`,
    "_blank",
  );
};
