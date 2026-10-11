/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#24312C',
    tint: '#607C69',
    background: '#F7F6F0',
    foreground: '#24312C',
    card: '#FFFFFF',
    cardForeground: '#24312C',
    primary: '#607C69',
    primaryForeground: '#FFFFFF',
    secondary: '#E9EEE7',
    secondaryForeground: '#405448',
    muted: '#F0F0E9',
    mutedForeground: '#78817A',
    accent: '#E3EADF',
    accentForeground: '#405448',
    destructive: '#B85B4E',
    destructiveForeground: '#FFFFFF',
    border: '#E5E6DD',
    input: '#E5E6DD',
  },

  radius: 18,
};

export default colors;
