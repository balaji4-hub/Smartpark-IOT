import { motion } from 'framer-motion';
import { ArrowRight, Check, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { API_URL } from '../config.js';
import Reveal from './Reveal.jsx';

export default function CTA() {
  const [form, setForm] = useState({ name: '', email: '' });
  const [status, setStatus] = useState('idle');

  const submit = async (event) => {
    event.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch(`${API_URL}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, message: 'SmartPark demo request' })
      });
      if (!response.ok) throw new Error('Request failed');
      setStatus('sent');
    } catch {
      setStatus('offline');
    }
  };

  return (
    <section className="section cta-section" id="contact">
      <div className="container">
        <Reveal>
          <div className="cta-card">
            <div className="cta-glow" aria-hidden="true" />
            <div className="cta-copy">
              <span className="eyebrow"><span className="eyebrow-line" /> START YOUR DEPLOYMENT</span>
              <h2>Ready for a <span className="gradient-text">smarter lot?</span></h2>
              <p>Tell us about your site. We'll map your sensors, zones and hardware into a live digital twin.</p>
              <ul className="cta-list">
                <li><Check size={15} /> Architecture review for your parking site</li>
                <li><Check size={15} /> Hardware and protocol recommendations</li>
                <li><Check size={15} /> Walkthrough of the live 3D dashboard</li>
              </ul>
            </div>

            <form className="cta-form" onSubmit={submit}>
              <label>
                <span>Your name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Alex Morgan"
                  required
                />
              </label>
              <label>
                <span>Work email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="alex@company.com"
                  required
                />
              </label>
              <button className="button button--primary button--wide" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? <><LoaderCircle size={17} className="spin" /> Sending…</> : <>Request a demo <ArrowRight size={17} /></>}
              </button>
              <p className="form-note">No spam. Just a short note about your project.</p>
              {status === 'sent' && <motion.p className="form-success" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>Request received — we'll be in touch.</motion.p>}
              {status === 'offline' && <motion.p className="form-success" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>Demo mode: request captured locally. Start the backend to store it.</motion.p>}
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
