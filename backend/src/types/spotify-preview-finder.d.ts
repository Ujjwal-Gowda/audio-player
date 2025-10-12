declare module "spotify-preview-finder" {
  const SpotifyPreviewFinder: {
    getPreviewUrl: (spotifyId: string) => Promise<string | null>;
  };
  export default SpotifyPreviewFinder;
}
