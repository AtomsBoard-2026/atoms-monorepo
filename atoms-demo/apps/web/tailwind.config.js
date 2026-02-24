const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    join(__dirname, '../../libs/ui-kit/src/**/*!(*.stories|*.spec).{ts,tsx,html}')
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
