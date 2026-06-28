import { useState } from 'react'
import { Coffee, Play } from 'lucide-react'
import { Button } from '../ui'
import toast from 'react-hot-toast'
import pauseService from '../../services/pauseService'

const SelfPauseButton = ({ onToggle }) => {
  const [isPaused, setIsPaused] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      if (isPaused) {
        await pauseService.stopMyPause()
        setIsPaused(false)
        toast.success('Pause terminée')
      } else {
        await pauseService.startMyPause()
        setIsPaused(true)
        toast.success('Pause commencée')
      }
      onToggle?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={isPaused ? 'primary' : 'secondary'}
      size="md"
      leftIcon={isPaused
        ? <Play className="h-4 w-4" />
        : <Coffee className="h-4 w-4" />
      }
      loading={loading}
      onClick={handleToggle}
      className="w-full"
    >
      {isPaused ? 'Reprendre' : 'Pause'}
    </Button>
  )
}

export default SelfPauseButton
