import { useEffect, useCallback } from 'react'

export function useKeyboardControls(onCameraChange?: (camera: number) => void) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase()
    let camera: number | null = null

    if (key === '1' || key === 'a') camera = 1
    if (key === '2' || key === 'b') camera = 2
    if (key === '3' || key === 'c') camera = 3
    if (key === '4' || key === 'd') camera = 4

    if (camera !== null && onCameraChange) {
      onCameraChange(camera)
    }
  }, [onCameraChange])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
