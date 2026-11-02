"use client";

import { useState, type KeyboardEvent } from "react";
import type { App } from "@/data/schema";
import { screenshotSrc, screenshotThumbLabel, stepIndex } from "@/lib/screenshot-gallery";

type ScreenshotGalleryProps = {
  slug: string;
  shots: App["screenshots"];
};

export function ScreenshotGallery({ slug, shots }: ScreenshotGalleryProps) {
  const [index, setIndex] = useState(0);
  if (shots.length === 0) return null;

  const current = shots[index]!;
  const multiple = shots.length > 1;

  const go = (delta: number) => {
    setIndex((currentIndex) => stepIndex(currentIndex, delta, shots.length));
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
    <div
      className="shot-gallery"
      tabIndex={0}
      role="group"
      aria-label="Screenshots"
      onKeyDown={onKeyDown}
    >
      <figure className="shot-featured">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={screenshotSrc(slug, current.file)} alt={current.alt} />
      </figure>
      {multiple ? (
        <>
          <div className="shot-nav" lang="en">
            <button type="button" className="shot-step" onClick={() => go(-1)}>
              Previous
            </button>
            <span className="shot-count" aria-live="polite">
              {index + 1} / {shots.length}
            </span>
            <button type="button" className="shot-step" onClick={() => go(1)}>
              Next
            </button>
          </div>
          <div className="shot-thumbs">
            {shots.map((shot, fileIndex) => (
              <button
                key={shot.file}
                type="button"
                className="shot-thumb"
                aria-pressed={fileIndex === index}
                aria-label={screenshotThumbLabel(fileIndex, shot.alt)}
                onClick={() => setIndex(fileIndex)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={screenshotSrc(slug, shot.file)} alt="" />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
