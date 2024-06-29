import { v4 as uuidv4 } from 'uuid'

export const validatePromptBlock = (promptBlock: string) => {
  const pattern = /^\[\[(.+):([\d.]+)\]\::([\d.]+)\]$/
  const matches = promptBlock.match(pattern)

  if (matches) {
    return {
      prompt: matches[1],
      start: parseFloat(matches[2]),
      end: parseFloat(matches[3]),
    }
  }

  return null
}


/**
 * get blocks from prompt
const inputString = "[[promptText1:0.34020]::1.000], with [[promptText2:0.45030]::2.000], with [[promptText3:0.56040]::3.000] ..."
const promptBlocks = getBlocksFromPrompt(inputString)
console.log(promptBlocks)
*/
export const getBlocksFromPrompt = (prompt: string) => {
  if (!prompt) return []

  const regex = /\[\[.+?:[\d.]+\]\::[\d.]+\]/g
  const blocks = prompt.match(regex) || []

  return blocks.map(block => {
    const validatedBlock = validatePromptBlock(block)
    if (validatedBlock) {
      return {
        id: uuidv4(),
        ...validatedBlock
      }
    }
    return null
  }).filter(block => block !== null)
}

/*
const inputString = "[[promptText1:0.34020]::1.000], with [[promptText2:0.45030]::2.000], with [[promptText3:0.56040]::3.000] ...";
const promptBlocks = getBlocksFromPrompt(inputString);
const tracks = getTracksFromPromptBlocks(promptBlocks);
*/
export const getTracksFromPromptBlocks = (promptBlocks: string[]) => {
  const tracks: any[] = []

  /* max 2 block per track for convenience */
  for (let i = 0; i < promptBlocks.length; i += 2) {
    const trackId = tracks.length

    const blocksInTrack = []
    const block1 = promptBlocks[i]
    const block2 = promptBlocks[i + 1]

    if (block1) blocksInTrack.push(block1)
    if (block2) blocksInTrack.push(block2)

    tracks.push({
      trackId: trackId,
      name: `Track ${trackId + 1}`,
      muted: false,
      solo: false,
      height: 38,
      blocks: blocksInTrack
    })
  }

  return tracks
}

export const getPromptFromTimeline = (tracks: any[]) => {
  let prompt: any[] = []

  tracks.forEach(track => {
    if (!track.muted) {
      const blocks = track.blocks
      blocks.forEach((e: any) => {
        prompt.push(`[[${e.prompt}:${e.start.toFixed(5)}]::${e.end.toFixed(3)}]`)
      })
    }
  })

  return prompt.join(', with ')
}


/**
 * Extract text from a track (e.g. '[[UHD --ar 9:16 --chaos 1. 7 --style raw:0.00000]::1.000]')
 * @param textTrack 
 */
const extractTextFromTrack = (textTrack: string) => {
  // Étape 1 : Virer les brackets extérieurs
  let step1 = textTrack.replace(/^\[\[|\]\]$/g, '')

  // Étape 2 : Virer le bracket de gauche et de droite, ainsi que tout ce qu'il y a après le bracket de droite
  let step2 = step1.replace(/^\[|\].*$/g, '')

  // Étape 3 : Virer tout ce qui ce trouve après le dernier ":"
  let step3 = step2.substring(0, step2.lastIndexOf(':'))

  return step3
}

export const getCleanPrompt = (mutedPrompt: string) => {
  let cleanPrompt = ''
  let trackArray = mutedPrompt.split(', with ')
  for (let track of trackArray) {
    let match = extractTextFromTrack(track)
    if (match) {
      cleanPrompt += match + ', '
    }
  }

  cleanPrompt = cleanPrompt.slice(0, -2) // Retirer la dernière virgule et l'espace
  return cleanPrompt
}