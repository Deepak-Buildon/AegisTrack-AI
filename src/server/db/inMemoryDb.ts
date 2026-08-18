import {
  Camera,
  RoadNode,
  RoadEdge,
  TransitionProbability,
  GlobalVehicleTrack,
  VehicleObservation,
  AlertRule,
  AlertEvent,
  AuditLog,
  ModelVersion,
  SystemMetrics,
  User
} from '../../types';

// Helper to generate normalized 512-dim embedding
function generateEmbedding(seed: number): number[] {
  const vec: number[] = [];
  let norm = 0;
  for (let i = 0; i < 512; i++) {
    const val = Math.sin(seed * (i + 1) * 0.1234) + Math.cos(seed * 0.5);
    vec.push(val);
    norm += val * val;
  }
  norm = Math.sqrt(norm);
  return vec.map((v) => v / norm);
}

// Metro City Center Coordinates (Centered around Downtown Metro Area)
// Lat: 37.7749, Lng: -122.4194
export const INITIAL_USERS: User[] = [
  {
    id: 'USR-101',
    name: 'Command Director Marcus Vance',
    email: 'm.vance@security.metro.gov',
    role: 'SUPER_ADMIN',
    department: 'Metropolitan Traffic & Security Directorate',
    badgeNumber: 'DIR-8840'
  },
  {
    id: 'USR-102',
    name: 'Officer Elena Rostova',
    email: 'e.rostova@security.metro.gov',
    role: 'OPERATOR',
    department: 'Live Operations Center',
    badgeNumber: 'OP-4491'
  },
  {
    id: 'USR-103',
    name: 'Dr. Aris Thorne',
    email: 'a.thorne@ai.metro.gov',
    role: 'ANALYST',
    department: 'AI Systems & Analytics Lab',
    badgeNumber: 'AI-2094'
  },
  {
    id: 'USR-104',
    name: 'Auditor Sarah Jenkins',
    email: 's.jenkins@audit.metro.gov',
    role: 'AUDITOR',
    department: 'Internal Privacy & Compliance Oversight',
    badgeNumber: 'AUD-0012'
  }
];

export const INITIAL_ROAD_NODES: RoadNode[] = [
  { id: 'NODE-01', name: 'Grand Ave & 1st St Junction', latitude: 37.7750, longitude: -122.4220, intersectionType: '4_WAY' },
  { id: 'NODE-02', name: 'Grand Ave & Market St Intersection', latitude: 37.7752, longitude: -122.4180, intersectionType: '4_WAY' },
  { id: 'NODE-03', name: 'Grand Ave & Harbor Blvd Flyover', latitude: 37.7755, longitude: -122.4140, intersectionType: 'HIGHWAY_RAMP' },
  { id: 'NODE-04', name: 'Market St & 5th Ave Cross', latitude: 37.7720, longitude: -122.4182, intersectionType: '4_WAY' },
  { id: 'NODE-05', name: 'Harbor Blvd & Tech Way', latitude: 37.7725, longitude: -122.4138, intersectionType: 'T_JUNCTION' },
  { id: 'NODE-06', name: 'Central Plaza Roundabout', latitude: 37.7780, longitude: -122.4185, intersectionType: 'ROUNDABOUT' },
  { id: 'NODE-07', name: 'Westside Expressway Ramp 3', latitude: 37.7710, longitude: -122.4225, intersectionType: 'HIGHWAY_RAMP' },
  { id: 'NODE-08', name: 'Financial District Gateway Jct', latitude: 37.7785, longitude: -122.4142, intersectionType: '4_WAY' }
];

