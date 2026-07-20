// postcss.config.mjs
//
// Tailwind v4 migration — Estimating ও PM app-এর postcss.config.mjs-এর
// সাথে হুবহু মিলিয়ে। v3-এর tailwindcss+autoprefixer আলাদা plugin
// থেকে v4-এর একক @tailwindcss/postcss plugin-এ (autoprefixer
// built-in)।

const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
