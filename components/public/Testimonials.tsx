const testimonials = [
  {
    name: "Joshua O.",
    quote:
      "Working with this developer was a great experience. They delivered the web app professionally, communicated clearly throughout the project, and paid attention to the details I requested. The final result met my expectations and was delivered on time. I appreciate their dedication, responsiveness, and willingness to make adjustments when needed. I would gladly work with them again and highly recommend their services to anyone looking for a reliable web app developer.",
  },
  {
    name: "Oliver G.",
    quote:
      "Words are not enough to describe what Obadasa did for me and my team he helped us fixed the issue that has been causing us huge loss in revenue he fixed it within the delivery date and overdelivered. I can vouch and endorse him, He is honest and easygoing",
  },
  {
    name: "Norman L.",
    quote:
      "Working with Obadasa was a great experience. From the beginning, they understood exactly what I needed and delivered work that matched my expectations. Communication was clear, updates were consistent, and every request I made was handled quickly and carefully. The quality of the final delivery was excellent, and I appreciated how proactive they were throughout the project. I would absolutely hire Obadasa again and confidently recommend them to anyone looking for someone who delivers quality work and makes the entire process easy.",
  },
] as const;

export function Testimonials() {
  return (
    <section
      className="wrap section testimonials-section"
      id="testimonials"
      aria-labelledby="testimonials-heading"
    >
      <div className="section-head">
        <div className="chapter">03 / Client endorsements</div>
        <h2 className="section-title" id="testimonials-heading">
          Good work,<br /><span className="display-serif">in their words.</span>
        </h2>
        <p className="section-sub">Verified feedback from past clients on Upwork.</p>
      </div>
      <div className="testimonial-grid">
        {testimonials.map((testimonial, index) => (
          <figure className="testimonial-card" key={testimonial.name}>
            <div className="testimonial-meta">
              <span>Upwork</span>
              <span>Verified · Aug 2026</span>
            </div>
            <blockquote>{testimonial.quote}</blockquote>
            <figcaption>
              <span className="testimonial-index">0{index + 1}</span>
              <strong>{testimonial.name}</strong>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
