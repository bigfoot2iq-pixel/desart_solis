"use client";

import { useEffect, useState } from "react";

/**
 * True while the element with this id occupies the upper band of the viewport.
 *
 * The band — rather than the whole viewport — is what keeps a bar that belongs
 * to a section from popping up while the section is still only peeking in from
 * the bottom of the screen. The top edge is trimmed so the site header never
 * overlaps the section either.
 */
export function useSectionActive(id: string) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = document.getElementById(id);
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: "-15% 0px -50% 0px",
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [id]);

  return active;
}
