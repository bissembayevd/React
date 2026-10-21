import SafeImage from './SafeImage';
import { newsImageSources } from '../config/newsImages';


export default function NewsImage({ article, className, loading = 'lazy' }) {
  const { src, fallback } = newsImageSources(article);
  return <SafeImage src={src} fallback={fallback} className={className} loading={loading} alt="" />;
}
