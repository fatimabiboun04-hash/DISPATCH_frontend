import { useState, useRef } from 'react'
import { Camera, X }        from 'lucide-react'
import { Avatar }           from '../ui'
import { cn }               from '../../utils/cn'

/**
 * AvatarUploader — click to select + preview avatar before upload.
 *
 * Does NOT upload immediately — returns the File object via onChange.
 * Parent (MyProfilePage) sends it with PUT /v1/me via FormData.
 *
 * ProfileController@update accepts: 'nullable|image|max:2048'
 * Fix #4: moves to public disk (if applied).
 */
const AvatarUploader = ({ currentUrl, name, onChange }) => {
  const [preview,  setPreview]  = useState(null)
  const [isDragging,setDragging]= useState(false)
  const inputRef                 = useRef(null)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    onChange?.(file)
  }

  const handleChange = (e) => {
    handleFile(e.target.files?.[0])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setPreview(null)
    onChange?.(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'group relative inline-flex cursor-pointer',
        isDragging && 'scale-105'
      )}
    >
      {/* Avatar display */}
      <Avatar
        src={preview || currentUrl}
        name={name}
        size="xl"
        ring
        className="transition-opacity group-hover:opacity-80"
      />

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center
                      rounded-full bg-black/0 transition-all duration-200
                      group-hover:bg-black/30">
        <Camera className="h-6 w-6 text-white opacity-0 transition-opacity
                           duration-200 group-hover:opacity-100" />
      </div>

      {/* Clear preview */}
      {preview && (
        <button
          onClick={handleClear}
          className="absolute -right-1 -top-1 flex h-6 w-6 items-center
                     justify-center rounded-full bg-red-500 text-white
                     shadow-sm transition-transform hover:scale-110"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}

export default AvatarUploader