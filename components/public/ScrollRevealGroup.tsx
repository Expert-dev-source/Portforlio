"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ScrollRevealGroupProps = {
  children: ReactNode;
  className?: string;
  itemSelector: string;
};

export function ScrollRevealGroup({
  children,
  className,
  itemSelector,
}: ScrollRevealGroupProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;

    let cancelled = false;
    let revertMatchMedia: (() => void) | undefined;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([gsapModule, scrollTriggerModule]) => {
        const element = root.current;
        if (cancelled || !element) return;

        const { gsap } = gsapModule;
        const { ScrollTrigger } = scrollTriggerModule;
        gsap.registerPlugin(ScrollTrigger);

        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => {
          const items = Array.from(element.querySelectorAll<HTMLElement>(itemSelector));
          if (!items.length) return;

          gsap.fromTo(
            items,
            { autoAlpha: 0, y: 14 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: "power2.out",
              clearProps: "opacity,visibility,transform",
              scrollTrigger: {
                trigger: element,
                start: "top 88%",
                once: true,
              },
            },
          );
        });

        revertMatchMedia = () => media.revert();
      })
      .catch(() => {
        // Content stays visible and usable if GSAP cannot load.
      });

    return () => {
      cancelled = true;
      revertMatchMedia?.();
    };
  }, [itemSelector]);

  return (
    <div className={className} ref={root}>
      {children}
    </div>
  );
}
