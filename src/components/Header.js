import React from 'react';
import { Link } from 'gatsby';

import Container from 'components/Container';

const Header = () => {
  return (
    <header>
      <Container type="content">
        <p>COVID-19 EU MAP</p>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
        </ul>
      </Container>
    </header>
  );
};

export default Header;
