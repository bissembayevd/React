export default function RequestState({ title, message, error = false, onRetry, actionLabel = 'Try again' }) {
  return (
    <div className="directory-state" role={error ? 'alert' : 'status'}>
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {onRetry && <button type="button" className="button" onClick={onRetry}>{actionLabel}</button>}
    </div>
  );
}
