// client/src/components/ProductRotateViewer.jsx

import { useMemo, useRef, useState } from "react";

export default function ProductRotateViewer({ product, className = "" }) {
  const draggingRef = useRef(false);
  const startXRef = useRef(0);

  const mediaImages = useMemo(() => {
    const rotationImages = Array.isArray(product?.rotationImages)
      ? product.rotationImages.filter(Boolean)
      : [];

    const galleryImages = Array.isArray(product?.galleryImages)
      ? product.galleryImages.filter(Boolean)
      : [];

    const fallbackImages = [
      product?.mainImageUrl,
      product?.imageUrl,
      product?.image,
      "/logoshirt.png"
    ].filter(Boolean);

    const uniqueImages = [...rotationImages, ...galleryImages, ...fallbackImages].filter(
      (url, index, array) => url && array.indexOf(url) === index
    );

    return uniqueImages.length > 0 ? uniqueImages : ["/logoshirt.png"];
  }, [product]);

  const videoUrl = product?.videoUrl || product?.product_video_url || "";
  const [activeIndex, setActiveIndex] = useState(0);

  const currentImage = mediaImages[activeIndex] || "/logoshirt.png";
  const hasMultipleAngles = mediaImages.length > 1;

  function goNext() {
    if (!hasMultipleAngles) return;
    setActiveIndex((current) => (current + 1) % mediaImages.length);
  }

  function goPrev() {
    if (!hasMultipleAngles) return;
    setActiveIndex((current) => (current - 1 + mediaImages.length) % mediaImages.length);
  }

  function handlePointerDown(event) {
    if (!hasMultipleAngles) return;

    draggingRef.current = true;
    startXRef.current = event.clientX;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!draggingRef.current || !hasMultipleAngles) return;

    const diff = event.clientX - startXRef.current;

    if (Math.abs(diff) >= 35) {
      if (diff > 0) {
        goPrev();
      } else {
        goNext();
      }

      startXRef.current = event.clientX;
    }
  }

  function handlePointerUp(event) {
    draggingRef.current = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  return (
    <div className={`professional-product-viewer ${className}`}>
      <div
        className="professional-media-stage"
        role="button"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") goPrev();
          if (event.key === "ArrowRight") goNext();
        }}
      >
        {videoUrl && activeIndex === 0 ? (
          <video
            className="professional-main-media"
            src={videoUrl}
            poster={currentImage}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            className="professional-main-media"
            src={currentImage}
            alt={product?.name || "TeePoP product"}
            draggable="false"
          />
        )}

        {hasMultipleAngles && <div className="professional-media-badge">Drag / click angles</div>}
      </div>

      {hasMultipleAngles && (
        <div className="professional-media-controls">
          <button type="button" onClick={goPrev} aria-label="Previous image">
            ←
          </button>

          <div className="professional-thumbnails">
            {mediaImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className={index === activeIndex ? "active" : ""}
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1}`}
              >
                <img src={image} alt="" draggable="false" />
              </button>
            ))}
          </div>

          <button type="button" onClick={goNext} aria-label="Next image">
            →
          </button>
        </div>
      )}
    </div>
  );
}