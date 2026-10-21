const dateFormat = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTimeFormat = new Intl.DateTimeFormat('en', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
});

export default function DateLabel({ value, includeTime = false }) {
  return <time dateTime={value}>{(includeTime ? dateTimeFormat : dateFormat).format(new Date(value))}</time>;
}
