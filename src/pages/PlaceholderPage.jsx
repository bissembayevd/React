import PageHeader from '../components/PageHeader';
import PlaceholderPanel from '../components/PlaceholderPanel';

export default function PlaceholderPage({ title, description, panelTitle, panelDescription }) {
  return <><PageHeader title={title} description={description} /><PlaceholderPanel title={panelTitle} description={panelDescription} /></>;
}
