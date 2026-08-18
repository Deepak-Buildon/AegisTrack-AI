import React, { useEffect, useRef, useState } from 'react';
import { Point2D } from '../../services/map/GeoProjectionService';

export interface PredictedRouteData {
  rank: number; // 1, 2, 3
  probability: number; // e.g. 0.67, 0.23, 0.10
  routeName: string;
  points: Point2D[];
  destinationName: string;
}

interface PredictionRouteLayerProps {
  predictions: PredictedRouteData[];
}

export const PredictionRouteLayer: React.FC<PredictionRouteLayerProps> = ({ predictions }) => {
  if (!predictions || predictions.length === 0) return null;

  // Filter top 3 predictions
  const topPredictions = predictions.slice(0, 3);

  const getStrokeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#0284c7'; // Bright Ocean Blue (Dashed)
      case 2:
        return '#10b981'; // Emerald Green (Dashed)
      case 3:
        return '#8b5cf6'; // Purple / Indigo (Dashed)
      default:
        return '#3b82f6';
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
      {/* SVG Dashed Paths Layer with Path Growth Tracing Animation */}
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        {topPredictions.map((pred) => {
          if (!pred.points || pred.points.length < 2) return null;

          const strokeColor = getStrokeColor(pred.rank);
          const strokeWidth = pred.rank === 1 ? 4.5 : 3.5;

          return (
            <AnimatedPathItem
              key={`pred-path-${pred.rank}`}
              pred={pred}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
            />
          );
        })}
      </svg>

      {/* Predictive Destination End Markers in RED POINT Indications */}
      {topPredictions.map((pred) => {
        if (!pred.points || pred.points.length === 0) return null;
        const lastPt = pred.points[pred.points.length - 1];
        const probPercent = Math.round(pred.probability * 100);

        return (
          <div
            key={`pred-node-${pred.rank}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-30 transition-all duration-700 ease-out"
            style={{ left: `${lastPt.x}%`, top: `${lastPt.y}%` }}
          >
            <div className="flex flex-col items-center group">
              {/* Destination Callout Tag */}
              <div
                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-black shadow-2xl border flex items-center gap-1.5 mb-1 whitespace-nowrap transition-transform group-hover:scale-110 ${
                  pred.rank === 1
                    ? 'bg-red-600 text-white border-red-300 ring-2 ring-red-500/50'
                    : pred.rank === 2
                    ? 'bg-rose-600 text-white border-rose-300'
                    : 'bg-red-800 text-white border-red-400'
                }`}
              >
                <span className="text-amber-300 font-extrabold">📍 DEST #{pred.rank}</span>
                <span>{pred.destinationName}</span>
                <span className="bg-black/40 px-1.5 py-0.5 rounded-lg font-black text-amber-200">
                  {probPercent}%
                </span>
              </div>

              {/* RED POINT INDICATION NODE */}
              <div className="relative flex items-center justify-center">
                {/* Outer Pulsing Red Ring */}
                <div className="absolute -inset-2 rounded-full bg-red-600/40 animate-ping" />
                
                {/* Solid Red Destination Dot */}
                <div className="w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-2xl flex items-center justify-center font-black text-[9px] text-white">
                  ●
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AnimatedPathItem: React.FC<{
  pred: PredictedRouteData;
  strokeColor: string;
  strokeWidth: number;
}> = ({ pred, strokeColor, strokeWidth }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [dashOffset, setDashOffset] = useState<number>(1000);
  const [totalLength, setTotalLength] = useState<number>(1000);

  const pathData = pred.points.reduce((acc, pt, index) => {
    return index === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  useEffect(() => {
    if (pathRef.current) {
      try {
        const len = pathRef.current.getTotalLength() || 100;
        setTotalLength(len);
        setDashOffset(len);

        const frame = requestAnimationFrame(() => {
          setTimeout(() => {
            setDashOffset(0);
          }, 80 * pred.rank);
        });

        return () => cancelAnimationFrame(frame);
      } catch (err) {
        setTotalLength(200);
        setDashOffset(0);
      }
    }
  }, [pathData, pred.rank]);

  const clipId = `clip-pred-${pred.rank}`;
  const filterId = `glow-filter-${pred.rank}`;

  return (
    <g>
      <defs>
        {/* SVG Blur Filter for Map Route Glow Effect */}
        <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <clipPath id={clipId}>
          {/* Solid line path that animates strokeDashoffset from totalLength to 0 to trace route outwards */}
          <path
            ref={pathRef}
            d={pathData}
            fill="none"
            stroke="#000"
            strokeWidth={15}
            strokeDasharray={totalLength}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transition: 'stroke-dashoffset 1.8s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
          />
        </clipPath>
      </defs>

      {/* Render the clipped prediction line so it traces out from vehicle */}
      <g clipPath={`url(#${clipId})`}>
        {/* Outer Pulsating Ambient Halo Glow */}
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth + 5}
          strokeOpacity={0.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${filterId})`}
          className="animate-route-glow"
          style={{ '--glow-color': strokeColor } as React.CSSProperties}
          vectorEffect="non-scaling-stroke"
        />

        {/* Medium Glow Line */}
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth + 2}
          strokeOpacity={0.85}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Dashed Animated Predictive Core Line */}
        <path
          d={pathData}
          fill="none"
          stroke="#ffffff"
          strokeWidth={strokeWidth - 1}
          strokeDasharray="6 4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-pulse"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </g>
  );
};
