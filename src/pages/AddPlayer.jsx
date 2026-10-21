import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addPlayer, PLAYER_ROLES } from '../services/api';
import { validatePlayerForm, toPlayerData } from '../utils/playerForm';
import { PLAYER_COUNTRIES } from '../data/countries';
import PageHeader from '../components/PageHeader';
import '../styles/teams.css';
import '../styles/players.css';

const emptyForm = { nickname: '', firstName: '', lastName: '', nationality: '', age: '', role: '', rating: '' };
const fields = [
  ['nickname', 'Nickname', 'text'], ['firstName', 'First name', 'text'], ['lastName', 'Last name', 'text'],
  ['nationality', 'Nationality', 'select'], ['age', 'Age', 'number'], ['role', 'Role', 'select'], ['rating', 'Rating', 'number'],
];

export default function AddPlayer() {
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submission, setSubmission] = useState({ status: 'idle', error: '' });
  const mounted = useRef(false);
  const inFlight = useRef(false);
  const requestController = useRef(null);
  const navigate = useNavigate();
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; requestController.current?.abort(); }; }, []);
  const submitting = submission.status === 'loading';

  function update(field, value) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setSubmission({ status: 'idle', error: '' });
  }
  function reset() { setValues(emptyForm); setErrors({}); setSubmission({ status: 'idle', error: '' }); }
  async function submit(event) {
    event.preventDefault();
    if (inFlight.current) return;
    const validation = validatePlayerForm(values, PLAYER_ROLES);
    setErrors(validation);
    if (Object.keys(validation).length) { setSubmission({ status: 'invalid', error: '' }); return; }
    inFlight.current = true;
    requestController.current = new AbortController();
    setSubmission({ status: 'loading', error: '' });
    try {
      const player = await addPlayer(toPlayerData(values), { signal: requestController.current.signal });
      if (mounted.current) navigate(`/players/${player.id}`, { replace: true, state: { playerCreated: player.id } });
    } catch (error) {
      if (mounted.current) setSubmission({ status: 'error', error: error.message || 'Unable to save this player. Please try again.' });
    } finally { inFlight.current = false; }
  }
  return <div className="add-player-page"><Link className="back-link" to="/free-agents">← All free agents</Link><PageHeader eyebrow="JOIN THE DIRECTORY" title="Add a player." description="Create a free agent. Their profile will be saved to the database." />
    <form className="player-form" onSubmit={submit} noValidate aria-busy={submitting}>
      {submission.status === 'invalid' && <p className="form-feedback form-error" role="alert">Please correct the highlighted fields.</p>}
      {submission.status === 'error' && <p className="form-feedback form-error" role="alert">{submission.error}</p>}
      <fieldset disabled={submitting}><legend className="form-legend">Player information</legend><div className="player-form-grid">
        {fields.map(([field, label, type]) => <div className="form-field" key={field}><label htmlFor={`player-${field}`}>{label} <span aria-hidden="true">*</span></label>
          {type === 'select' ? <select id={`player-${field}`} value={values[field]} onChange={(event) => update(field, event.target.value)} required aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `${field}-error` : undefined}><option value="">{field === 'nationality' ? 'Choose a nationality' : 'Choose a role'}</option>{(field === 'nationality' ? PLAYER_COUNTRIES : PLAYER_ROLES).map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input id={`player-${field}`} type={type} value={values[field]} onChange={(event) => update(field, event.target.value)} required maxLength={type === 'text' ? 80 : undefined} min={field === 'age' ? 16 : field === 'rating' ? 0 : undefined} max={field === 'age' ? 45 : field === 'rating' ? 3 : undefined} step={field === 'age' ? 1 : field === 'rating' ? 'any' : undefined} aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `${field}-error` : undefined} />}
          {errors[field] && <p className="field-error" id={`${field}-error`}>{errors[field]}</p>}
        </div>)}
      </div><div className="player-form-actions"><button className="button" type="submit">{submitting ? 'Saving player…' : 'Create player'}</button><button className="directory-reset" type="button" onClick={reset}>Reset form</button></div></fieldset>
      {submitting && <p className="form-feedback" role="status">Saving your player. Please wait…</p>}
    </form>
  </div>;
}
