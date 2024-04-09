export default function loadImage(src: string): Promise<any> {
  return new Promise<void>((resolve, reject) => {
    const image = new Image()

    const dispose = () => {
      image.onload = null
      image.onerror = null
    }

    image.onload = () => {
      resolve()
      dispose()
    }

    image.onerror = (e) => {
      reject(e)
      dispose()
    }

    image.src = src
  })
}
