import { UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Button from '../components/Button/Button'
import Navbar from '../components/Navbar/Navbar'
import { useAuth } from '../context/AuthContext'

function Register() {
  const { register: createAccount, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)
  const { register, handleSubmit } = useForm()

  const onSubmit = async (values) => {
    try {
      setSubmitting(true)
      await createAccount({ name: values.name, email: values.email, password: values.password })
      toast.success('Account created successfully')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      toast.error(error?.message || 'Unable to create account')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleRegister = async () => {
    try {
      setGoogleSubmitting(true)
      await signInWithGoogle()
      toast.success('Registered with Google')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      toast.error(error?.message || 'Unable to sign up with Google')
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
                <UserPlus size={16} />
                Join the workspace
              </span>
              <h1 className="hero-title">Set up your mail operations team in minutes.</h1>
              <p className="hero-subtitle">
                Create one shared place for uploads, email content, attachments, and reporting. This scaffold is ready to connect to your backend.
              </p>
            </div>
          </div>

          <div className="auth-panel">
            <div className="page-header">
              <div>
                <h2 className="page-title">Create account</h2>
                <p className="page-subtitle">Start using the dashboard with a few details.</p>
              </div>
            </div>

            <div className="auth-stack">
              <Button variant="secondary" className="google-button" type="button" onClick={handleGoogleRegister} loading={googleSubmitting}>
                <span className="google-mark" aria-hidden="true">
                  G
                </span>
                Continue with Google
              </Button>

              <div className="auth-divider">
                <span>or sign up manually</span>
              </div>
            </div>

            <form className="form" onSubmit={handleSubmit(onSubmit)}>
              <div className="field">
                <label htmlFor="register-name">Full name</label>
                <input id="register-name" className="input" {...register('name', { required: true })} />
              </div>
              <div className="field">
                <label htmlFor="register-email">Email</label>
                <input id="register-email" className="input" type="email" {...register('email', { required: true })} />
              </div>
              <div className="field">
                <label htmlFor="register-password">Password</label>
                <input id="register-password" className="input" type="password" {...register('password', { required: true })} />
              </div>
              <Button type="submit" loading={submitting}>Register</Button>
            </form>

            <p className="auth-footer" style={{ marginTop: 16 }}>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Register