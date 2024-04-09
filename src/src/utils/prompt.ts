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
        id: crypto.randomUUID(),
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

