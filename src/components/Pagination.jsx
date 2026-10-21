export default function Pagination({ page, pageCount, onPageChange, label = 'Teams pagination' }) {
  if (pageCount < 2) return null;
  return (
    <nav className="pagination" aria-label={label}>
      <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)}>Previous</button>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
        <button key={number} type="button" aria-label={`Page ${number}`} aria-current={page === number ? 'page' : undefined} onClick={() => onPageChange(number)}>{number}</button>
      ))}
      <button type="button" disabled={page === pageCount} onClick={() => onPageChange(page + 1)}>Next</button>
    </nav>
  );
}
