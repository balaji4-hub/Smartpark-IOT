import Reveal from './Reveal.jsx';

export default function SectionHeading({ eyebrow, title, highlight, description, align = 'left' }) {
  return (
    <Reveal className={`section-heading section-heading--${align}`}>
      <span className="eyebrow"><span className="eyebrow-line" />{eyebrow}</span>
      <h2>
        {title} {highlight && <span className="gradient-text">{highlight}</span>}
      </h2>
      {description && <p>{description}</p>}
    </Reveal>
  );
}
