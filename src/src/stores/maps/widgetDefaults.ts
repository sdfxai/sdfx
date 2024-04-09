/*
 * weidget definitions and defaults for SDFX controls
 */
export const widgetDefaults = {
  crop: { name: 'Crop', type: 'selector'},
  facedetection: { name: 'Face Detection', type: 'selector'},
  face_restore_model: { name: 'Face Restore', type: 'selector'},
  channel: { name: 'Channel', type: 'selector'},
  ckpt_name: { name: 'Model', type: 'selector'},
  lora_name: { name: 'Lora', type: 'selector'},
  sampler_name: { name: 'Sampler', type: 'selector'},
  scheduler: { name: 'Scheduler', type: 'selector'},
  control_after_generate: { name: 'Seed control', type: 'selector'},
  model_name: { name: 'Model name', type: 'selector'},
  upscale_method: { name: 'Upscale method', type: 'selector'},

  lora_01: { name: 'Lora 01', type: 'selector'},
  lora_02: { name: 'Lora 02', type: 'selector'},
  lora_03: { name: 'Lora 03', type: 'selector'},
  lora_04: { name: 'Lora 04', type: 'selector'},

  text: {
    showOptional: false,
    type: 'textarea',
    defaultValue: ''
  },

  image: {
    name: 'Image',
    type: 'input',
    showOptional: false,
    defaultValue: ''
  },

  filename_prefix: {
    name: 'Filename prefix',
    type: 'input',
    showOptional: false,
    defaultValue: ''
  },

  /* lora stack */
  'Lora Loader Stack (rgthree)/strength_01': { name: 'Strength', type: 'slider', min: -9.00, max: 9.00, interval: 0.01, precision: 2, shiftInterval: 0.01, zeroPoint: 0.00, range: [-9.00, -4.5, 0.00, 4.50, 9.00], snap: [-9.00, -6.00, -3.0, 0.00, 3.00, 6.00, 9.00], snapThreshold: 0.02, defaultValue: 0.0 },
  'Lora Loader Stack (rgthree)/strength_02': { name: 'Strength', type: 'slider', min: -9.00, max: 9.00, interval: 0.01, precision: 2, shiftInterval: 0.01, zeroPoint: 0.00, range: [-9.00, -4.5, 0.00, 4.50, 9.00], snap: [-9.00, -6.00, -3.0, 0.00, 3.00, 6.00, 9.00], snapThreshold: 0.02, defaultValue: 0.0 },
  'Lora Loader Stack (rgthree)/strength_03': { name: 'Strength', type: 'slider', min: -9.00, max: 9.00, interval: 0.01, precision: 2, shiftInterval: 0.01, zeroPoint: 0.00, range: [-9.00, -4.5, 0.00, 4.50, 9.00], snap: [-9.00, -6.00, -3.0, 0.00, 3.00, 6.00, 9.00], snapThreshold: 0.02, defaultValue: 0.0 },
  'Lora Loader Stack (rgthree)/strength_04': { name: 'Strength', type: 'slider', min: -9.00, max: 9.00, interval: 0.01, precision: 2, shiftInterval: 0.01, zeroPoint: 0.00, range: [-9.00, -4.5, 0.00, 4.50, 9.00], snap: [-9.00, -6.00, -3.0, 0.00, 3.00, 6.00, 9.00], snapThreshold: 0.02, defaultValue: 0.0 },

  'blend_percentage': {
    name: 'Blend',
    type: 'slider',
    color: 'pink',
    min: 0.00,
    max: 1.00,
    interval: 0.01,
    precision: 2,
    range: [0.00, 0.25, 0.50, 0.75, 1.00],
    snap: [0.00, 0.25, 0.50, 0.75, 1.00],
    snapThreshold: 0.05,
    defaultValue: 0.00
  },

  'ImageSharpen/sharpen_radius': {
    name: 'Radius',
    type: 'slider',
    min: 0.00,
    max: 8.00,
    interval: 0.01,
    precision: 2,
    shiftInterval: 0.01,
    zeroPoint: 0.00,
    range: [0.00, 2.00, 4.00, 6.00, 8.00],
    snap: [0.00, 2.00, 4.00, 6.00, 8.00],
    snapThreshold: 0.02,
    defaultValue: 1.0
  },

  'ImageSharpen/sigma': {
    name: 'Sigma',
    type: 'slider',
    color: 'pink',
    min: 0.00,
    max: 1.00,
    interval: 0.01,
    precision: 2,
    range: [0.00, 0.25, 0.50, 0.75, 1.00],
    snap: [0.00, 0.25, 0.50, 0.75, 1.00],
    snapThreshold: 0.05,
    defaultValue: 0.00
  },

  'ImageSharpen/alpha': {
    name: 'Alpha',
    type: 'slider',
    color: 'green',
    min: 0.00,
    max: 1.00,
    interval: 0.01,
    precision: 2,
    range: [0.00, 0.25, 0.50, 0.75, 1.00],
    snap: [0.00, 0.25, 0.50, 0.75, 1.00],
    snapThreshold: 0.05,
    defaultValue: 0.00
  },

  'MiDaS-DepthMapPreprocessor/a': {
    name: 'Midas a',
    type: 'slider',
    min: 0.00,
    max: 12.00,
    interval: 0.01,
    precision: 2,
    shiftInterval: 0.01,
    zeroPoint: 6.00,
    range: [0.00, 3.00, 6.00, 9.00, 12.00],
    snap: [0.00, 3.00, 6.00, 9.00, 12.00],
    snapThreshold: 0.02,
    defaultValue: 6.0
  },

  'bg_threshold': {
    name: 'BG Threshold',
    type: 'slider',
    min: 0.00,
    max: 1.00,
    interval: 0.01,
    precision: 2,
    range: [0.00, 0.25, 0.50, 0.75, 1.00],
    snap: [0.00, 0.25, 0.50, 0.75],
    snapThreshold: 0.05,
    defaultValue: 1.00
  },

  'FreeU_V2/b1': {
    name: 'B1 multiplier',
    type: 'slider',
    min: 0.00,
    max: 6.00,
    interval: 0.05,
    precision: 3,
    shiftInterval: 0.01,
    zeroPoint: 1.00,
    range: [0.00, 0.75, 1.50, 2.25, 3.00],
    snap: [0.00, 0.75, 1.50, 2.25, 3.00],
    snapThreshold: 0.02,
    defaultValue: 1.0
  },

  'FreeU_V2/b2': {
    name: 'B2 multiplier',
    type: 'slider',
    min: 0.00,
    max: 3.00,
    interval: 0.05,
    precision: 3,
    shiftInterval: 0.01,
    zeroPoint: 1.00,
    range: [0.00, 0.75, 1.50, 2.25, 3.00],
    snap: [0.00, 0.75, 1.50, 2.25, 3.00],
    snapThreshold: 0.02,
    defaultValue: 1.0
  },

  'FreeU_V2/s1': {
    name: 'Scale 1',
    type: 'slider',
    color: 'green',
    min: 0.00,
    max: 2.00,
    interval: 0.05,
    precision: 3,
    shiftInterval: 0.01,
    zeroPoint: 1.00,
    range: [0.00, 0.50, 1.00, 1.50, 2.00],
    snap: [0.00, 0.50, 1.00, 1.50, 2.00],
    snapThreshold: 0.02,
    defaultValue: 1.0
  },

  'FreeU_V2/s2': {
    name: 'Scale 2',
    type: 'slider',
    color: 'green',
    min: 0.00,
    max: 2.00,
    interval: 0.05,
    precision: 3,
    shiftInterval: 0.01,
    zeroPoint: 1.00,
    range: [0.00, 0.50, 1.00, 1.50, 2.00],
    snap: [0.00, 0.50, 1.00, 1.50, 2.00],
    snapThreshold: 0.02,
    defaultValue: 1.0
  },

  scale_by: {
    name: 'Scale',
    type: 'slider',
    min: 0.00,
    max: 6.00,
    interval: 0.125,
    precision: 3,
    shiftInterval: 0.01,
    range: [0.00, 1.00, 2.00, 3.00, 4.00, 5.00, 6.00],
    snap: [0.00, 2.00, 3.00, 4.00, 6.00],
    snapThreshold: 0.02,
    defaultValue: 1.0
  },

  cfg: {
    name: 'Guidance',
    type: 'slider',
    min: 0,
    max: 30,
    interval: 0.25,
    precision: 2,
    shiftInterval: 0.05,
    range: [0, 5, 10, 15, 20, 25, 30],
    snap: [0, 3.5, 7.5, 12, 15, 30],
    snapThreshold: 0.02,
    defaultValue: 7.50
  },

  steps: {
    name: 'Steps',
    type: 'slider',
    color: 'green',
    min: 1,
    max: 150,
    interval: 1,
    precision: 0,
    shiftInterval: 1,
    snapThreshold: 0.05,
    range: [1, 25, 50, 75, 100, 125, 150],
    snap: [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120, 130, 140, 150],
    defaultValue: 25
  },

  batch_count: {
    name: 'Batch count',
    type: 'slider',
    min: 1,
    max: 150,
    interval: 1,
    precision: 0,
    range: [1, 50, 100, 150],
    snap: [1, 5, 10, 15, 20, 30, 50, 80, 100],
    snapThreshold: 0.05,
    defaultValue: 1
  },

  'EmptyLatentImage/batch_size': {
    name: 'Batch size',
    type: 'slider',
    min: 1,
    max: 240,
    interval: 1,
    precision: 0,
    range: [1, 60, 120, 180, 240],
    snap: [1, 60, 120, 180, 240],
    defaultValue: 1
  },

  batch_size: {
    name: 'Batch size',
    type: 'slider',
    min: 1,
    max: 9,
    interval: 1,
    precision: 0,
    range: [1, 3, 5, 7, 9],
    snap: [1, 2, 4, 6, 9],
    defaultValue: 1
  },

  codeformer_fidelity: {
    name: 'Face Fidelity',
    type: 'slider',
    color: 'pink',
    min: 0.00,
    max: 1.00,
    interval: 0.01,
    precision: 2,
    range: [0.00, 0.25, 0.50, 0.75, 1.00],
    snap: [0.00, 0.25, 0.50, 0.75],
    snapThreshold: 0.05,
    defaultValue: 0.50
  },

  ratio: {
    name: 'Ratio',
    type: 'slider',
    color: 'pink',
    min: 0.00,
    max: 1.00,
    interval: 0.01,
    precision: 2,
    range: [0.00, 0.25, 0.50, 0.75, 1.00],
    snap: [0.00, 0.25, 0.50, 0.75],
    snapThreshold: 0.05,
    defaultValue: 0.50
  },

  weight: {
    name: 'Weight',
    type: 'slider',
    color: 'pink',
    min: 0.00,
    max: 1.00,
    interval: 0.01,
    precision: 2,
    range: [0.00, 0.25, 0.50, 0.75, 1.00],
    snap: [0.00, 0.25, 0.50, 0.75],
    snapThreshold: 0.05,
    defaultValue: 1.00
  },

  denoise: {
    name: 'Denoising',
    type: 'slider',
    color: 'pink',
    min: 0.01,
    max: 1.00,
    interval: 0.01,
    precision: 2,
    range: [0.01, 0.25, 0.50, 0.75, 1.00],
    snap: [0.01, 0.25, 0.50, 0.75],
    snapThreshold: 0.05,
    defaultValue: 1.00
  },

  strength: {
    name: 'Strength',
    type: 'slider',
    color: 'pink',
    min: 0.00,
    max: 2.00,
    interval: 0.01,
    precision: 2,
    range: [0.00, 0.50, 1.00, 1.50, 2.00],
    snap: [0.00, 0.50, 1.00, 1.50, 2.00],
    snapThreshold: 0.05,
    defaultValue: 1.00
  },

  'Canny/low_threshold': {
    name: 'L Threshold',
    type: 'slider',
    min: 0.00,
    max: 1.00,
    interval: 0.01,
    precision: 2,
    range: [0.00, 0.25, 0.50, 0.75, 1.00],
    snap: [0.00, 0.25, 0.50, 0.75],
    snapThreshold: 0.05,
    defaultValue: 1.00
  },

  'Canny/high_threshold': {
    name: 'H Threshold',
    type: 'slider',
    min: 0.00,
    max: 1.00,
    interval: 0.01,
    precision: 2,
    range: [0.00, 0.25, 0.50, 0.75, 1.00],
    snap: [0.00, 0.25, 0.50, 0.75],
    snapThreshold: 0.05,
    defaultValue: 1.00
  },  

  'ControlNetApplyAdvanced/strength': {
    name: 'Strength',
    type: 'slider',
    color: 'green',
    min: 0.00,
    max: 2.00,
    interval: 0.01,
    precision: 2,
    range: [0.00, 0.50, 1.00, 1.50, 2.00],
    snap: [0.00, 0.50, 1.00, 1.50, 2.00],
    snapThreshold: 0.05,
    defaultValue: 0.50
  },

  start_percent: {
    name: 'Start percent',
    type: 'slider',
    min: 0.00,
    max: 1.00,
    interval: 0.01,
    precision: 2,
    range: [0.00, 0.25, 0.50, 0.75, 1.00],
    snap: [0.00, 0.25, 0.50, 0.75],
    snapThreshold: 0.05,
    defaultValue: 1.00
  },

  end_percent: {
    name: 'Start percent',
    type: 'slider',
    min: 0.00,
    max: 1.00,
    interval: 0.01,
    precision: 2,
    range: [0.00, 0.25, 0.50, 0.75, 1.00],
    snap: [0.00, 0.25, 0.50, 0.75],
    snapThreshold: 0.05,
    defaultValue: 1.00
  },

  strength_model: {
    name: 'Model strength',
    type: 'slider',
    color: 'green',
    min: -8.00,
    max: 8.00,
    interval: 0.01,
    precision: 2,
    shiftInterval: 0.01,
    range: [-8.00, -4.00, 0.00, 4.00, 8.00],
    snap: [-8.00, -4.00, 0.00, 4.00, 8.00],
    snapThreshold: 0.05,
    defaultValue: 0.00
  },

  strength_clip: {
    name: 'Clip cutoff',
    type: 'slider',
    color: 'pink',
    min: -1.00,
    max: 1.00,
    interval: 0.10,
    precision: 2,
    shiftInterval: 0.01,
    range: [-1.00, -0.50, 0.00, 0.50, 1.00],
    snap: [-1.00, -0.50, 0.00, 0.50, 1.00],
    snapThreshold: 0.05,
    defaultValue: 0.00
  },

  boolean_number: {
    name: 'Enable',
    type:'toggle',
    min: 0,
    max: 1,
    interval: 1,
    precision: 0
  },

  seed: {
    name: 'Seed',
    type: 'number',
    min: 0,
    max: 977173709552000,
    interval: 1,
    shiftInterval: 10,
    precision: 0
  },

  width: {
    name: 'Width',
    type: 'dragnumber',
    min: 64,
    max: 8192,
    interval: 64,
    defaultValue: 768,
    precision: 0
  },

  height: {
    name: 'Height',
    type:'dragnumber',
    min: 64,
    max: 8192,
    interval: 64,
    defaultValue: 512,
    precision: 0
  },
}
