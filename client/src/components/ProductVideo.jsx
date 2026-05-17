// client/src/components/ProductVideo.jsx

import { useState } from "react";

export default function ProductVideo({ product, className = "" }) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const videoUrl = product?.videoUrl || product?.product_video_url || "";
  const gifUrl = product?.gifUrl || product?.gif_url || "";
  const imageUrl = product?.mainImageUrl || product?.image || "/logoshirt.png";

  if (videoUrl && !videoFailed) {
    return (
      <video
        className={className}
        src={videoUrl}
        poster={imageUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onError={() => setVideoFailed(true)}
        aria-label={product?.name || "TeePoP product video"}
      />
    );
  }

  if (gifUrl) {
    return (
      <img
        className={className}
        src={gifUrl}
        alt={product?.name || "TeePoP product preview"}
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <img
      className={className}
      src={imageFailed ? "/logoshirt.png" : imageUrl}
      alt={product?.name || "TeePoP product"}
      loading="lazy"
      onError={() => setImageFailed(true)}
    />
  );
}
