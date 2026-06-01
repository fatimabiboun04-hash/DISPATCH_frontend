import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import LandingNav       from './landing/LandingNav'
import HeroSection      from './landing/HeroSection'
import AboutSection     from './landing/AboutSection'
import ContactSection   from './landing/ContactSection'
import LoginSection     from './landing/LoginSection'
import LandingFooter    from './landing/LandingFooter'
import LoadingScreen    from '../../components/ui/LoadingScreen'
import { selectIsAuth, selectUserRole } from '../../features/auth/authSelectors'
import { ROLE_HOME } from '../../constants/roles'

/**
 * LandingPage
 * Single-page experience: Hero → About → Contact → Login
 *
 * If user is already authenticated, immediately redirect to their home.
 */
const LandingPage = () => {
  const isAuth = useSelector(selectIsAuth)
  const role   = useSelector(selectUserRole)
  const [loaded, setLoaded] = useState(false)

  // Already logged in → skip landing entirely
  if (isAuth && role) {
    return <Navigate to={ROLE_HOME[role]} replace />
  }

  const scrollToLogin = () => {
    document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Initial branded loading screen */}
      {!loaded && (
        <LoadingScreen
          duration={1600}
          onComplete={() => setLoaded(true)}
        />
      )}

      <div className="min-h-screen bg-slate-950">
        {/* Fixed navbar */}
        <LandingNav />

        {/* Page sections */}
        <main>
          <HeroSection   onCTA={scrollToLogin} />
          <AboutSection  />
          <ContactSection />
          <LoginSection  />
        </main>

        <LandingFooter />
      </div>
    </>
  )
}

export default LandingPage