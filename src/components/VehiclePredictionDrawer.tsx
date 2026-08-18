import React, { useState, useEffect } from 'react';
import { GlobalVehicleTrack, EnsemblePrediction, UserRole } from '../types';
import { TrafficSparkline } from './map/TrafficSparkline';
import {
  X,
  Navigation,
  Compass,
  CheckCircle2,
  Clock,
  Zap,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Layers,
  FileCheck,
  Activity
} from 'lucide-react';

interface VehiclePredictionDrawerProps {
  selectedVehicleId: string | null;
  tracks: GlobalVehicleTrack[];
  onClose: () => void;
  userRole: UserRole;
  isEcoTheme: boolean;
}

export const VehiclePredictionDrawer: React.FC<VehiclePredictionDrawerProps> = ({
  selectedVehicleId,
  tracks,
  onClose,
  userRole,
  isEcoTheme
}) => {
  const [predictionData, setPredictionData] = useState<EnsemblePrediction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const activeTrack = tracks.find((t) => t.globalTrackId === selectedVehicleId) || tracks[0];

  useEffect(() => {
    if (!activeTrack) return;
    setLoading(true);
    fetch(`/api/v1/predictions/${activeTrack.globalTrackId}`)
      .then((res) => res.json())
      .then((data) => {
        setPredictionData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching prediction drawer data:', err);
        setLoading(false);
      });
  }, [selectedVehicleId, activeTrack]);

  if (!selectedVehicleId || !activeTrack) return null;

  return (
    <div className={`absolute top-20 right-4 z-40 w-96 max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl border shadow-2xl p-5 space-y-4 backdrop-blur-md transition-all ${
      isEcoTheme
        ? 'bg-white/95 border-[#DDEBE4] text-[#16322A]'
        : 'bg-slate-900/95 border-slate-800 text-slate-100'
    }`}>
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-[#E8F7EF] dark:bg-emerald-950 text-[#168A5B] dark:text-emerald-300 border border-[#18A66A]/30">
            <Navigation className="w-4 h-4" />
          </span>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">VEHICLE TRACK TARGET</div>
            <div className="text-base font-bold font-mono text-amber-500">{activeTrack.primaryPlateText}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Target Specs Summary Card */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-slate-400">Class:</span> <strong className="text-slate-800 dark:text-white uppercase">{activeTrack.vehicleClass}</strong>
          </div>
          <div>
            <span className="text-slate-400">Make/Model:</span> <strong className="text-slate-800 dark:text-white">{activeTrack.makeModel}</strong>
          </div>
          <div>
            <span className="text-slate-400">Speed:</span> <strong className="text-emerald-600 dark:text-emerald-400">{activeTrack.currentLocationEstimate.speedKmh} km/h</strong>
          </div>
          <div>
            <span className="text-slate-400">Heading:</span> <strong className="text-cyan-600 dark:text-cyan-400">{activeTrack.currentLocationEstimate.headingDegrees}°</strong>
          </div>
        </div>

        {/* ALPR & Re-ID Cosine Metric */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Re-ID Cosine Match:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
            {(activeTrack.scoreDecomposition.reidEmbeddingCosine * 100).toFixed(1)}% (Rank 1)
          </span>
        </div>
      </div>

      {/* AI Top 3 Ensemble Predictions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#168A5B] dark:text-emerald-400 flex items-center gap-1.5">
            <Compass className="w-4 h-4" />
            Top-3 Calibrated Route Predictions
          </h4>
          <span className="text-[10px] font-mono bg-[#E8F7EF] dark:bg-emerald-950 text-[#168A5B] dark:text-emerald-300 font-bold px-2 py-0.5 rounded border border-[#18A66A]/30">
            SOFTMAX T=1.2
          </span>
        </div>

        {loading ? (
          <div className="p-6 text-center font-mono text-xs text-slate-400 animate-pulse">
            Executing Ensemble Route Predictor...
          </div>
        ) : predictionData && predictionData.topPredictions ? (
          <div className="space-y-2.5">
            {predictionData.topPredictions.map((cand) => (
              <div
                key={cand.rank}
                className={`p-3.5 rounded-xl border transition-all space-y-2 font-mono text-xs ${
                  cand.rank === 1
                    ? 'bg-gradient-to-r from-[#E8F7EF] to-white dark:from-emerald-950/80 dark:to-slate-950 border-[#18A66A] shadow-md ring-1 ring-[#18A66A]/40'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        cand.rank === 1
                          ? 'bg-[#168A5B] text-white'
                          : 'bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      #{cand.rank}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{cand.roadSegmentName}</span>
                  </div>
                  <span className="text-sm font-black text-[#168A5B] dark:text-emerald-400">
                    {(cand.probability * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Target Jct: {cand.nextIntersectionName}</span>
                  <span>ETA: {cand.etaSecondsRange[0]}s - {cand.etaSecondsRange[1]}s</span>
                </div>

                {/* Congestion Sparkline Section */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-cyan-500" />
                    TRAFFIC CONGESTION:
                  </span>
                  <TrafficSparkline rank={cand.rank} showDetails={true} />
                </div>

                {/* Explainable AI Evidence Tags */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 space-y-1">
                  <div className="text-[10px] uppercase text-slate-400">Explainable Evidence Signals:</div>
                  <div className="flex flex-wrap gap-1">
                    {cand.evidenceExplanations.map((exp, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        ✓ {exp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-xs font-mono text-slate-400">No predictions available.</div>
        )}
      </div>

      {/* RBAC Compliance Footnote */}
      <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 text-[10px] font-mono text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
        <FileCheck className="w-4 h-4 flex-shrink-0 text-indigo-500" />
        <span>Vehicle track search and prediction logged under RBAC role {userRole}.</span>
      </div>
    </div>
  );
};