export const INITIAL_ROAD_EDGES: RoadEdge[] = [
  { id: 'ROAD-101', name: 'Grand Avenue Eastbound', startNodeId: 'NODE-01', endNodeId: 'NODE-02', lengthMeters: 400, speedLimitKmh: 50, lanes: 3, roadType: 'ARTERIAL', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 48, trafficWeightMultiplier: 1.0 },
  { id: 'ROAD-102', name: 'Grand Avenue Westbound', startNodeId: 'NODE-02', endNodeId: 'NODE-01', lengthMeters: 400, speedLimitKmh: 50, lanes: 3, roadType: 'ARTERIAL', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 46, trafficWeightMultiplier: 1.0 },
  { id: 'ROAD-103', name: 'Grand Avenue Flyover East', startNodeId: 'NODE-02', endNodeId: 'NODE-03', lengthMeters: 450, speedLimitKmh: 60, lanes: 2, roadType: 'ARTERIAL', currentTrafficState: 'MODERATE', currentAvgSpeedKmh: 42, trafficWeightMultiplier: 1.25 },
  { id: 'ROAD-104', name: 'Market Street Southbound', startNodeId: 'NODE-02', endNodeId: 'NODE-04', lengthMeters: 380, speedLimitKmh: 45, lanes: 2, roadType: 'ARTERIAL', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 44, trafficWeightMultiplier: 1.0 },
  { id: 'ROAD-105', name: 'Market Street Northbound', startNodeId: 'NODE-04', endNodeId: 'NODE-02', lengthMeters: 380, speedLimitKmh: 45, lanes: 2, roadType: 'ARTERIAL', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 43, trafficWeightMultiplier: 1.0 },
  { id: 'ROAD-106', name: 'Harbor Boulevard South', startNodeId: 'NODE-03', endNodeId: 'NODE-05', lengthMeters: 420, speedLimitKmh: 60, lanes: 3, roadType: 'HIGHWAY', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 58, trafficWeightMultiplier: 1.0 },
  { id: 'ROAD-107', name: 'Market-Harbor Connector East', startNodeId: 'NODE-04', endNodeId: 'NODE-05', lengthMeters: 390, speedLimitKmh: 45, lanes: 2, roadType: 'ARTERIAL', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 42, trafficWeightMultiplier: 1.0 },
  { id: 'ROAD-108', name: 'Central Plaza Connector North', startNodeId: 'NODE-02', endNodeId: 'NODE-06', lengthMeters: 320, speedLimitKmh: 40, lanes: 2, roadType: 'ARTERIAL', currentTrafficState: 'MODERATE', currentAvgSpeedKmh: 32, trafficWeightMultiplier: 1.3 },
  { id: 'ROAD-109', name: '1st St Southbound Connector', startNodeId: 'NODE-01', endNodeId: 'NODE-07', lengthMeters: 460, speedLimitKmh: 50, lanes: 2, roadType: 'ARTERIAL', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 49, trafficWeightMultiplier: 1.0 },
  { id: 'ROAD-110', name: 'Central Plaza - Financial Arterial', startNodeId: 'NODE-06', endNodeId: 'NODE-08', lengthMeters: 380, speedLimitKmh: 50, lanes: 3, roadType: 'ARTERIAL', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 47, trafficWeightMultiplier: 1.0 },
  { id: 'ROAD-111', name: 'Financial District Harbor Loop', startNodeId: 'NODE-08', endNodeId: 'NODE-03', lengthMeters: 340, speedLimitKmh: 45, lanes: 2, roadType: 'ARTERIAL', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 44, trafficWeightMultiplier: 1.0 },
  { id: 'ROAD-112', name: 'Westside Expressway Link East', startNodeId: 'NODE-07', endNodeId: 'NODE-04', lengthMeters: 410, speedLimitKmh: 65, lanes: 3, roadType: 'HIGHWAY', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 62, trafficWeightMultiplier: 1.0 }
];

