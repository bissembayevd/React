import { ArrowUpRight } from 'lucide-react';

import { Link } from 'react-router-dom';

import DateLabel from './DateLabel';

import NewsImage from './NewsImage';
import { withoutEditionMarker, articleSummary } from '../utils/displayText';



export default function NewsCard({ article, featured = false }) {
  const summary = articleSummary(article.summary);

  return (

    <article className={featured ? 'news-card news-card-featured' : 'news-card'}>

      <Link className="news-card-link" to={`/news/${article.id}`}>

        <NewsImage className="news-image" article={article} loading={featured ? 'eager' : 'lazy'} />

        <div className="news-card-body">

          <div className="news-meta"><span className="category-label">{article.category}</span><DateLabel value={article.publishedAt} /></div>

          <h3>{withoutEditionMarker(article.title)}</h3>

          {featured && summary && <p className="news-summary">{summary}</p>}

          {featured && <span className="text-link">Read story <ArrowUpRight size={16} aria-hidden="true" /></span>}

        </div>

      </Link>

    </article>

  );

}

