import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send, CheckCircle, Mail, MapPin, Clock } from 'lucide-react'
import { cn } from '../../../utils/cn'

const schema = z.object({
  name:    z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email:   z.string().email('Adresse email invalide'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
})

const CONTACT_INFO = [
  { icon: Mail,    label: 'Email',       value: 'support@dispatch-live.app' },
  { icon: MapPin,  label: 'Adresse',     value: 'Casablanca, Maroc' },
  { icon: Clock,   label: 'Disponible',  value: 'Lun – Ven, 09:00 – 18:00' },
]

/**
 * ContactSection — professional contact form + info cards.
 */
const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false)
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    // Simulate send (no backend endpoint for contact)
    await new Promise((r) => setTimeout(r, 1000))
    setSubmitted(true)
    reset()
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <section id="contact" ref={ref} className="bg-slate-950 py-32">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-brand-500/20
                           bg-brand-500/5 px-3 py-1 text-xs font-medium text-brand-400">
            Contact
          </span>
          <h2 className="text-4xl font-bold text-white">
            Parlons de votre{' '}
            <span className="text-gradient">projet</span>
          </h2>
          <p className="mt-4 text-slate-400">
            Notre équipe est disponible pour répondre à vos questions.
          </p>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2">

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col justify-center gap-6"
          >
            <p className="text-slate-400 leading-relaxed">
              Vous souhaitez découvrir Dispatch Live ou avez des questions
              sur nos fonctionnalités ? Envoyez-nous un message et nous vous
              répondrons dans les plus brefs délais.
            </p>
            <div className="space-y-4">
              {CONTACT_INFO.map((item) => (
                <div key={item.label}
                     className="flex items-center gap-4 rounded-xl
                                border border-white/6 bg-white/3 p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center
                                  justify-center rounded-lg bg-brand-500/10">
                    <item.icon className="h-4 w-4 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="text-sm font-medium text-slate-300">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="rounded-2xl border border-white/8 bg-white/3 p-8 backdrop-blur-sm">
              {submitted ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                  <div className="flex h-16 w-16 items-center justify-center
                                  rounded-full bg-emerald-500/10">
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                  </div>
                  <p className="text-center font-medium text-slate-200">
                    Message envoyé avec succès !
                  </p>
                  <p className="text-center text-sm text-slate-400">
                    Nous vous répondrons très prochainement.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-400">
                      Nom complet
                    </label>
                    <input
                      {...register('name')}
                      placeholder="Votre nom"
                      className={cn(
                        'w-full rounded-xl border bg-white/5 px-4 py-3 text-sm',
                        'text-slate-200 placeholder-slate-600',
                        'transition-all duration-200 outline-none',
                        'focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20',
                        errors.name
                          ? 'border-red-500/50'
                          : 'border-white/8 hover:border-white/12'
                      )}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-400">
                      Email
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="votre@email.com"
                      className={cn(
                        'w-full rounded-xl border bg-white/5 px-4 py-3 text-sm',
                        'text-slate-200 placeholder-slate-600',
                        'transition-all duration-200 outline-none',
                        'focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20',
                        errors.email
                          ? 'border-red-500/50'
                          : 'border-white/8 hover:border-white/12'
                      )}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-400">
                      Message
                    </label>
                    <textarea
                      {...register('message')}
                      rows={4}
                      placeholder="Décrivez votre projet ou vos questions…"
                      className={cn(
                        'w-full resize-none rounded-xl border bg-white/5 px-4 py-3 text-sm',
                        'text-slate-200 placeholder-slate-600',
                        'transition-all duration-200 outline-none',
                        'focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20',
                        errors.message
                          ? 'border-red-500/50'
                          : 'border-white/8 hover:border-white/12'
                      )}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl
                               bg-brand-500 py-3.5 text-sm font-semibold text-white
                               shadow-glow transition-all duration-200
                               hover:bg-brand-400 active:scale-95
                               disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full
                                      border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Envoyer le message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection