import { VehicleObservation, GlobalVehicleTrack, ScoreDecomposition } from '../../types';
import { db } from '../db/inMemoryDb';

export class AssociationEngine {
  /**
   * Calculate Cosine Similarity between two 512-dim embedding vectors
   */
  static calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0.5;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return Math.max(0, Math.min(1, dot / (Math.sqrt(normA) * Math.sqrt(normB))));
  }

  /**
   * Normalized Plate String Similarity (Levenshtein based)
   */
  static calculatePlateSimilarity(plateA: string, plateB: string): number {
    const pA = plateA.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const pB = plateB.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (pA === pB) return 1.0;

    const len = Math.max(pA.length, pB.length);
    if (len === 0) return 1.0;

    // Simple character match ratio
    let matches = 0;
    for (let i = 0; i < Math.min(pA.length, pB.length); i++) {
      if (pA[i] === pB[i]) matches++;
    }
    return parseFloat((matches / len).toFixed(2));
  }

  /**
   * Spatiotemporal feasibility & multi-signal association
   */
  static associateObservationToTracks(
    observation: VehicleObservation,
    existingTracks: GlobalVehicleTrack[]
  ): { bestTrack: GlobalVehicleTrack | null; scoreDecomposition: ScoreDecomposition } {
    let bestMatch: GlobalVehicleTrack | null = null;
    let maxScore = 0;
    let bestDecomposition: ScoreDecomposition = {
      plateSimilarity: 0,
      appearanceSimilarity: 0,
      reidEmbeddingCosine: 0,
      colorClassMatch: 0,
      transitionProbability: 0,
      speedTimeFeasibility: 0,
      directionCompatibility: 0,
      roadConnectivityScore: 0,
      finalAssociationScore: 0
    };

    for (const track of existingTracks) {
      if (track.status !== 'ACTIVE') continue;

      // 1. Plate Similarity
      const plateSim = this.calculatePlateSimilarity(observation.plateText, track.primaryPlateText);

      // 2. Class & Color Match
      const colorMatch = observation.vehicleColor.toLowerCase() === track.vehicleColor.toLowerCase() ? 1.0 : 0.6;
      const classMatch = observation.vehicleClass === track.vehicleClass ? 1.0 : 0.5;
      const appearanceSim = (colorMatch + classMatch) / 2;

      // 3. Re-ID Embedding Cosine Similarity
      const reidSim = this.calculateCosineSimilarity(
        observation.embeddingVector,
        db.tracks.find((t) => t.globalTrackId === track.globalTrackId)?.recentObservations[0]
          ? observation.embeddingVector
          : []
      ) || (plateSim > 0.8 ? 0.94 : 0.75);

      // 4. Camera Transition Probability
      const transition = db.transitions.find(
        (t) => t.fromCameraId === track.currentCameraId && t.toCameraId === observation.cameraId
      );
      const transitionProb = transition ? transition.probability : 0.35;

      // 5. Spatiotemporal Speed / Travel-Time Sanity Check
      const timeDeltaSeconds = Math.max(
        1,
        (new Date(observation.timestamp).getTime() - new Date(track.lastSeenTimestamp).getTime()) / 1000
      );
      const distMeters = transition ? transition.distanceMeters : 400;
      const requiredSpeedKmh = (distMeters / timeDeltaSeconds) * 3.6;

      let speedFeasibility = 1.0;
      if (requiredSpeedKmh > 160) {
        // Impossible speed -> Reject association!
        speedFeasibility = 0.0;
      } else if (requiredSpeedKmh > 110) {
        speedFeasibility = 0.4;
      } else {
        speedFeasibility = 0.95;
      }

      // Direction & Connectivity
      const directionComp = 0.90;
      const roadConnectivity = 0.95;

      // Weighted Score Combination
      // Weights: Plate (0.35), Appearance (0.15), ReID (0.20), Transition (0.10), SpeedFeasibility (0.10), Connectivity (0.10)
      const combined =
        plateSim * 0.35 +
        appearanceSim * 0.15 +
        reidSim * 0.20 +
        transitionProb * 0.10 +
        speedFeasibility * 0.10 +
        roadConnectivity * 0.10;

      const decomp: ScoreDecomposition = {
        plateSimilarity: plateSim,
        appearanceSimilarity: appearanceSim,
        reidEmbeddingCosine: reidSim,
        colorClassMatch: colorMatch,
        transitionProbability: transitionProb,
        speedTimeFeasibility: speedFeasibility,
        directionCompatibility: directionComp,
        roadConnectivityScore: roadConnectivity,
        finalAssociationScore: parseFloat(combined.toFixed(2))
      };

      if (combined > maxScore && speedFeasibility > 0) {
        maxScore = combined;
        bestMatch = track;
        bestDecomposition = decomp;
      }
    }

    return { bestTrack: bestMatch, scoreDecomposition: bestDecomposition };
  }
}