export const INITIAL_CAMERAS: Camera[] = [
  {
    id: 'CAM-101',
    name: 'CCTV 101 - Grand Ave & 1st St',
    locationName: 'Grand Ave & 1st St Crossing (Northbound View)',
    latitude: 37.7750,
    longitude: -122.4220,
    roadSegmentId: 'ROAD-101',
    intersectionId: 'NODE-01',
    status: 'ONLINE',
    fps: 30,
    lanes: 3,
    calibration: {
      orientationDegrees: 90,
      fieldOfViewDegrees: 85,
      mountingHeightMeters: 6.5,
      tiltAngleDegrees: 25,
      homographyMatrix: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
    },
    ipAddress: '192.168.10.101',
    streamUrl: 'rtsp://camera101.metro.gov/live/h264',
    lastActive: new Date().toISOString()
  },
  {
    id: 'CAM-102',
    name: 'CCTV 102 - Grand Ave & Market St',
    locationName: 'Grand Ave & Market St Central Junction',
    latitude: 37.7752,
    longitude: -122.4180,
    roadSegmentId: 'ROAD-101',
    intersectionId: 'NODE-02',
    status: 'ONLINE',
    fps: 30,
    lanes: 3,
    calibration: {
      orientationDegrees: 90,
      fieldOfViewDegrees: 90,
      mountingHeightMeters: 7.0,
      tiltAngleDegrees: 20,
      homographyMatrix: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
    },
    ipAddress: '192.168.10.102',
    streamUrl: 'rtsp://camera102.metro.gov/live/h264',
    lastActive: new Date().toISOString()
  },
  {
    id: 'CAM-103',
    name: 'CCTV 103 - Grand Flyover East',
    locationName: 'Grand Ave Flyover Ramp (Eastbound)',
    latitude: 37.7754,
    longitude: -122.4150,
    roadSegmentId: 'ROAD-103',
    intersectionId: 'NODE-03',
    status: 'ONLINE',
    fps: 30,
    lanes: 2,
    calibration: {
      orientationDegrees: 80,
      fieldOfViewDegrees: 75,
      mountingHeightMeters: 8.0,
      tiltAngleDegrees: 30,
      homographyMatrix: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
    },
    ipAddress: '192.168.10.103',
    streamUrl: 'rtsp://camera103.metro.gov/live/h264',
    lastActive: new Date().toISOString()
  },
  {
    id: 'CAM-104',
    name: 'CCTV 104 - Market St & 5th Ave',
    locationName: 'Market St & 5th Ave Intersection',
    latitude: 37.7720,
    longitude: -122.4182,
    roadSegmentId: 'ROAD-104',
    intersectionId: 'NODE-04',
    status: 'ONLINE',
    fps: 30,
    lanes: 2,
    calibration: {
      orientationDegrees: 180,
      fieldOfViewDegrees: 80,
      mountingHeightMeters: 6.0,
      tiltAngleDegrees: 22,
      homographyMatrix: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
    },
    ipAddress: '192.168.10.104',
    streamUrl: 'rtsp://camera104.metro.gov/live/h264',
    lastActive: new Date().toISOString()
  },
  {
    id: 'CAM-105',
    name: 'CCTV 105 - Harbor Blvd South',
    locationName: 'Harbor Blvd Corridor South',
    latitude: 37.7725,
    longitude: -122.4138,
    roadSegmentId: 'ROAD-106',
    intersectionId: 'NODE-05',
    status: 'ONLINE',
    fps: 30,
    lanes: 3,
    calibration: {
      orientationDegrees: 160,
      fieldOfViewDegrees: 85,
      mountingHeightMeters: 7.5,
      tiltAngleDegrees: 28,
      homographyMatrix: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
    },
    ipAddress: '192.168.10.105',
    streamUrl: 'rtsp://camera105.metro.gov/live/h264',
    lastActive: new Date().toISOString()
  },
  {
    id: 'CAM-106',
    name: 'CCTV 106 - Central Plaza Roundabout',
    locationName: 'Central Plaza Circle View East',
    latitude: 37.7780,
    longitude: -122.4185,
    roadSegmentId: 'ROAD-108',
    intersectionId: 'NODE-06',
    status: 'ONLINE',
    fps: 30,
    lanes: 2,
    calibration: {
      orientationDegrees: 0,
      fieldOfViewDegrees: 110,
      mountingHeightMeters: 9.0,
      tiltAngleDegrees: 35,
      homographyMatrix: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
    },
    ipAddress: '192.168.10.106',
    streamUrl: 'rtsp://camera106.metro.gov/live/h264',
    lastActive: new Date().toISOString()
  },
  {
    id: 'CAM-107',
    name: 'CCTV 107 - Financial Gateway',
    locationName: 'Financial District North Portal',
    latitude: 37.7785,
    longitude: -122.4142,
    roadSegmentId: 'ROAD-110',
    intersectionId: 'NODE-08',
    status: 'ONLINE',
    fps: 30,
    lanes: 3,
    calibration: {
      orientationDegrees: 45,
      fieldOfViewDegrees: 80,
      mountingHeightMeters: 6.8,
      tiltAngleDegrees: 20,
      homographyMatrix: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
    },
    ipAddress: '192.168.10.107',
    streamUrl: 'rtsp://camera107.metro.gov/live/h264',
    lastActive: new Date().toISOString()
  },
  {
    id: 'CAM-108',
    name: 'CCTV 108 - Westside Ramp 3',
    locationName: 'Expressway Ramp Entry West',
    latitude: 37.7710,
    longitude: -122.4225,
    roadSegmentId: 'ROAD-109',
    intersectionId: 'NODE-07',
    status: 'ONLINE',
    fps: 30,
    lanes: 3,
    calibration: {
      orientationDegrees: 220,
      fieldOfViewDegrees: 85,
      mountingHeightMeters: 7.2,
      tiltAngleDegrees: 25,
      homographyMatrix: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
    },
    ipAddress: '192.168.10.108',
    streamUrl: 'rtsp://camera108.metro.gov/live/h264',
    lastActive: new Date().toISOString()
  }
];

