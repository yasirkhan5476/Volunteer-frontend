import { Camera, LoaderCircle, UserCircle2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { profileApi } from '../services/api'
import { useAuthStore } from '../store/authStore'

const MAX_FILE_SIZE = 1 * 1024 * 1024
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg']

export function ProfileImageUpload({ user }) {
  const fileInputRef = useRef(null)
  const updateUser = useAuthStore((state) => state.updateUser)
  const profileImageUrl = user?.profile_image_url || user?.volunteerProfile?.avatarUrl || ''
  const [imageUrl, setImageUrl] = useState(profileImageUrl)
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    setImageUrl(profileImageUrl)
  }, [profileImageUrl])

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be 1 MB or less.')
      return
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Only PNG, JPG, and JPEG formats are supported.')
      return
    }

    setError('')
    setIsUploading(true)

    try {
      const response = await profileApi.uploadImage(file)
      const nextImageUrl = response?.profile_image_url

      if (!nextImageUrl) throw new Error('The uploaded image URL was not returned.')

      setImageUrl(nextImageUrl)
      updateUser({
        profile_image_url: nextImageUrl,
        volunteerProfile: { ...user?.volunteerProfile, avatarUrl: nextImageUrl },
      })
    } catch (uploadError) {
      setError(
        uploadError?.response?.data?.error ||
          uploadError?.response?.data?.message ||
          'Unable to upload your profile photo. Please try again.',
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-32 w-32 shrink-0">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-emerald-400/40 bg-slate-800 ring-4 ring-slate-900">
          {imageUrl ? (
            <img src={imageUrl} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <UserCircle2 size={72} strokeWidth={1.2} className="text-slate-500" />
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-950 bg-emerald-400 text-slate-950 shadow-lg transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Edit profile photo"
          title="Edit profile photo"
        >
          {isUploading ? <LoaderCircle size={18} className="animate-spin" /> : <Camera size={18} />}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".png, .jpg, .jpeg, image/png, image/jpeg"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">Profile photo</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="mt-1 text-sm font-medium text-emerald-300 transition hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? 'Uploading...' : 'Edit Photo'}
        </button>
        <p className="mt-1 text-xs text-slate-400">PNG, JPG, or JPEG up to 1 MB</p>
        {error && <p className="mt-2 max-w-xs text-xs text-rose-300">{error}</p>}
      </div>
    </div>
  )
}