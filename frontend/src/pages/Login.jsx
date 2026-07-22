import { Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'sonner'
import Navbar from '../components/Navbar/Navbar'
import Button from '../components/Button/Button'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/Footer/Footer'

function Login() {
  const { login, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)
  const { register, handleSubmit } = useForm({
    defaultValues: { email: '', password: '' },
  })

  const from = location.state?.from?.pathname || '/dashboard'

  const onSubmit = async (values) => {
    try {
      setSubmitting(true)
      await login({ email: values.email, password: values.password })
      toast.success('Logged in successfully')
      navigate(from, { replace: true })
    } catch (error) {
      toast.error(error?.message || 'Unable to log in')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      setGoogleSubmitting(true)
      await signInWithGoogle()
      toast.success('Signed in with Google')
      navigate(from, { replace: true })
    } catch (error) {
      toast.error(error?.message || 'Unable to sign in with Google')
    } finally {
      setGoogleSubmitting(false)
    }
  }

  return (
    <div className="public-shell">
      <div className="public-frame">
        <Navbar />
        <section className="auth-grid" style={{ marginTop: 24 }}>
          <div className="auth-hero">
            <div className="hero-copy">
              <span className="eyebrow">
                <Sparkles size={16} />
                Email campaigns, organized
              </span>
              <h1 className="hero-title">Launch bulk email workflows without losing control.</h1>
              <p className="hero-subtitle">
                Upload recipients from Excel, compose reusable templates, add attachments, and track every send in a single dashboard.
              </p>

              <div className="hero-badges">
                <span className="hero-badge"><ShieldCheck size={16} /> Secure session gate</span>
                <span className="hero-badge"><Mail size={16} /> Template editor</span>
                <span className="hero-badge"><Sparkles size={16} /> Delivery history</span>
              </div>
            </div>

          </div>

          <div className="auth-panel">
            <div className="page-header">
              <div>
                <h2 className="page-title">Sign in</h2>
                <p className="page-subtitle">Use your account to access the dashboard.</p>
              </div>
            </div>

            <div className="auth-stack">
              <Button variant="secondary" className="google-button" type="button" onClick={handleGoogleAuth} loading={googleSubmitting}>
                <span className="google-mark" aria-hidden="true">
                  G
                </span>
                Continue with Google
              </Button>

              <div className="auth-divider">
                <span>or use email</span>
              </div>
            </div>

            <form className="form" onSubmit={handleSubmit(onSubmit)}>
              <div className="field">
                <label htmlFor="login-email">Email</label>
                <input id="login-email" className="input" placeholder="Enter your Gmail address" type="email" {...register('email', { required: true })} />
              </div>
              <div className="field">
                <label htmlFor="login-password">Password</label>
                <input id="login-password" className="input" placeholder="Enter your Gmail Password" type="password" {...register('password', { required: true })} />
              </div>
              <Button type="submit" loading={submitting}>Login</Button>
            </form>

            <p className="auth-footer" style={{ marginTop: 16 }}>
              New here? <Link to="/register">Create an account</Link>
            </p>
          </div>
        </section>
        <Footer />
      </div>
    </div>
  )
}

export default Login