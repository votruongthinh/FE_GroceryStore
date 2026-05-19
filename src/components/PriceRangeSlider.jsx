import React, { useCallback, useEffect, useRef } from "react";

const PriceRangeSlider = ({ min, max, minVal, maxVal, onChange }) => {
  const minValRef = useRef(minVal);
  const maxValRef = useRef(maxVal);
  const range = useRef(null);

  // Convert to percentage
  const getPercent = useCallback(
    (value) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  return (
    <div className="relative flex w-full items-center py-4">
      {/* Hidden range inputs for logic */}
      <input
        type="range"
        min={min}
        max={max}
        value={minVal}
        onChange={(event) => {
          const value = Math.min(Number(event.target.value), maxVal - 1);
          onChange({ min: value, max: maxVal });
          minValRef.current = value;
        }}
        className="pointer-events-none absolute z-[4] h-0 w-full appearance-none outline-none"
        style={{
          zIndex: minVal > max - 100 ? "5" : "4",
        }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={maxVal}
        onChange={(event) => {
          const value = Math.max(Number(event.target.value), minVal + 1);
          onChange({ min: minVal, max: value });
          maxValRef.current = value;
        }}
        className="pointer-events-none absolute z-[3] h-0 w-full appearance-none outline-none"
      />

      <div className="relative h-2 w-full rounded-full bg-gray-100">
        <div
          ref={range}
          className="absolute h-full rounded-full bg-primary"
        />
        <div
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-4 border-white bg-primary shadow-md"
          style={{ left: `${getPercent(minVal)}%`, marginLeft: "-10px" }}
        />
        <div
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-4 border-white bg-primary shadow-md"
          style={{ left: `${getPercent(maxVal)}%`, marginLeft: "-10px" }}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          -webkit-tap-highlight-color: transparent;
          pointer-events: all;
          width: 24px;
          height: 24px;
          border: 0 none;
          border-radius: 50%;
          cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          pointer-events: all;
          width: 24px;
          height: 24px;
          border: 0 none;
          border-radius: 50%;
          cursor: pointer;
        }
      `}} />
    </div>
  );
};

export default PriceRangeSlider;
