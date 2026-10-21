export const NEWS_IMAGES = {
  'news-001': '',
  'news-002': '',
  'news-003': '',
  'news-004': '',
  'news-005': '',
  'news-006': '',
  'news-007': '',
  'news-008': '',
  'news-009': '',
  'news-010': '',
  'news-011': '',
  'news-012': '',
  'news-013': '',
  'news-014': '',
  'news-015': '',
  'news-016': '',
  'news-017': '',
  'news-018': '',
  'news-019': '',
  'news-020': '',
  'news-021': '',
  'news-022': '',
  'news-023': '',
  'news-024': 'betboom.avif',
  'news-025': 'navi.avif',
  'news-026': 'vitality.avif',
  'news-027': 'faze.jpg',
  'news-028': 'g2.jpg',
  'news-029': 'spirit.avif',
  'news-030': 'mouz.avif',
};

export function newsImageSources(article, filenames = NEWS_IMAGES) {
  const filename = filenames[article.id]?.trim();
  return {
    src: filename ? `/images/news/${encodeURIComponent(filename)}` : article.image,
    fallback: [article.image, '/images/news-placeholder.svg'],
  };
}
