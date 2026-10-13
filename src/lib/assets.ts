/** Public files must stay under the deployment base, including on GitHub Pages. */
export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
