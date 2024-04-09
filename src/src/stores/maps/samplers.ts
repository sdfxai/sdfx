/**
 * available samplers:
 * -------------------
 * euler,
 * euler_ancestral,
 * heun,
 * dpm_2,
 * dpm_2_ancestral,
 * lms,
 * dpm_fast,
 * dpm_adaptive,
 * dpmpp_2s_ancestral,
 * dpmpp_sde,
 * dpmpp_sde_gpu,
 * dpmpp_2m,
 * dpmpp_2m_sde,
 * dpmpp_2m_sde_gpu,
 * dpmpp_3m_sde,
 * dpmpp_3m_sde_gpu,
 * ddpm,
 * ddim,
 * uni_pc,
 * uni_pc_bh2
 */

/**
 * available schedulers:
 * ---------------------
 * normal,
 * karras,
 * exponential,
 * sgm_uniform,
 * simple,
 * ddim_uniform
 */

export const samplerMap = {
  'euler': {
    label: 'Euler',
    sampler_name: 'euler',
    scheduler: 'normal'
  },

  'euler_ancestral': {
    label: 'Euler ancestral',
    sampler_name: 'euler_ancestral',
    scheduler: 'normal'
  },

  'heun': {
    label: 'Heun',
    sampler_name: 'heun',
    scheduler: 'normal'
  },

  'dpm_2': {
    label: 'DPM2',
    sampler_name: 'dpm_2',
    scheduler: 'normal'
  },

  'dpm_2_karras': {
    label: 'DPM2 (karras)',
    sampler_name: 'dpm_2',
    scheduler: 'karras'
  },

  'dpm_2_ancestral': {
    label: 'DPM2 ancestral',
    sampler_name: 'dpm_2_ancestral',
    scheduler: 'normal'
  },

  'dpm_2_ancestral_karras': {
    label: 'DPM2 ancestral (karras)',
    sampler_name: 'dpm_2_ancestral',
    scheduler: 'karras'
  },

  'lms': {
    label: 'LMS',
    sampler_namee: 'lms',
    scheduler: 'normal'
  },

  'lms_karras': {
    label: 'LMS (karras)',
    sampler_namee: 'lms',
    scheduler: 'karras'
  },

  'dpm_fast': {
    label: 'DPM fast',
    sampler_name: 'dpm_fast',
    scheduler: 'normal'
  },

  'dpm_adaptive': {
    label: 'DPM adaptive',
    sampler_name: 'dpm_adaptive',
    scheduler: 'normal'
  },

  'dpmpp_2s_ancestral': {
    label: 'DPM++ 2s ancestral',
    sampler_name: 'dpmpp_2s_ancestral',
    scheduler: 'normal'
  },

  'dpmpp_2s_ancestral_karras': {
    label: 'DPM++ 2s ancestral (karras)',
    sampler_name: 'dpmpp_2s_ancestral',
    scheduler: 'karras'
  },

  'dpmpp_sde': {
    label: 'DPM++ sde',
    sampler_name: 'dpmpp_sde',
    scheduler: 'normal'
  },

  'dpmpp_sde_karras': {
    label: 'DPM++ sde (karras)',
    sampler_name: 'dpmpp_sde',
    scheduler: 'karras'
  },

  'dpmpp_2m': {
    label: 'DPM++ 2m',
    sampler_name: 'dpmpp_2m',
    scheduler: 'normal'
  },

  'dpmpp_2m_karras': {
    label: 'DPM++ 2m (karras)',
    sampler_name: 'dpmpp_2m',
    scheduler: 'karras'
  },

  'dpmpp_2m_sde': {
    label: 'DPM++ 2m sde',
    sampler_name: 'dpmpp_2m_sde',
    scheduler: 'normal'
  },

  'dpmpp_2m_sde_karras': {
    label: 'DPM++ 2m sde (karras)',
    sampler_name: 'dpmpp_2m_sde',
    scheduler: 'karras'
  },

  'dpmpp_3m_sde': {
    label: 'DPM++ 3m sde',
    sampler_name: 'dpmpp_3m_sde',
    scheduler: 'normal'
  },

  'dpmpp_3m_sde_karras': {
    label: 'DPM++ 3m sde (karras)',
    sampler_name: 'dpmpp_3m_sde',
    scheduler: 'karras'
  },

  'ddpm': {
    label: 'DDPM',
    sampler_name: 'ddpm',
    scheduler: 'normal'
  },

  'ddim': {
    label: 'DDIM',
    sampler_name: 'ddim',
    scheduler: 'normal'
  },

  'ddim_karras': {
    label: 'DDIM (karras)',
    sampler_name: 'ddim',
    scheduler: 'karras'
  },

  'uni_pc': {
    label: 'UniPC',
    sampler_name: 'uni_pc',
    scheduler: 'normal'
  }
}

/**
 * list of sampler presets
 */
export const samplerList = [
  { name: 'Euler', value:'euler' },
  { name: 'Euler a', value:'euler_ancestral' },
  { name: 'DDIM', value:'ddim' },
  { name: 'DDIM (karras)', value:'ddim_karras', hide:true },
  { name: 'DPM++ 2S a', value:'dpmpp_2s_ancestral', hide:true },
  { name: 'DPM++ 2S a (karras)', value:'dpmpp_2s_ancestral_karras' },
  { name: 'DPM++ SDE', value:'dpmpp_sde', hide:true },
  { name: 'DPM++ SDE (karras)', value:'dpmpp_sde_karras' },
  { name: 'DPM++ 2M', value:'dpmpp_2m', hide:true },
  { name: 'DPM++ 2M (karras)', value:'dpmpp_2m_karras' },
  { name: 'DPM++ 2M SDE', value:'dpmpp_2m_sde', hide:true },
  { name: 'DPM++ 2M SDE (karras)', value:'dpmpp_2m_sde_karras' },
  { name: 'DPM++ 3M SDE', value:'dpmpp_3m_sde', hide:true },
  { name: 'DPM++ 3M SDE (karras)', value:'dpmpp_3m_sde_karras' },
  { name: 'DPM fast', value:'dpm_fast' },
  { name: 'DPM adaptive', value:'dpm_adaptive' },
  { name: 'LMS', value:'lms', hide:true },
  { name: 'LMS (karras)', value:'lms_karras' },
  { name: 'DPM2', value:'dpm_2', hide:true },
  { name: 'DPM2 (karras)', value:'dpm_2_karras', hide:true },
  { name: 'DPM2 a', value:'dpm_2_ancestral', hide:true },
  { name: 'DPM2 a Karras', value:'dpm_2_ancestral_karras', hide:true },
  { name: 'Heun', value:'heun', hide:true },
  { name: 'UniPC', value:'uni_pc', hide:true },
]

