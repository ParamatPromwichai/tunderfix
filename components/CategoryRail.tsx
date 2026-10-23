"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  Cable,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Hammer,
  LayoutGrid,
  Monitor,
  Pause,
  Play,
  Smartphone,
  Wind,
  Wrench,
} from "lucide-react";

type Category = { id: string; name: string };
function categoryIcon(name: string) {
  if (/แอร์|เย็น/.test(name)) return Wind;
  if (/ไฟฟ้า/.test(name)) return Cable;
  if (/ประปา|น้ำ/.test(name)) return Droplets;
  if (/คอม|เครื่องปริ้น|เครื่องพิมพ์/.test(name)) return Monitor;
  if (/มือถือ|โทรศัพท์/.test(name)) return Smartphone;
  if (/ก่อสร้าง|ไม้/.test(name)) return Hammer;
  return Wrench;
}

export function CategoryRail({
  categories,
  selected,
  onSelect,
}: {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const id = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const group = useRef<HTMLDivElement>(null);
  const width = useRef(0);
  const hovered = useRef(false);
  const initialSelection = useRef(selected);
  const [paused, setPaused] = useState(false);
  const [canScroll, setCanScroll] = useState(false);
  const items = [{ id: "", name: "ทั้งหมด" }, ...categories];
  const itemKey = categories
    .map((category) => `${category.id}:${category.name}`)
    .join("|");

  useEffect(() => {
    initialSelection.current = selected;
  }, [selected]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const respectPreference = () => {
      if (preference.matches) setPaused(true);
    };
    respectPreference();
    preference.addEventListener("change", respectPreference);
    return () => preference.removeEventListener("change", respectPreference);
  }, []);

  useEffect(() => {
    const rail = viewport.current;
    const original = group.current;
    if (!rail || !original) return;
    let frame = 0;
    const measure = () => {
      const next = original.getBoundingClientRect().width;
      const scrollable = next > rail.clientWidth + 1;
      const changed = Math.abs(next - width.current) > 1;
      width.current = next;
      setCanScroll(scrollable);
      if (changed || !scrollable) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const active = Array.from(
            original.querySelectorAll<HTMLButtonElement>("button"),
          ).find(
            (button) => button.dataset.category === initialSelection.current,
          );
          const offset = active
            ? active.getBoundingClientRect().left -
              original.getBoundingClientRect().left
            : 0;
          rail.scrollLeft = scrollable
            ? next + Math.min(offset, next - rail.clientWidth)
            : 0;
        });
      }
    };
    const observer = new ResizeObserver(measure);
    observer.observe(original);
    observer.observe(rail);
    measure();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [itemKey]);

  useEffect(() => {
    if (paused || !canScroll) return;
    let frame = 0;
    let previous = 0;
    let fractional = 0;
    const move = (time: number) => {
      const rail = viewport.current;
      if (rail && previous && !document.hidden && !hovered.current) {
        fractional += Math.min(time - previous, 50) * 0.028;
        const pixels = Math.floor(fractional);
        fractional -= pixels;
        rail.scrollLeft += pixels;
        if (rail.scrollLeft >= width.current * 2)
          rail.scrollLeft -= width.current;
      }
      previous = time;
      frame = requestAnimationFrame(move);
    };
    frame = requestAnimationFrame(move);
    return () => cancelAnimationFrame(frame);
  }, [paused, canScroll]);

  function normalize() {
    const rail = viewport.current;
    if (!rail || !canScroll || !width.current) return;
    if (rail.scrollLeft < width.current * 0.25)
      rail.scrollLeft += width.current;
    else if (rail.scrollLeft >= width.current * 2)
      rail.scrollLeft -= width.current;
  }
  function scroll(direction: number) {
    setPaused(true);
    const rail = viewport.current;
    rail?.scrollBy({
      left: direction * Math.max(140, rail.clientWidth * 0.65),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  const chips = (copy: boolean) =>
    items.map((category) => {
      const Icon = category.id ? categoryIcon(category.name) : LayoutGrid;
      const content = (
        <>
          <Icon size={18} />
          <span>{category.name}</span>
        </>
      );
      const active = selected === category.id;
      return copy ? (
        <span
          key={category.id}
          className={`explore-category-chip ${active ? "is-selected" : ""}`}
          onClick={() => {
            setPaused(true);
            onSelect(category.id);
          }}
        >
          {content}
        </span>
      ) : (
        <button
          type="button"
          key={category.id}
          data-category={category.id}
          className={`explore-category-chip ${active ? "is-selected" : ""}`}
          aria-pressed={active}
          onClick={() => {
            setPaused(true);
            onSelect(category.id);
          }}
        >
          {content}
        </button>
      );
    });
  return (
    <section className="explore-categories" aria-labelledby={`${id}-heading`}>
      <div className="explore-category-heading">
        <h2 id={`${id}-heading`}>หมวดหมู่ช่าง</h2>
        <div className="explore-category-controls">
          <button
            type="button"
            disabled={!canScroll}
            aria-label="เลื่อนหมวดหมู่ไปทางซ้าย"
            title="เลื่อนไปทางซ้าย"
            aria-controls={id}
            onClick={() => scroll(-1)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            disabled={!canScroll}
            aria-pressed={paused}
            aria-label={
              paused ? "เล่นการเลื่อนหมวดหมู่" : "พักการเลื่อนหมวดหมู่"
            }
            title={paused ? "เล่นการเลื่อนหมวดหมู่" : "พักการเลื่อนหมวดหมู่"}
            aria-controls={id}
            onClick={() => setPaused(!paused)}
          >
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          <button
            type="button"
            disabled={!canScroll}
            aria-label="เลื่อนหมวดหมู่ไปทางขวา"
            title="เลื่อนไปทางขวา"
            aria-controls={id}
            onClick={() => scroll(1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div
        id={id}
        ref={viewport}
        className="explore-category-viewport"
        data-scrollable={canScroll}
        onScroll={normalize}
        onPointerDown={() => setPaused(true)}
        onWheel={() => setPaused(true)}
        onFocusCapture={() => setPaused(true)}
        onMouseEnter={() => {
          hovered.current = true;
        }}
        onMouseLeave={() => {
          hovered.current = false;
        }}
      >
        <div className="explore-category-track">
          <div
            className="explore-category-group explore-category-copy"
            aria-hidden="true"
          >
            {chips(true)}
          </div>
          <div
            ref={group}
            className="explore-category-group"
            role="group"
            aria-label="เลือกหมวดหมู่ช่าง"
          >
            {chips(false)}
          </div>
          <div
            className="explore-category-group explore-category-copy"
            aria-hidden="true"
          >
            {chips(true)}
          </div>
        </div>
      </div>
    </section>
  );
}