export const INITIAL_TRANSITION_PROBABILITIES: TransitionProbability[] = [
  { fromCameraId: 'CAM-101', toCameraId: 'CAM-102', probability: 0.68, avgTravelTimeSeconds: 32, stdDevSeconds: 4.5, distanceMeters: 400 },
  { fromCameraId: 'CAM-101', toCameraId: 'CAM-108', probability: 0.24, avgTravelTimeSeconds: 38, stdDevSeconds: 5.0, distanceMeters: 460 },
  { fromCameraId: 'CAM-101', toCameraId: 'CAM-104', probability: 0.08, avgTravelTimeSeconds: 65, stdDevSeconds: 8.0, distanceMeters: 780 },
  
  { fromCameraId: 'CAM-102', toCameraId: 'CAM-103', probability: 0.48, avgTravelTimeSeconds: 36, stdDevSeconds: 4.0, distanceMeters: 450 },
  { fromCameraId: 'CAM-102', toCameraId: 'CAM-104', probability: 0.31, avgTravelTimeSeconds: 31, stdDevSeconds: 3.8, distanceMeters: 380 },
  { fromCameraId: 'CAM-102', toCameraId: 'CAM-106', probability: 0.21, avgTravelTimeSeconds: 29, stdDevSeconds: 3.5, distanceMeters: 320 },

  { fromCameraId: 'CAM-103', toCameraId: 'CAM-105', probability: 0.72, avgTravelTimeSeconds: 34, stdDevSeconds: 4.2, distanceMeters: 420 },
  { fromCameraId: 'CAM-103', toCameraId: 'CAM-107', probability: 0.28, avgTravelTimeSeconds: 28, stdDevSeconds: 3.0, distanceMeters: 340 },

  { fromCameraId: 'CAM-104', toCameraId: 'CAM-105', probability: 0.58, avgTravelTimeSeconds: 33, stdDevSeconds: 4.0, distanceMeters: 390 },
  { fromCameraId: 'CAM-104', toCameraId: 'CAM-108', probability: 0.42, avgTravelTimeSeconds: 35, stdDevSeconds: 4.8, distanceMeters: 410 },

  { fromCameraId: 'CAM-106', toCameraId: 'CAM-107', probability: 0.79, avgTravelTimeSeconds: 30, stdDevSeconds: 3.2, distanceMeters: 380 },
  { fromCameraId: 'CAM-106', toCameraId: 'CAM-102', probability: 0.21, avgTravelTimeSeconds: 32, stdDevSeconds: 4.0, distanceMeters: 320 }
];

