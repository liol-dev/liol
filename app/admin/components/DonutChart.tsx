"use client";

// ============================================================
// DONUT CHART — hand-rolled SVG, zero dependencies
// Renders proportional ring segments via stroke-dasharray on
// stacked <circle>s, with the total count in the center hole.
//
// How the math works:
//   C = 2πr is the ring's circumference. Each segment paints
//   `(value/total) * C` of the ring (minus a small visual gap)
//   and uses stroke-dashoffset to start where the previous
//   segment ended. The whole group is rotated -90° so segment
//   one starts at 12 o'clock instead of 3 o'clock.
//
// Scales to any number of segments — adding a 4th category is
// just one more entry in the data array.
// ============================================================

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  /** Label under the center number, e.g. "photos" */
  centerLabel?: string;
  /** Width classes — default scales up on 3xl displays since
      the SVG is pixel-locked and can't ride the root-font bump */
  className?: string;
}

const RADIUS = 80;
const STROKE = 24;
const GAP = 6; // px of circumference left empty between segments
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function DonutChart({
  data,
  centerLabel = "photos",
  className = "w-[190px] 3xl:w-[214px]",
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // Precompute each segment's painted length and start offset.
  // Guard: zero-total renders an empty track instead of NaN arcs.
  let runningStart = 0;
  const segments = data.map((d) => {
    const fullLength = total > 0 ? (d.value / total) * CIRCUMFERENCE : 0;
    const segment = {
      ...d,
      length: Math.max(fullLength - GAP, 0),
      start: runningStart + GAP / 2,
    };
    runningStart += fullLength;
    return segment;
  });

  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={`Donut chart: ${data
        .map((d) => `${d.label} ${d.value}`)
        .join(", ")}. Total ${total} ${centerLabel}.`}
      className={`max-w-full h-auto ${className}`}
    >
      {/* Faint full-ring track — keeps the shape readable even
          if a segment is tiny or the dataset is empty */}
      <circle
        cx="100" cy="100" r={RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={STROKE}
      />

      {/* Segments — rotated as a group to start at 12 o'clock */}
      <g transform="rotate(-90 100 100)">
        {segments.map((s) => (
          <circle
            key={s.label}
            cx="100" cy="100" r={RADIUS}
            fill="none"
            stroke={s.color}
            strokeWidth={STROKE}
            strokeDasharray={`${s.length} ${CIRCUMFERENCE - s.length}`}
            strokeDashoffset={-s.start}
            strokeLinecap="butt"
          />
        ))}
      </g>

      {/* Center total */}
      <text
        x="100" y="96"
        textAnchor="middle"
        className="fill-liol-text"
        fontSize="30"
        fontWeight="300"
      >
        {total}
      </text>
      <text
        x="100" y="118"
        textAnchor="middle"
        className="fill-liol-subtext"
        fontSize="12"
      >
        {centerLabel}
      </text>
    </svg>
  );
}
