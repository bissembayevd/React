import { useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNewsById } from '../services/api';
import useApiResource from '../hooks/useApiResource';
import RequestState from '../components/RequestState';
import NewsImage from '../components/NewsImage';
import DateLabel from '../components/DateLabel';
import { withoutEditionMarker, articleParagraphs, articleSummary } from '../utils/displayText';
import '../styles/news.css';

export default function NewsDetails() {
  const { newsId } = useParams();
  return <Article key={newsId} newsId={newsId} />;
}

function Article({ newsId }) {
  const load = useCallback((options) => getNewsById(newsId, options), [newsId]);
  const { status, data: article, error, retry } = useApiResource(load);
  const missing = error?.code === 'NOT_FOUND' || error?.code === 'INVALID_ID';
  const summary = article ? articleSummary(article.summary) : '';
  return <div className="news-details-page">
    <Link className="back-link" to="/">← Back to home</Link>
    {status === 'loading' && <RequestState title="Loading article…" />}
    {status === 'error' && <RequestState error title={missing ? 'Article not found' : 'Unable to load article'} message={error?.message} onRetry={missing ? undefined : retry} />}
    {status === 'success' && <article>
      <header><div className="news-meta"><span className="category-label">{article.category}</span><DateLabel value={article.publishedAt} /></div><h1>{withoutEditionMarker(article.title)}</h1>{summary && <p className="article-summary">{summary}</p>}</header>
      <NewsImage article={article} className="article-image" loading="eager" />
      <div className="article-content">{articleParagraphs(article.content).map((paragraph, index) => <p key={`${article.id}-${index}`}>{paragraph}</p>)}</div>
      {article.relatedTeamId && <Link className="text-link" to={`/teams/${article.relatedTeamId}`}>View related team →</Link>}
    </article>}
  </div>;
}
