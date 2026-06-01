import { Zap } from 'lucide-react'

const LandingFooter = () => (
  <footer className="border-t border-white/5 bg-slate-950 py-10">
    <div className="mx-auto max-w-7xl px-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500">
            <Zap className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-400">
            Dispatch <span className="text-brand-400">Live</span>
          </span>
        </div>
        <p className="text-xs text-slate-700">
          © {new Date().getFullYear()} Dispatch Live. All rights reserved.
        </p>
        <p className="text-xs text-slate-700">
          Enterprise Workforce Management Platform
        </p>
      </div>
    </div>
  </footer>
)

export default LandingFooter