export const INITIAL_MODEL_VERSIONS: ModelVersion[] = [
  {
    id: 'MOD-V3.4.1',
    name: 'AegisTrack Spatiotemporal Ensemble Model',
    version: 'v3.4.1-prod',
    architecture: 'XGBoost + Bayesian Transition Graph + Softmax Calibrator',
    trainingDataset: 'Metro-Traffic-Traj-2026-Q2 (2.4M trajectories, 120 camera nodes)',
    trainedAt: '2026-07-15T10:00:00Z',
    deployedAt: '2026-07-20T14:30:00Z',
    status: 'ACTIVE_PRODUCTION',
    metrics: {
      top1Accuracy: 0.714,
      top2Accuracy: 0.892,
      top3Accuracy: 0.965,
      mrr: 0.824,
      brierScore: 0.076,
      ece: 0.018,
      mota: 0.884,
      idf1: 0.891,
      hota: 0.798,
      ocrPlateAccuracy: 0.982,
      reidRank1: 0.924,
      reidRank5: 0.981,
      avgInferenceLatencyMs: 18.5
    },
    calibrationCurve: [
      { confidenceBin: 0.1, observedAccuracy: 0.098 },
      { confidenceBin: 0.3, observedAccuracy: 0.295 },
      { confidenceBin: 0.5, observedAccuracy: 0.504 },
      { confidenceBin: 0.7, observedAccuracy: 0.698 },
      { confidenceBin: 0.9, observedAccuracy: 0.902 }
    ]
  },
  {
    id: 'MOD-V4.0-RC1',
    name: 'Temporal Transformer Graph Net',
    version: 'v4.0.0-canary',
    architecture: 'Spatio-Temporal Graph Neural Network (ST-GNN) + Multi-Head Self-Attention',
    trainingDataset: 'Metro-Traffic-Traj-2026-Full (5.1M trajectories)',
    trainedAt: '2026-08-01T08:00:00Z',
    deployedAt: '2026-08-05T12:00:00Z',
    status: 'CANARY_TESTING',
    metrics: {
      top1Accuracy: 0.742,
      top2Accuracy: 0.915,
      top3Accuracy: 0.978,
      mrr: 0.849,
      brierScore: 0.068,
      ece: 0.015,
      mota: 0.896,
      idf1: 0.908,
      hota: 0.812,
      ocrPlateAccuracy: 0.985,
      reidRank1: 0.938,
      reidRank5: 0.989,
      avgInferenceLatencyMs: 24.2
    },
    calibrationCurve: [
      { confidenceBin: 0.1, observedAccuracy: 0.102 },
      { confidenceBin: 0.3, observedAccuracy: 0.301 },
      { confidenceBin: 0.5, observedAccuracy: 0.498 },
      { confidenceBin: 0.7, observedAccuracy: 0.705 },
      { confidenceBin: 0.9, observedAccuracy: 0.898 }
    ]
  }
];

export const INITIAL_ALERT_RULES: AlertRule[] = [
  {
    id: 'RULE-001',
    name: 'High-Priority Security Watchlist Match',
    description: 'Triggers immediately when a license plate on the active high-level threat watchlist is identified with >85% confidence.',
    ruleType: 'WATCHLIST_PLATE_MATCH',
    severity: 'CRITICAL',
    enabled: true,
    minConfidenceThreshold: 0.85,
    parameters: {
      targetPlates: ['7XYZ982', '8ABC123', '9LMN456', '5DEF789']
    }
  },
  {
    id: 'RULE-002',
    name: 'Port & Government Geofence Boundary Violation',
    description: 'Triggers when an unverified vehicle enters restricted sector boundaries around the government plaza.',
    ruleType: 'GEOFENCE_VIOLATION',
    severity: 'HIGH',
    enabled: true,
    minConfidenceThreshold: 0.80,
    parameters: {
      geofencePolygon: [
        { lat: 37.777, lng: -122.420 },
        { lat: 37.780, lng: -122.420 },
        { lat: 37.780, lng: -122.413 },
        { lat: 37.777, lng: -122.413 }
      ]
    }
  },
  {
    id: 'RULE-003',
    name: 'High-Speed Route Anomaly Detection',
    description: 'Triggers when a vehicle speed exceeds road limit by 35+ km/h across 2 consecutive camera observations.',
    ruleType: 'SPEED_ANOMALY',
    severity: 'MEDIUM',
    enabled: true,
    minConfidenceThreshold: 0.75,
    parameters: {
      maxSpeedKmh: 85
    }
  }
];

const nowISO = new Date().toISOString();
const min5Ago = new Date(Date.now() - 5 * 60 * 1000).toISOString();
const min12Ago = new Date(Date.now() - 12 * 60 * 1000).toISOString();

export const INITIAL_TRACKS: GlobalVehicleTrack[] = [
  {
    globalTrackId: 'TRACK_00123',
    firstSeenTimestamp: min12Ago,
    lastSeenTimestamp: nowISO,
    status: 'ACTIVE',
    primaryPlateText: '7XYZ982',
    plateHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    vehicleClass: 'suv',
    vehicleColor: 'Obsidian Black',
    makeModel: 'Toyota RAV4 (2024)',
    observationCount: 4,
    camerasTraversed: ['CAM-101', 'CAM-102', 'CAM-103'],
    currentCameraId: 'CAM-103',
    currentRoadSegmentId: 'ROAD-103',
    currentLocationEstimate: {
      lat: 37.7754,
      lng: -122.4150,
      roadSegmentName: 'Grand Avenue Flyover East',
      speedKmh: 48,
      headingDegrees: 80
    },
    scoreDecomposition: {
      plateSimilarity: 0.98,
      appearanceSimilarity: 0.94,
      reidEmbeddingCosine: 0.96,
      colorClassMatch: 1.0,
      transitionProbability: 0.68,
      speedTimeFeasibility: 0.95,
      directionCompatibility: 0.92,
      roadConnectivityScore: 0.98,
      finalAssociationScore: 0.94
    },
    recentObservations: [
      { observationId: 'OBS-1001', cameraId: 'CAM-101', timestamp: min12Ago, plateText: '7XYZ982', confidence: 0.89, estimatedSpeedKmh: 47 },
      { observationId: 'OBS-1002', cameraId: 'CAM-102', timestamp: min5Ago, plateText: '7XYZ982', confidence: 0.94, estimatedSpeedKmh: 49 },
      { observationId: 'OBS-1003', cameraId: 'CAM-103', timestamp: nowISO, plateText: '7XYZ982', confidence: 0.96, estimatedSpeedKmh: 48 }
    ]
  },
  {
    globalTrackId: 'TRACK_00456',
    firstSeenTimestamp: min5Ago,
    lastSeenTimestamp: nowISO,
    status: 'ACTIVE',
    primaryPlateText: '8ABC123',
    plateHash: '1f825227e8020625d97f6c367d32573507c800c8f18c504e9089592478f7b76a',
    vehicleClass: 'car',
    vehicleColor: 'Silver Metallic',
    makeModel: 'Honda Accord (2023)',
    observationCount: 2,
    camerasTraversed: ['CAM-104'],
    currentCameraId: 'CAM-104',
    currentRoadSegmentId: 'ROAD-104',
    currentLocationEstimate: {
      lat: 37.7720,
      lng: -122.4182,
      roadSegmentName: 'Market Street Southbound',
      speedKmh: 44,
      headingDegrees: 180
    },
    scoreDecomposition: {
      plateSimilarity: 0.95,
      appearanceSimilarity: 0.91,
      reidEmbeddingCosine: 0.92,
      colorClassMatch: 1.0,
      transitionProbability: 0.58,
      speedTimeFeasibility: 0.92,
      directionCompatibility: 0.90,
      roadConnectivityScore: 0.95,
      finalAssociationScore: 0.91
    },
    recentObservations: [
      { observationId: 'OBS-2001', cameraId: 'CAM-104', timestamp: nowISO, plateText: '8ABC123', confidence: 0.92, estimatedSpeedKmh: 44 }
    ]
  },
  {
    globalTrackId: 'TRACK_00789',
    firstSeenTimestamp: min12Ago,
    lastSeenTimestamp: nowISO,
    status: 'ACTIVE',
    primaryPlateText: '9LMN456',
    plateHash: '6c51880faf2d140e6530687796a5518b2c2865d1d6a66b26802f43be5d8df2e1',
    vehicleClass: 'truck',
    vehicleColor: 'Bright White',
    makeModel: 'Ford F-150 (2022)',
    observationCount: 3,
    camerasTraversed: ['CAM-102', 'CAM-106'],
    currentCameraId: 'CAM-106',
    currentRoadSegmentId: 'ROAD-108',
    currentLocationEstimate: {
      lat: 37.7780,
      lng: -122.4185,
      roadSegmentName: 'Central Plaza Roundabout',
      speedKmh: 32,
      headingDegrees: 0
    },
    scoreDecomposition: {
      plateSimilarity: 0.97,
      appearanceSimilarity: 0.89,
      reidEmbeddingCosine: 0.91,
      colorClassMatch: 1.0,
      transitionProbability: 0.79,
      speedTimeFeasibility: 0.96,
      directionCompatibility: 0.94,
      roadConnectivityScore: 0.99,
      finalAssociationScore: 0.93
    },
    recentObservations: [
      { observationId: 'OBS-3001', cameraId: 'CAM-102', timestamp: min5Ago, plateText: '9LMN456', confidence: 0.91, estimatedSpeedKmh: 35 },
      { observationId: 'OBS-3002', cameraId: 'CAM-106', timestamp: nowISO, plateText: '9LMN456', confidence: 0.95, estimatedSpeedKmh: 32 }
    ]
  }
];

