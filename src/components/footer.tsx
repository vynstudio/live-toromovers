export function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <a href="#" className="brand">
            Grace<span className="ampersand"> &amp;</span> Co.
          </a>
          <p>Residential care for the homes of Northeast Florida.</p>
        </div>
        <div className="footer-col">
          <h4>Service</h4>
          <ul>
            <li><a href="#">Deep Reset</a></li>
            <li><a href="#">Maintenance</a></li>
            <li><a href="#">Transition Care</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>House</h4>
          <ul>
            <li><a href="#">Our standard</a></li>
            <li><a href="#">Areas served</a></li>
            <li><a href="#">Questions</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:hello@grace-co.com">hello@grace-co.com</a></li>
            <li><a href="tel:9045550000">(904) 555&middot;0000</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; 2026 Grace &amp; Co. &middot; Northeast Florida</span>
        <span>Bonded &middot; Insured &middot; Background-checked</span>
      </div>
    </footer>
  );
}
