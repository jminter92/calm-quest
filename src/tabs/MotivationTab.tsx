const reminders = [
  {
    title: 'A lower baseline is the win',
    text: 'The aim is not a heroic perfect day. It is a calmer default that becomes easier to repeat.'
  },
  {
    title: 'Data beats guilt',
    text: 'A logged setback is still useful information. It shows where the next plan needs support.'
  },
  {
    title: 'Cravings pass through',
    text: 'Most urges rise, peak, and fade. Give yourself ten minutes before deciding.'
  },
  {
    title: 'Reduce friction',
    text: 'Make the lower-caffeine option the easiest option before the tired moment arrives.'
  },
  {
    title: 'Small drops count',
    text: 'Half a shot less is not tiny when it compounds across a week.'
  }
];

export function MotivationTab() {
  return (
    <section className="screen">
      <div className="screen-heading centered-heading">
        <h1>Motivation</h1>
      </div>

      <div className="quote-stack">
        {reminders.map((reminder) => (
          <article className="quote-card" key={reminder.title}>
            <h2>{reminder.title}</h2>
            <p>{reminder.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