export const INITIAL_ALERTS: AlertEvent[] = [
  {
    id: 'ALT-9001',
    ruleId: 'RULE-001',
    ruleName: 'High-Priority Security Watchlist Match',
    severity: 'CRITICAL',
    timestamp: nowISO,
    globalTrackId: 'TRACK_00123',
    cameraId: 'CAM-103',
    cameraName: 'CCTV 103 - Grand Flyover East',
    plateText: '7XYZ982',
    locationName: 'Grand Ave Flyover Ramp (Eastbound)',
    confidence: 0.96,
    status: 'NEW',
    reason: 'Vehicle plate 7XYZ982 matches High-Priority Threat Watchlist (Ref #W-8809). Verified across 3 consecutive CCTV cameras.',
    evidenceSummary: 'Multi-camera association confirmed across CAM-101, CAM-102, CAM-103. Re-ID cosine similarity 0.96, plate voting score 0.96.'
  },
  {
    id: 'ALT-9002',
    ruleId: 'RULE-002',
    ruleName: 'Port & Government Geofence Boundary Violation',
    severity: 'HIGH',
    timestamp: min5Ago,
    globalTrackId: 'TRACK_00789',
    cameraId: 'CAM-106',
    cameraName: 'CCTV 106 - Central Plaza Roundabout',
    plateText: '9LMN456',
    locationName: 'Central Plaza Circle View East',
    confidence: 0.91,
    status: 'UNDER_REVIEW',
    reason: 'Commercial truck entered restricted perimeter of Central Plaza Civic Center zone.',
    evidenceSummary: 'Geofence boundary crossover logged at 37.7780, -122.4185. Speed 32 km/h.'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-5001',
    timestamp: min12Ago,
    userId: 'USR-102',
    userName: 'Officer Elena Rostova',
    userRole: 'OPERATOR',
    action: 'vehicle_search',
    resource: '/api/v1/vehicles/search',
    queryReason: 'Routine active incident patrol tracking for Incident #INC-2026-90',
    ipAddress: '10.240.12.88',
    resultStatus: 'SUCCESS',
    metadataJson: '{"searchedPlateHash":"e3b0c442...","resultsReturned":1}'
  },
  {
    id: 'AUD-5002',
    timestamp: min5Ago,
    userId: 'USR-101',
    userName: 'Command Director Marcus Vance',
    userRole: 'SUPER_ADMIN',
    action: 'alert_acknowledge',
    resource: '/api/v1/alerts/ALT-9001/acknowledge',
    queryReason: 'Dispatching patrol unit to Grand Ave Flyover East',
    ipAddress: '10.240.12.10',
    resultStatus: 'SUCCESS',
    metadataJson: '{"alertId":"ALT-9001","assignedUnit":"UNIT-4"}'
  }
];

// In-memory Database Store
class InMemoryDatabase {
  users = [...INITIAL_USERS];
  cameras = [...INITIAL_CAMERAS];
  roadNodes = [...INITIAL_ROAD_NODES];
  roadEdges = [...INITIAL_ROAD_EDGES];
  transitions = [...INITIAL_TRANSITION_PROBABILITIES];
  modelVersions = [...INITIAL_MODEL_VERSIONS];
  alertRules = [...INITIAL_ALERT_RULES];
  tracks = [...INITIAL_TRACKS];
  alerts = [...INITIAL_ALERTS];
  auditLogs = [...INITIAL_AUDIT_LOGS];

  getSystemMetrics(): SystemMetrics {
    return {
      activeCameras: this.cameras.filter((c) => c.status === 'ONLINE').length,
      totalCameras: this.cameras.length,
      fpsIngested: 360, // 12 cameras * 30 fps
      activeTracksCount: this.tracks.filter((t) => t.status === 'ACTIVE').length,
      gpuUtilizationPercentage: 64.2,
      inferenceLatencyMs: 18.5,
      associationLatencyMs: 12.2,
      predictionLatencyMs: 14.8,
      apiLatencyMs: 22.1,
      queuedFrames: 4,
      memoryUsageMb: 1420
    };
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(newLog);
    return newLog;
  }
}

export const db = new InMemoryDatabase();
