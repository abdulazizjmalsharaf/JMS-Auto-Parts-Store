// Optional scene metadata for Replit workspace integrations. When the
// workspace's scene controls are enabled for this project, a viewer's click on
// a scene segment scopes their next chat request to that scene's source file.
// Fill one entry per SCENE_DURATIONS key in VideoTemplate.tsx only when a
// skill reference asks for it; otherwise leave the map empty. Scenes missing
// from the map still play and can be jumped to.
//
// Example:
//   export const SCENE_DETAILS: Record<string, SceneDetails> = {
//     open: { title: 'Intro', filePath: 'src/components/video/video_scenes/Scene1.tsx' },
//   };

export interface SceneDetails {
  title: string;
  filePath: string;
}

export const SCENE_DETAILS: Record<string, SceneDetails> = {
  hook: { title: "Don't Overpay", filePath: 'src/components/video/HookScene.tsx' },
  products: { title: 'Parts & Origins', filePath: 'src/components/video/ProductsScene.tsx' },
  benefit: { title: 'Quality & Value', filePath: 'src/components/video/BenefitScene.tsx' },
  brand: { title: 'JMS Brand', filePath: 'src/components/video/BrandScene.tsx' },
  cta: { title: 'Shop Now', filePath: 'src/components/video/CallToActionScene.tsx' },
};
