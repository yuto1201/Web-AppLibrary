"use client";

import { useState, type KeyboardEvent } from "react";
import { screenshotAlt, screenshotSrc, stepIndex } from "@/lib/screenshot-gallery";

type ScreenshotGalleryProps = {
  slug: string;
  name: string;
  files: string[];
};

export function ScreenshotGallery({ slug, name, files }: ScreenshotGalleryProps) {
  const [index, setIndex] = useState(0);
  if (files.length === 0) return null;

  const current = files[index]!;
  const multiple = files.length > 1;

  const go = (delta: number) => {
    setIndex((currentIndex) => stepIndex(currentIndex, delta, files.length));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!multiple) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
  };

  return (
    <div className="shot-gallery" tabIndex={0} onKeyDown={onKeyDown}>
      <figure className="shot-featured">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={screenshotSrc(slug, current)} alt={screenshotAlt(name, index)} />
      </figure>
      {multiple ? (
        <>
          <div className="shot-nav">
            <button type="button" className="shot-step" onClick={() => go(-1)}>
              Previous
            </button>
            <span className="shot-count" aria-live="polite">
              {index + 1} / {files.length}
            </span>
            <button type="button" className="shot-step" onClick={() => go(1)}>
              Next
            </button>
          </div>
          <div className="shot-thumbs">
            {files.map((file, fileIndex) => (
              <button
                key={file}
                type="button"
                className="shot-thumb"
                aria-pressed={fileIndex === index}
                aria-label={screenshotAlt(name, fileIndex)}
                onClick={() => setIndex(fileIndex)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={screenshotSrc(slug, file)} alt="" />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
